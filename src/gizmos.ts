// #region IMPORTS
import type { WebGLRenderer, Camera, Scene, Object3D } from 'three';

import Ray                  from './ray/Ray';
import EventDispatcher      from './util/EventDispatcher';
import MouseHandlers        from './util/MouseHandlers';

import { LineMovement }     from './actions/LineMovement';
import LineMovementRender   from './actions/LineMovementRender';
// #endregion

// Gizmos are 3D Objects that must have implemented gizmo interface
type TGizmo3D = IGizmo & Object3D;

export default class Gizmos{
    // #region MAIN
    ray         = new Ray();                        // Reusable Ray
    events      = new EventDispatcher();            // Main Event Dispatcher
    mouse       : MouseHandlers;                    // Handle mouse events
    canvas      : HTMLElement;                      // 3D Canvas
    scene       : Scene;                            // Scene to add gizmos + support
    camera      : Camera;                           // Scene's camera

    list        : Array< TGizmo3D > = new Array();  // List of available gizmos

    dragGizmo   : TGizmo3D | null = null;           // Currently active gizmo
    dragAction  : any = null;                       // Currently used action

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
    _updateRay( pos: ConstVec2 ){
        const rect      = this.canvas.getBoundingClientRect();
        const camProj   = this.camera.projectionMatrix.toArray();   // Need Projection Matrix
        const camWorld  = this.camera.matrixWorld.toArray();        // World Space Transform of Camera
        this.ray.fromScreenProjection( pos[0], pos[1], rect.width, rect.height, camProj, camWorld );
    }
    // #endregion

    // #region EVENTS
    onDown = ( _e: PointerEvent, pos: ConstVec2 ):boolean =>{
        this._updateRay( pos );
        let action : string | null = null;

        for( let g of this.list ){
            if( g.visible ){

                // Check if this gizmo is a hit & which action it needs to use
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

    onUp = ( _e: PointerEvent, _pos: ConstVec2 ):void =>{
        if( this.dragGizmo ){
            this.dragGizmo.onUp();                  // Complete drag event
            this.dragGizmo = null;                  // No longer active for action
            
            this.dragAction.renderer.postRender();  // Cleanup any rendering
            this.dragAction = null;                 // No action active
            
            this.events.emit( 'dragStop' );         // Alert parent that dragging is over
        }
    };

    onMove = ( _e: PointerEvent, pos: ConstVec2 ):void =>{
        this._updateRay( pos );

        if( this.dragGizmo ){
            // An action is active, give it the ray to handle
            this.dragAction.handler.onMove( this.ray );
            this.dragAction.renderer.render( this.dragAction.handler );
        }else{
            // No active action, pass ray to any gizmo for onHover visualization
            for( let g of this.list ){
                if( g.visible ) g.onHover( this.ray );
            }
        }
    };
    // #endregion
}