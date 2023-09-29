/* eslint-disable @typescript-eslint/no-explicit-any */

// #region IMPORTS
import type { PlaneMovement }   from './PlaneMovement';
import ShapePointsMesh          from '../render/ShapePointsMesh';
import DynLineMesh              from '../render/DynLineMesh';
import AngleViewMaterial        from '../render/AngleViewMaterial';

import { Group, PlaneGeometry, Mesh }
    from 'three';
// #endregion

export default class AngleMovementRender extends Group{
    // #region MAIN
    _pnt  : any = new ShapePointsMesh();
    _ln   : any = new DynLineMesh();
    mesh !: Mesh;
    mat  !: any;

    constructor(){
        super();
        this.visible = false;
        this.mat     = AngleViewMaterial();

        const geo = new PlaneGeometry( 2, 2 );
        this.mesh = new Mesh( geo, this.mat );
        this.add( this.mesh );
        this.add( this._ln );
        this.add( this._pnt );
    }
    // #endregion

    // #region RENDER INTERFACE
    render( action: PlaneMovement ){ 
        this._pnt.reset().add( action.dragPos, 0xffffff, 5, 2 );
        this._ln.reset().add( action.origin, action.dragPos, 0xffffff );

        this.mat.radArc = action.dragAngle;
    }

    postRender(){ 
        this.visible = false;
    }

    preRender( action: PlaneMovement ){
        this.mesh.position.fromArray( action.origin );
        this.mesh.quaternion.fromArray( action.rotation );
        this.mesh.scale.setScalar( action.scale );
        
        this.render( action );
        this._pnt._updateGeometry();
        this._ln._updateGeometry();

        this.visible = true;
    }
    // #endregion
}
