/* eslint-disable @typescript-eslint/no-empty-function */
// #region IMPORTS
import type Ray             from '../ray/Ray';
import type { Object3D }    from 'three';
import type { PlaneMovement, IPlaneMovementHandler } from '../actions/PlaneMovement';

import { Group, Mesh, MeshBasicMaterial, DoubleSide } from 'three';
import intersectPlane   from '../ray/intersectPlane';
import StateProxy       from '../util/StateProxy';
import arrowArcShape    from '../geo/ArrowArc';
import Util3JS          from '../render/Util3JS';
import Vec3             from '../maths/Vec3';
import Quat             from '../maths/Quat';
// #endregion

const X_COLOR = 0xF75D6C;
const Y_COLOR = 0x47ED6D;
const Z_COLOR = 0x0196FF;

export default class RotationGizmo extends Group implements IGizmo, IPlaneMovementHandler { 
    // #region MAIN
    _hitPos   = new Vec3();          // Last hit position
    _xAxis    = new Vec3( [1,0,0] ); // Axes to move on
    _yAxis    = new Vec3( [0,1,0] );
    _zAxis    = new Vec3( [0,0,1] );
    _axes     : Array< Vec3 > = [ this._xAxis, this._yAxis, this._zAxis ];

    _camScale = 1;      // Scale gizmo by cam distances
    _selAxis  = -1;
    _isDirty  = false;
    _range    = 0.3;   // Hit Range
    _radius   = 1;

    state     = StateProxy.new({
        scaleFactor : 6,            // Lock size by camera distance
        position    : [0,0,0],      // Final position
        rotation    : [0,0,0,1],    // Orientation
        target      : null,         // Attached Object
    });

    constructor(){
        super();

        const proxy = this.state.$;
        proxy.on( 'change', this.onStateChange );

        buildMeshes( this );
        this._render();
    }

