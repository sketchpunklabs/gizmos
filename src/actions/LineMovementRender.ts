// #region IMPORTS
import type { LineMovement }    from './LineMovement';
import { Group, Object3D }      from 'three';
import ShapePointsMesh          from '../render/ShapePointsMesh';
import DynLineMesh              from '../render/DynLineMesh';
// #endregion

export default class LineMovementRender extends Group{
    // #region MAIN
    _anchor = new ShapePointsMesh();
    _pnt    = new ShapePointsMesh();
    _ln     = new DynLineMesh();

    constructor(){
        super();

        this._pnt.add( [0,0,0], 0x00ff00, 3 );
        this._anchor.add( [0,0,0], 0xffffff, 3 );

        this.add( this._pnt    as unknown as Object3D );
        this.add( this._ln     as unknown as Object3D );
        this.add( this._anchor as unknown as Object3D );

        this.visible = false;
    }
    // #endregion
    
    // #region METHODS
    render( action: LineMovement ){ this._pnt.position.fromArray( action.dragPos ); }
    postRender( _action: LineMovement ){ this.visible = false; }
    preRender( action: LineMovement ){
        this._pnt.position.fromArray( action.anchor );
        this._anchor.position.fromArray( action.anchor );

        this._ln.reset()
        this._ln.add( action.segStart, action.segEnd, 0x707070 );

        this.visible = true;
    }
    // #endregion
}