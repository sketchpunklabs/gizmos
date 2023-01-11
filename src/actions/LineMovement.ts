// #region IMPORT
import type Ray                             from '../ray/Ray';
import { nearSegment, NearSegmentResult }   from '../ray/nearSegment';
import { vec3 }                             from 'gl-matrix';
// #endregion

export interface ILineMovementHandler{
    onLineInit( ln: LineMovement ): void;
    onLinePosition( pos: vec3 ): void;
}

export class LineMovement{
    // #region PROPERTIES
    steps     = 0;
    incNeg    = true;              // Move segment's starting point in the neg direction

    anchor    : vec3 = [0,0,0];    // Starting position when dragging
    dragPos   : [number,number,number] = [0,0,0];    // current position when dragging
    offset    : vec3 = [0,0,0];    // Offset to apply to dragPos
    
    range     = 5_000;             // Distance from origin each point of the segment moves away
    origin    : vec3 = [0,0,0];    // origin of the line
    direction : vec3 = [1,0,0];    // positived direction of the line
    segStart  : vec3 = [0,0,0];    // starting position
    segEnd    : vec3 = [0,0,0];    // ending position
    
    result    = new NearSegmentResult();

    gizmo     : ILineMovementHandler | null = null;
    // #endregion

    // #region DATA
    _update(){
        vec3.scaleAndAdd( this.segStart, this.origin, this.direction, this.range );
        if( this.incNeg )   vec3.scaleAndAdd( this.segEnd, this.origin, this.direction, -this.range );
        else                vec3.copy( this.segEnd, this.origin );
    }
    setOffset( v: vec3 ): this{ vec3.copy( this.offset, v ); return this; }

    setAnchor( v: vec3 ): this{ vec3.copy( this.anchor, v ); return this; }
    setDirection( v: vec3 ): this{ vec3.copy( this.direction, v ); this._update(); return this;  }
    setOrigin( v: vec3 ): this{ 
        vec3.copy( this.origin, v );
        vec3.copy( this.anchor, v );
        this._update();
        return this; 
    }

    setGizmo( g: ILineMovementHandler ): this{
        this.gizmo = g;
        this.gizmo.onLineInit( this );
        return this;
    }
    // #endregion

    // #region METHODS
    onMove( ray: Ray ): boolean{
        if( nearSegment( ray, this.segStart, this.segEnd, this.result ) ){

            if( this.steps === 0 ) vec3.add( this.dragPos, this.result.segPosition, this.offset );
            else{
                const dir  = vec3.add( [0,0,0], this.result.segPosition, this.offset );
                vec3.sub( dir, dir, this.anchor );

                // const dir   = vec3.sub( [0,0,0], this.result.segPosition, this.anchor );
                let   dist  = vec3.len( dir );

                vec3.normalize( dir, dir );
                dist = Math.round( dist / this.steps ) * this.steps;

                vec3.scaleAndAdd( this.dragPos, this.anchor, dir, dist );
            }

            this.gizmo?.onLinePosition( this.dragPos.slice() as vec3 );
            return true;
        }

        return false;
    }
    // #endregion
}