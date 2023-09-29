/* eslint-disable @typescript-eslint/no-empty-function */
// #region IMPORTS
import type Ray                           from '../ray/Ray';
import type { Object3D }                  from 'three';
import type { LineMovement, ILineMovementHandler } from '../actions/LineMovement';
import { Group }                          from 'three';

import { nearSegment, NearSegmentResult } from '../ray/nearSegment';
import { intersectSphere }                from '../ray/intersectSphere';
import StateProxy                         from '../util/StateProxy';
import DynLineMesh                        from '../render/DynLineMesh';
import Vec3                               from '../maths/Vec3';
// #endregion

export default class TranslateGizmo extends Group implements IGizmo, ILineMovementHandler{
    // #region MAIN
    _ln       = new DynLineMesh();   // Render Gizmo
    _hitPos   = new Vec3();          // Last hit position
    _xAxis    = new Vec3( [1,0,0] ); // Axes to move on
    _yAxis    = new Vec3( [0,1,0] );
    _zAxis    = new Vec3( [0,0,1] );
    _axes     : Array< Vec3 > = [ this._xAxis, this._yAxis, this._zAxis ];
    _result   = new NearSegmentResult();

    _camScale = 1;          // Scale gizmo by cam distances
    _range    = 0.1;        // Hit Range
    _selAxis  = -1;         // Which axis was selected
    _isDirty  = false;      // Do a rerender

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

        this.add( ( this._ln as unknown as Object3D ) );
        this.render();
    }

    onStateChange = ( e: CustomEvent )=>{
        switch( e.detail.prop ){            
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'rotation' :{
                this._xAxis.fromQuat( this.state.rotation, [1,0,0] );
                this._yAxis.fromQuat( this.state.rotation, [0,1,0] );
                this._zAxis.fromQuat( this.state.rotation, [0,0,1] );
                this.render();
                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'target'    :{
                if( e.detail.value ){
                    const pos = e.detail.value.position.toArray();
                    this.state.$.update( { position:pos }, false ); // Dont Emit Change
                    this.position.fromArray( pos );
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
    forceScale( scl:number ){
        this._camScale = scl;
        this._xAxis.norm().scale( scl );
        this._yAxis.norm().scale( scl );
        this._zAxis.norm().scale( scl );
        this.render();
    }

    setTarget( o: Object3D ): this{ this.state.target = o; return this; }
    // #endregin

    // #region GIZMO INTERFACE
    onCameraScale( camPos: ConstVec3 ){
        // Can view scaleFactor as the distance from the camera you want
        // to keep the object always at. Factor of 2 will always render as 
        // if its locked at 2 units away from the camera.
        const scl = Vec3.dist( camPos, this.state.position ) / this.state.scaleFactor;

        if( scl !== this._camScale ) this.forceScale( scl );
    }

    onHover( ray: Ray ){
        const hit = this._isHit( ray );
        if( this._isDirty ){
            this._isDirty = false;
            this.render();
        }
        return hit;
    }

    onDown( ray: Ray ){ return ( this._isHit( ray ) )? 'line' : null; }

    onUp(){
        this._selAxis = -1;
        this._isDirty = false;
        this.render();
    }

    onDragStart(): void{}
    onDragEnd(): void {}
    // #endregion

    // #region LINE ACTION HANDLERS
    onLineInit( action: LineMovement ){
        action.steps  = 0;
        action.incNeg = true;

        const tmp = new Vec3( this.state.position ).sub( this._hitPos );
        action.setOffset( tmp );

        action.setDirection( this._axes[ this._selAxis ] );
        action.setOrigin( this.state.position );
        action.recompute();
    }

    onLineUpdate( action: LineMovement, isDone: boolean ){
        const pos = action.dragPos.slice();
        this.state.position = pos;
        action.events.emit( 'translate', { position:pos, gizmo:this, isDone } );
    }
    // #endregion

    // #region SUPPORT
    _isHit( ray: Ray ){
        const origin : TVec3 = this.state.position;
        const v      = new Vec3();
        const rng    = this._range * this._camScale;
        let sel      = -1;
        let min      = Infinity;
        let axis     : Vec3;
        
        if( intersectSphere( ray, origin, this._camScale ) ){
            for( let i=0; i < 3; i++ ){
                axis = this._axes[ i ];
                v.fromScaleThenAdd( 1, axis, origin );

                if( nearSegment( ray, origin, v, this._result ) ){
                    if( this._result.distance > rng ||
                        this._result.distance >= min ) continue;

                    sel = i;
                    min = this._result.distance;
                    this._hitPos.copy( this._result.segPosition );
                }
            }
        }

        if( this._selAxis !== sel ) this._isDirty = true;

        this._selAxis = sel;
        return ( min !== Infinity );
    }

    render(){
        const sel = this._selAxis;
        this._ln.reset();
        this._ln.add( [0,0,0], this._xAxis, ( sel === 0 )? 0xffffff : 0x0000ff );
        this._ln.add( [0,0,0], this._yAxis, ( sel === 1 )? 0xffffff : 0x00ff00 );
        this._ln.add( [0,0,0], this._zAxis, ( sel === 2 )? 0xffffff : 0xff0000 );
    }
    // #endregion
}
