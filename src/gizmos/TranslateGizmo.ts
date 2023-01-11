// #region IMPORTS
import type Ray                           from '../ray/Ray';
import type { IGizmo }                    from '../types';
import type { Object3D }                  from 'three';
import type { LineMovement, ILineMovementHandler } from '../actions/LineMovement';
import { Group }                          from 'three';
import { vec3 }                           from 'gl-matrix';

import { nearSegment, NearSegmentResult } from '../ray/nearSegment';
import StateProxy                         from '../util/StateProxy';
import DynLineMesh                        from '../render/DynLineMesh';
// #endregion

export default class Translation extends Group implements IGizmo, ILineMovementHandler{
    // #region MAIN
    _ln      = new DynLineMesh();
    _hitPos  : vec3 = [0,0,0];
    _xAxis   : vec3 = [1,0,0];
    _yAxis   : vec3 = [0,1,0];
    _zAxis   : vec3 = [0,0,1];
    _axes    : Array< vec3 > = [ this._xAxis, this._yAxis, this._zAxis ];
    _result  = new NearSegmentResult();

    _rangeSq = 0.1 * 0.1;
    _selAxis = -1;
    
    _isDirty = false;

    state    = StateProxy.new({
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
                vec3.transformQuat( this._xAxis, [1,0,0], this.state.rotation );
                vec3.transformQuat( this._yAxis, [0,1,0], this.state.rotation );
                vec3.transformQuat( this._zAxis, [0,0,1], this.state.rotation );
                this.render();
                break;
            }

            // // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // case 'target'    :{
            //     if( e.detail.value ){
            //         const pos         = e.detail.value.position.toArray();
            //         this.state.origin = pos;                        // Want to emit change
            //         this.state.$.update( { position:pos }, false ); // Dont Emit Change
            //         this.render();
            //     }
            //     break;
            // }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'position'  :
                this.position.fromArray( this.state.position );
                break;
        }
    };
    // #endregion

    // #region MOUSE RAY HANDLERS
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
    // #endregion

    // #region LINE ACTION HANDLERS
    onLineInit( ln: LineMovement ){
        ln.steps  = 0;
        ln.incNeg = true;
        ln.setOffset( vec3.sub( [0,0,0], this.state.position, this._hitPos ) );
        ln.setDirection( this._axes[ this._selAxis ] );
        ln.setOrigin( this.state.position );
    }

    onLinePosition( pos: vec3 ){
        this.state.position = pos;
    }
    // #endregion

    // #region FUNCTIONS
    _isHit( ray:Ray ){
        const origin : vec3 = this.state.position;
        const v      : vec3 = [0,0,0];
        let sel      = -1;
        let min      = Infinity;
        let axis     : vec3;

        for( let i=0; i < 3; i++ ){
            axis = this._axes[ i ];
            vec3.scaleAndAdd( v, origin, axis, 1 );

            if( nearSegment( ray, origin, v, this._result ) ){
                if( this._result.distanceSq > this._rangeSq ||
                    this._result.distanceSq >= min ) continue;

                sel = i;
                min = this._result.distanceSq;
                vec3.copy( this._hitPos, this._result.segPosition );
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
