// #region IMPORTS
/* eslint-disable @typescript-eslint/no-explicit-any */
import type Ray                           from '../ray/Ray';
import type { 
    PlaneMovement, IPlaneMovementHandler 
} from '../actions/PlaneMovement';

import { intersectSphere }  from '../ray/intersectSphere';
import StateProxy           from '../util/StateProxy';
import Vec3                 from '../maths/Vec3';
import Quat                 from '../maths/Quat';

import Util3JS              from '../render/Util3JS';
import tearShape            from '../geo/Tear';

import {
    Group,
    MeshBasicMaterial, 
    Mesh,
    DoubleSide,
 } from 'three';
// #endregion

export default class TwistGizmo extends Group implements IGizmo, IPlaneMovementHandler{
    // #region MAIN
    _shape !: Mesh;
    _mat    : any;
    _xDir   = new Vec3( [1,0,0] );  // Generate Axes
    _yDir   = new Vec3( [0,1,0] );
    _zDir   = new Vec3( [0,0,1] );
    _isOver = false;

    state   = StateProxy.new({
        rotation  : [0,0,0,1],
        position  : [0,0,0],      // Final position
        scale     : 1,            // How to scale the gizmo & action
    });
    
    constructor(){
        super();

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const proxy = this.state.$;
        proxy.on( 'change', this.onStateChange );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const geo   = Util3JS.geoBuffer( tearShape() );
        geo.computeVertexNormals();

        this._mat   = new MeshBasicMaterial( { side : DoubleSide, color:0xffffff } );
        this._shape = new Mesh( geo, this._mat );
        this.add( this._shape );
    }

    onStateChange = ( e: CustomEvent )=>{
        switch( e.detail.prop ){            
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'rotation' :{
                this._xDir.fromQuat( this.state.rotation, [1,0,0] );
                this._yDir.fromQuat( this.state.rotation, [0,1,0] );
                this._zDir.fromQuat( this.state.rotation, [0,0,1] );
                this._render();
                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'position' : this.position.fromArray( this.state.position ); break;
            case 'scale'    : this.scale.setScalar( this.state.scale ); break;
        }
    };
    // #endregion

    // #region GIZMO INTERFACE
    // Handle Over event, change visual look when mouse is over gizmo
    onHover( ray: Ray ){
        const hit = this._isHit( ray );
        
        if( this._isOver !== hit ){
            this._isOver = hit;
            this._render();
        }

        return hit;
    }

    // Which action to perform on mouse down?
    onDown( ray: Ray ){
        const hit = ( this._isHit( ray ) );        
        return ( hit )? 'angle' : null; 
    }

    // Handle action completion
    onUp(){
        this._isOver = false;
        this._render();
    }

    onDragStart(): void{ this.visible = false; }
    onDragEnd(): void { this.visible = true; }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCameraScale(): void{} // _camPos: ConstVec3
    // #endregion

    // #region PLANE ACTION INTERFACE
    // set initial values for action
    onPlaneInit( action: PlaneMovement ){   
        action
            .setOrigin( this.state.position )
            .setQuatDir( this.state.rotation )
            .setScale( this.state.scale );
    }

    // get action results on drag
    onPlaneUpdate( action: PlaneMovement, isDone: boolean ){
        const q = new Quat()
            .fromAxisAngle( action.zAxis, action.dragAngle )
            .mul( action.rotation );

        if( isDone ) this.state.rotation = q;

        action.events.emit( 'twist', { rotation:q, yaxis:action.dragDir.slice(), gizmo:this, isDone } );
    }
    // #endregion

    // #region SUPPORT
    _render(){
        const color = this._isOver? 0xffffff : 0x999999;
        this._mat.color.set( color );

        this.quaternion.fromArray( this.state.rotation );
    }

    _isHit( ray: Ray ){
        return intersectSphere( ray, this.state.position, this.state.scale );
    }
    // #endregion
}