/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
// #region IMPORTS
import type Ray             from '../ray/Ray';
import type Gizmos          from '../Gizmos';

import StateProxy           from '../util/StateProxy';
import Vec3                 from '../maths/Vec3';

import ShapePointsMesh      from '../render/ShapePointsMesh';

import intersectAABB        from '../ray/intersectAABB';
import nearPoint            from '../ray/nearPoint';

import {
    Group,
 } from 'three';

// #endregion

type PointProp = {
    color       ?: number, 
    size        ?: number, 
    shape       ?: number,
    userData    ?: any,
}

class Point{
    pos   = new Vec3();
    color = 0x999999;
    shape = 1;
    size  = 1;
    userData : any = null;

    constructor( p: ConstVec3, color?: number, size?: number, shape?: number ){
        this.pos.copy( p );
        if( color !== undefined ) this.color = color;
        if( size  !== undefined ) this.size  = size;
        if( shape !== undefined ) this.shape = shape;
    }
}

export default class PointsGizmo extends Group implements IGizmo{
    // #region MAIN
    state   = StateProxy.new({
        position    : [0,0,0],              // Needed by Gizmos to find closest gizmo hit
        hoverColor  : 0x00ff00,
        selectColor : 0xffff00,
        minDistance : 0.1,
        color       : 0x999999,
        size        : 2,
        shape       : 1,
    });

    _mesh      = new ShapePointsMesh();
    _points    : Array<Point> = [];        // Collection of points
    _min       = new Vec3();               // Min bounding box of all points
    _max       = new Vec3();               // Max bounding box of all points

    _hoverIdx  = -1;
    _phoverIdx = -1;

    _selIdx    = -1;                       // Current Selected Index
    _pselIdx   = -1;                       // Previous Selected Index, This is to limit renders to onChanges.
    _down      = false;

    constructor(){
        super();
        this.add( ( this._mesh as any ) );
    }
    // #endregion

    // #region GETTERS/SETTERS
    get selectedIndex(): number{ return this._selIdx; }
    // #endregion

    // #region METHODS
    addPoint( pos: ConstVec3, props: PointProp = {} ): Point{
        const pnt = new Point( pos
            ,( props.color !== undefined )? props.color : this.state.color
            ,( props.size  !== undefined )? props.size  : this.state.size
            ,( props.shape !== undefined )? props.shape : this.state.shape
        );

        if( props.userData ) pnt.userData = props.userData;

        this._points.push( pnt );
        return pnt;
    }

    setPosition( idx: number, pos: ConstVec3, autoRender:false ): this{
        const p = this._points[ idx ];
        if( p ){
            p.pos.copy( pos );
            if( autoRender ) this._render();
        }
        return this;
    }

    deselect(){
        if( this._selIdx === -1 ) return;
        this._selIdx  = -1;
        this._pselIdx = -1;
        this._render();
        return this;
    }

    update(): this {
        this._render();
        return this;
    }
    // #endregion

    // #region GIZMO INTERFACE
    // Handle Over event, change visual look when mouse is over gizmo
    onHover( ray: Ray ){
        const hit = this._isHit( ray, true );

        if( this._phoverIdx !== this._hoverIdx ){
            this._render();
        }

        return hit;
    }

    // Which action to perform on mouse down?
    onDown( ray: Ray, g: Gizmos ){ 
        const hit = ( this._isHit( ray, false ) );

        if( this._pselIdx !== this._selIdx ){
            this._render();
            g.events.emit( 'pointSelected', { 
                index   : this._selIdx,
                point   : ( this._selIdx === -1 )? null : this._points[ this._selIdx ],
            });
        }
        
        return ( hit )? 'none' : null;
    }

    onUp(): void{}
    onCameraScale(): void{}
    onDragStart(): void{}
    onDragEnd(): void{}
    // #endregion

    // #region SUPPORT
    _render(){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._mesh.reset();
        this._min.copy( [Infinity,Infinity,Infinity] );
        this._max.copy( [-Infinity,-Infinity,-Infinity] );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let p: Point;
        for( let i=0; i < this._points.length; i++ ){
            p = this._points[ i ];
            
            // Compute bounding box
            this._min.min( p.pos );
            this._max.max( p.pos );

            // Update Point Mesh
            this._mesh.add( 
                p.pos, 
                ( i === this._hoverIdx )
                    ? this.state.hoverColor
                    : ( i === this._selIdx )
                        ? this.state.selectColor  
                        : p.color, 
                p.size, 
                p.shape,
            );
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Expand bounds incase cube is a plane
        this._min.sub( [0.5,0.5,0.5] );
        this._max.add( [0.5,0.5,0.5] );
        this._mesh._updateGeometry();
    }

    _isHit( ray: Ray, isHover: boolean ){
        // First test if there is a chance to hit any point
        if( intersectAABB( ray, this._min, this._max ) ){

            const pos   = [0,0,0];
            let hit     : number | null;
            let p       : Point;
            let dist    = 0;
            let minDist = Infinity;
            let minIdx  = Infinity;
            let minPos  = null;

            // Check each point if it has been hit
            for( let i=0; i < this._points.length; i++ ){
                p   = this._points[ i ];

                hit = nearPoint( ray, p.pos, this.state.minDistance );
                if( hit === null ) continue;

                ray.posAt( hit, pos );
                dist = Vec3.distSqr( pos, ray.posStart );

                if( dist < minDist ){
                    minDist = dist;
                    minIdx  = i;
                    minPos  = pos.slice();
                }
            }

            // Save index to point that was hit
            if( minIdx !== Infinity ){
                if( isHover ){
                    this._phoverIdx     = this._hoverIdx;
                    this._hoverIdx      = minIdx;
                }else{
                    this._pselIdx       = this._selIdx;
                    this._selIdx        = ( minIdx === this._selIdx )? -1 : minIdx;
                    this.state.position = minPos;
                }
                return true;
            }
        }

        if( isHover ){
            this._phoverIdx     = this._hoverIdx;
            this._hoverIdx      = -1;
        }else{
            this._pselIdx       = this._selIdx; // Prevent re-renders
        }

        return false;
    }
    // #endregion
}