    onStateChange = ( e: CustomEvent )=>{
        switch( e.detail.prop ){            
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'rotation' :{
                this._xAxis.fromQuat( this.state.rotation, [1,0,0] );
                this._yAxis.fromQuat( this.state.rotation, [0,1,0] );
                this._zAxis.fromQuat( this.state.rotation, [0,0,1] );
                
                this.quaternion.fromArray( this.state.rotation );
                this.state.target?.quaternion.fromArray( this.state.rotation );
                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'target'    :{
                if( e.detail.value ){
                    const pos = e.detail.value.position.toArray();
                    const rot = e.detail.value.quaternion.toArray();
                    this.state.$.update( { position:pos, rotation:rot }, false ); // Dont Emit Change
                    this.position.fromArray( pos );
                    this.quaternion.fromArray( rot );
                }
                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'position'  :
                this.position.fromArray( this.state.position );
                this.state.target?.position.fromArray( this.state.position );
                break;
        }
    };
    // #endregion

    // #region METHODS
    forceScale( scl: number ){
        this._camScale = scl;
        this.scale.setScalar( scl );
        this._render();
    }

    setTarget( o: Object3D ): this{ this.state.target = o; return this; }
    // #endregion

    // #region GIZMO INTERFACE
    // Handle Over event, change visual look when mouse is over gizmo
    onHover( ray: Ray ){
        const hit = this._isHit( ray );

        if( this._isDirty ){
            this._isDirty = false;
            this._render();
        }

        return hit;
    }

    // Which action to perform on mouse down?
    onDown( ray: Ray ){ //, g: Gizmos
        const hit = this._isHit( ray );     
        return ( hit )? 'angle' : null; 
    }
    
    onCameraScale( camPos: ConstVec3 ){
        // Can view scaleFactor as the distance from the camera you want
        // to keep the object always at. Factor of 2 will always render as 
        // if its locked at 2 units away from the camera.
        const scl = Vec3.dist( camPos, this.state.position ) / this.state.scaleFactor;
        if( scl !== this._camScale ) this.forceScale( scl );
    }

    onUp(){}
    onDragStart(){} // this.visible = false;
    onDragEnd(){} // this.visible = true;
    // #endregion

    // #region PLANE ACTION INTERFACE
    // set initial values for action
    onPlaneInit( action: PlaneMovement ){
        const p = this.state.position;
        const z = this._axes[ this._selAxis ];              // Selected axis is FORWARD
        const y = new Vec3().fromSub( this._hitPos, p );    // Define UP
        const x = new Vec3().fromCross( y, z ).norm();      // Ortho RIGHT
        y.fromCross( z, x ).norm();                         // Make UP ortho

        // Configure action for visualization
        action
            .setOrigin( p )
            .setAxes( x, y, z )
            .setScale( this._camScale );
    }

    // get action results on drag
    onPlaneUpdate( action: PlaneMovement, isDone: boolean ){
        const twist = new Quat().fromAxisAngle( action.zAxis, action.dragAngle );
        const rot   = twist.clone().mul( this.state.rotation );

        this.quaternion.fromArray( rot );
        this.state?.target.quaternion.fromArray( rot );

        action.events.emit( 'rotation', { 
            rotation    : rot.slice(),  // clone data, dont want reciever to have reference to internal rot
            twist       : twist,        // Pass the rotation change just incase
            gizmo       : this, 
            isDone
        });

        if( isDone ) this.state.rotation = rot;
    }
    // #endregion

    // #region SUPPORT
    _isHit( ray: Ray ): boolean{
        const pos   = this.state.position;
        const rng   = this._range  * this._camScale;    // Camera Scaled Hit Range
        const rus   = this._radius * this._camScale;    // Camera Scaled Radius
        const pnt   = new Vec3();
        let min     = Infinity;
        let sel     = -1;
        let t: number | null;
        let d: number;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( let i=0; i < 3; i++ ){
            // -----------------------------
            // Test ray on each axis plane
            t = intersectPlane( ray, pos, this._axes[ i ] );
            if( t === null ) continue;

            // -----------------------------
            // Test radius range
            ray.posAt( t, pnt );
            d = Math.abs( rus - Vec3.dist( pnt, pos ) );
            if( d > rng ) continue;

            // -----------------------------
            // Is it the closest point?
            if( t < min ){
                min = t;
                sel = i;
                this._hitPos.copy( pnt );
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Test 90 Degree Arc
        if( sel !== -1 ){
            const dir = new Vec3().fromSub( this._hitPos, pos ).norm();

            // Exclude if its outside the 90 Degree Arc
            if( Vec3.dot( dir, this._axes[ ( sel + 1 ) % 3 ] ) < 0 ||
                Vec3.dot( dir, this._axes[ ( sel + 2 ) % 3 ] ) < 0 ){
                sel = -1;
                min = Infinity;
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this._selAxis !== sel ) this._isDirty = true;

        this._selAxis = sel;
        return ( min !== Infinity );
    }

    _render(){
        const sel: number   = this._selAxis;
        const cx : number   = ( sel === 0 )? 0xffffff : X_COLOR;
        const cy : number   = ( sel === 1 )? 0xffffff : Y_COLOR;
        const cz : number   = ( sel === 2 )? 0xffffff : Z_COLOR;

        // @ts-expect-error: 2339 Material does exist
        this.children[0].material.color.setHex( cx );
        // @ts-expect-error: 2339
        this.children[1].material.color.setHex( cy );
        // @ts-expect-error: 2339
        this.children[2].material.color.setHex( cz );
    }
    // #endregion
}

function buildMeshes( root: Object3D ): Array<Mesh>{
    const shape  = arrowArcShape();

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const geo = Util3JS.geoBuffer( { vertices: new Float32Array( shape.vertices ), indices: new Uint16Array( shape.indices ) } );
    geo.computeVertexNormals();

    const xMesh = new Mesh( geo, new MeshBasicMaterial( { side: DoubleSide, color: X_COLOR } ) );
    xMesh.rotation.y = Math.PI * -0.5;
    root.add( xMesh );

    const yMesh = new Mesh( geo, new MeshBasicMaterial( { side: DoubleSide, color: Y_COLOR } ) );
    yMesh.rotation.x = Math.PI * 0.5;
    root.add( yMesh );

    const zMesh = new Mesh( geo, new MeshBasicMaterial( { side: DoubleSide, color: Z_COLOR } ) );
    zMesh.rotation.x = Math.PI;
    zMesh.rotation.z = Math.PI * -0.5;
    root.add( zMesh );

    return [ xMesh, yMesh, zMesh ];
}