// #region IMPORTS
import type { vec2 }    from 'gl-matrix';
import type { WebGLRenderer, Camera, Scene, Object3D } from 'three';
import type { IGizmo }                    from './types';

import Ray              from './ray/Ray';
import EventDispatcher  from './util/EventDispatcher';
import MouseHandlers    from './util/MouseHandlers';

import { LineMovement }     from './actions/LineMovement';
import LineMovementRender   from './actions/LineMovementRender';
// #endregion

type TGizmo3D = IGizmo & Object3D;

export default class Gizmos{
    // #region MAIN
    ray         = new Ray();
    events      = new EventDispatcher();
    mouse       : MouseHandlers;
    canvas      : HTMLElement;
    scene       : Scene ;
    camera      : Camera;

    list        : Array< TGizmo3D > = new Array();

    dragGizmo   : TGizmo3D | null = null;
    dragAction  : any = null;

    actions     : { [key:string]:any } = {
        line  : { handler: new LineMovement(), renderer: new LineMovementRender() },
        // plane : { handler: null, renderer: null },
    };

    constructor( renderer: WebGLRenderer, camera: Camera, scene: Scene ){
        this.canvas = renderer.domElement;
        this.camera = camera;
        this.scene  = scene;
        this.mouse  = new MouseHandlers( this.canvas, { down: this.onDown, move: this.onMove, up: this.onUp } );
        
        scene.add( this.actions.line.renderer );
    }
    // #endregion

    // #region MANAGE GIZMOS
    add( g: TGizmo3D ){
        this.list.push( g );
        this.scene.add( g as Object3D );
        return this;
    }
    // #endregion

    // #region PRIVATE METHODS
    _updateRay( pos: vec2 ){
        const rect      = this.canvas.getBoundingClientRect();
        const camProj   = this.camera.projectionMatrix.toArray();   // Need Projection Matrix
        const camWorld  = this.camera.matrixWorld.toArray();        // World Space Transform of Camera
        this.ray.fromScreenProjection( pos[0], pos[1], rect.width, rect.height, camProj, camWorld );
    }
    // #endregion

    // #region EVENTS
    onDown = ( _e: PointerEvent, pos: vec2 ):boolean =>{
        this._updateRay( pos );
        let action : string | null = null;

        for( let g of this.list ){
            if( g.visible ){
                action = g.onDown( this.ray );

                if( action ){
                    // Save Ref to gizmo + action
                    this.dragGizmo  = g;
                    this.dragAction = this.actions[ action ];
                    
                    // Setup action + render
                    this.dragAction.handler.setGizmo( g );
                    this.dragAction.renderer.preRender( this.dragAction.handler );
                    
                    // Shoot Events
                    this.events.emit( 'dragStart' );
                }

                return true;
            }
        }

        return false;
    };

    onUp = ( _e: PointerEvent, _pos: vec2 ):void =>{
        if( this.dragGizmo ){
            this.dragGizmo.onUp();
            this.dragGizmo = null;
            
            this.dragAction.renderer.postRender();
            this.dragAction = null;
            
            this.events.emit( 'dragStop' );
        }
    };

    onMove = ( _e: PointerEvent, pos: vec2 ):void =>{
        this._updateRay( pos );

        if( this.dragGizmo ){
            this.dragAction.handler.onMove( this.ray );
            this.dragAction.renderer.render( this.dragAction.handler );
        }else{
            for( let g of this.list ){
                if( g.visible ) g.onHover( this.ray );
            }
        }
    };
    // #endregion

}