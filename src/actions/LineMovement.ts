// #region IMPORT
import type Ray                             from '../ray/Ray';
import { nearSegment, NearSegmentResult }   from '../ray/nearSegment';
// import { vec3 }                             from 'gl-matrix';
import Vec3 from '../maths/Vec3';
// #endregion

export interface ILineMovementHandler{
    onLineInit( ln: LineMovement ): void;
    onLinePosition( pos: ConstVec3 ): void;
}

export class LineMovement{
    // #region PROPERTIES
    steps     = 0;
    incNeg    = true;          // Move segment's starting point in the neg direction

    anchor    = new Vec3();    // Starting position when dragging
    dragPos   = new Vec3();    // current position when dragging
    offset    = new Vec3();    // Offset to apply to dragPos
    
    range     = 5_000;         // Distance from origin each point of the segment moves away
    origin    = new Vec3();    // origin of the line
    direction = new Vec3();    // positived direction of the line
    segStart  = new Vec3();    // starting position
    segEnd    = new Vec3();    // ending position
    
    result    = new NearSegmentResult();

    gizmo     : ILineMovementHandler | null = null; // Active gizmo requestion this action
    // #endregion

    // #region DATA
    _reset(){
        this.steps  = 0;
        this.range  = 5_000;
        this.incNeg = true;
        this.offset.copy( [0,0,0] );
    }

    // Setup action wtih various data that will compute a segment
    setOffset( v: ConstVec3 ): this{ this.offset.copy( v ); return this; }
    setAnchor( v: ConstVec3 ): this{ this.anchor.copy( v ); return this; }
    setDirection( v: ConstVec3 ): this{ this.direction.copy( v ); return this;  }
    setOrigin( v: ConstVec3 ): this{ 
        this.origin.copy( v );
        this.anchor.copy( v );
        return this; 
    }

    // Recompute start & end position of the drag segment
    recompute(){
        // Positive direction direction from origin
        this.segStart.fromScaleThenAdd( this.range, this.direction, this.origin );

        // Negative direction, else segment ends at origin
        if( this.incNeg ) this.segEnd.fromScaleThenAdd( -this.range, this.direction, this.origin );
        else              this.segEnd.copy( this.origin );
    }

    // Setup action with segment data
    setSegment( start: ConstVec3, end: ConstVec3 ): this{
        this.origin.copy( start );
        this.anchor.copy( start );
        this.segStart.copy( start );
        this.segEnd.copy( end );
        return this;
    }

    // Set active gizmo
    setGizmo( g: ILineMovementHandler ): this{
        this.gizmo = g;
        this._reset();
        this.gizmo.onLineInit( this );
        return this;
    }
    // #endregion

    // #region METHODS
    onMove( ray: Ray ): boolean{
        if( nearSegment( ray, this.segStart, this.segEnd, this.result ) ){
            if( this.steps === 0 ) this.dragPos.fromAdd( this.result.segPosition, this.offset );
            else{
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Compute distance from anchor
                const dir  = new Vec3( this.result.segPosition )
                    .add( this.offset )
                    .sub( this.anchor );

                let dist  = Vec3.len( dir );

                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Apply Steps to distance if available
                dir.norm();
                dist = Math.round( dist / this.steps ) * this.steps;

                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Final position
                this.dragPos.fromScaleThenAdd( dist, dir, this.anchor );
            }

            this.gizmo?.onLinePosition( this.dragPos.slice() as ConstVec3 );

            return true;
        }

        return false;
    }
    // #endregion
}