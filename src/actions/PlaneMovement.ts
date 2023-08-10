// #region IMPORT
import type Ray                             from '../ray/Ray';
import type EventDispatcher                 from '../util/EventDispatcher';
import intersectPlane                       from '../ray/intersectPlane'
import Vec3 from '../maths/Vec3';
import Quat from '../maths/Quat';
// #endregion

export interface IPlaneMovementHandler{
    onPlaneInit( ln: PlaneMovement ): void;
    onPlaneUpdate( action: PlaneMovement, isDone: boolean ): void;
}

export class PlaneMovement implements IAction{
    // #region MAIN
    dragPos   = new Vec3();             // current position when dragging
    dragDir   = new Vec3();             // Direction to drag point from origin
    dragAngle = 0;                      // Radian angle from yAxis

    steps     = 0;
    scale     = 1;
    origin    = new Vec3();
    xAxis     = new Vec3( 1, 0, 0 );
    yAxis     = new Vec3( 0, 1, 0 );
    zAxis     = new Vec3( 0, 0, 1 );   // Will be used as normal
    rotation  = new Quat();            // Rotation that represents the AXES

    gizmo     : IPlaneMovementHandler | null = null; // Active gizmo requestion this action
    events    : EventDispatcher;                     // Shared Event target to use for dispatching data, can be used by Gizmos

    constructor( et: EventDispatcher ){
        this.events = et;
    }
    // #endregion

    // #region METHODS
    _reset(){
        this.steps = 0;
        this.scale = 1;
    }

    setOrigin( v: ConstVec3 ){ this.origin.copy( v ); return this; }

    setQuatDir( q: ConstVec4 ){
        this.xAxis.fromQuat( q, [1,0,0] );
        this.yAxis.fromQuat( q, [0,1,0] );
        this.zAxis.fromQuat( q, [0,0,1] );
        this.rotation.copy( q );
        return this;
    }

    setAxes( x: ConstVec4, y: ConstVec4, z: ConstVec4 ){
        this.xAxis.copy( x );
        this.yAxis.copy( y );
        this.zAxis.copy( z );
        this.rotation.fromAxes( x, y, z );
        return this;
    }

    setScale( s: number ){ this.scale = s; return this; }
    // #endregion

    // #region IACTION Implementation
    // Set active gizmo
    setGizmo( g:IPlaneMovementHandler ){
        this._reset();
        this.gizmo = g;
        this.gizmo.onPlaneInit( this );
        return this;
    }
    // #endregion

    // #region METHODS
    onUp(){ this.gizmo?.onPlaneUpdate( this, true ); }

    onMove( ray: Ray ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const t = intersectPlane( ray, this.origin, this.zAxis );
        if( t == null ) return false;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get the intersect position
        if( this.steps === 0 ) ray.posAt( t, this.dragPos );
        else{
            // Step the intersect position
            ray.posAt( t, this.dragPos );

            this.dragPos.sub( this.origin );

            const xDist = Math.round( Vec3.projectScale( this.dragPos, this.xAxis ) / this.steps ) * this.steps;
            const yDist = Math.round( Vec3.projectScale( this.dragPos, this.yAxis ) / this.steps ) * this.steps;

            this.dragPos
                .copy( this.origin )
                .scaleThenAdd( xDist, this.xAxis )
                .scaleThenAdd( yDist, this.yAxis );
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.dragDir.fromSub( this.dragPos, this.origin ).norm();
        this.dragAngle = Vec3.angle( this.yAxis, this.dragDir );

        if( Vec3.dot( this.dragDir, this.xAxis ) > 0 ) this.dragAngle = -this.dragAngle;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.gizmo?.onPlaneUpdate( this, false );
        return true;
    }
    // #endregion
}