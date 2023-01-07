import type { vec2 } from 'gl-matrix';

export type MouseHandlersProps = {
    click   ?: ( e:MouseEvent,   pos: vec2 )=>void;
    down    ?: ( e:PointerEvent, pos: vec2 )=>boolean;
    move    ?: ( e:PointerEvent, pos: vec2, delta: vec2 )=>void;
    up      ?: ( e:PointerEvent, pos: vec2 )=>void;
}

export default class MouseHandlers{
    // #region MAIN

    /**
     * Special case when there is an onClick Handler on the canvas, it
     * get triggered on mouse up, but if user did a drag action the click
     * will trigger at the end. This can cause issues if using click as a way
     * to select new attachments.
    */
    _stopClick  : boolean = false;
    _isActive   : boolean = false;
    _initialPos : vec2    = [0,0];
    _actions    : MouseHandlersProps | null;
    
    enabled     : boolean = true;

    constructor( elm: HTMLElement, actions: MouseHandlersProps | null = null ){
        this._actions = actions
        elm.addEventListener( 'click',       this.onClick );
        elm.addEventListener( 'pointerdown', this.onPointerDown );
        elm.addEventListener( 'pointermove', this.onPointerMove );
        elm.addEventListener( 'pointerup',   this.onPointerUp );
    }
    // #endregion

    // #region EVENT HANDLERS
    onClick = ( e: MouseEvent )=>{
        if( !this.enabled ) return;

        if( this._stopClick ){
            e.stopImmediatePropagation();
            this._stopClick = false;
            return;
        }

        if( this._actions?.click ) this._actions.click( e, eventLocalPos( e ) );
    };

    onPointerUp   = ( e: PointerEvent )=>{
        if( !this.enabled )     return;
        if( this._isActive ){
            ( e.target as HTMLElement ).releasePointerCapture( e.pointerId );
            
            this._isActive = false;

            if( this._actions?.up ) this._actions.up( e, eventLocalPos( e ) );
        }
    };

    onPointerMove = ( e: PointerEvent )=>{
        if( this._actions?.move && this.enabled && this._isActive ){
            const pos         = eventLocalPos( e );
            const delta: vec2 = [
                this._initialPos[ 0 ] - pos[ 0 ],
                this._initialPos[ 1 ] - pos[ 1 ],
            ];

            ( e.target as HTMLElement ).releasePointerCapture( e.pointerId );
            e.preventDefault();
            e.stopPropagation();

            this._actions.move( e, pos, delta );    
        }
    };

    onPointerDown = ( e: PointerEvent )=>{
        if( this._actions?.down && this.enabled ){
            this._initialPos = eventLocalPos( e );

            if( this._actions.down( e, this._initialPos ) ){
                e.preventDefault();
                e.stopPropagation();
                this._stopClick = true;
                this._isActive  = true;
            }
        }
    };
    // #endregion
}


// #region HELPERS
function eventLocalPos( e: MouseEvent ): vec2{
    const rect = ( e.target as HTMLElement ).getBoundingClientRect() ;
    return [
        e.clientX - rect.x, // element x position
        e.clientY - rect.y, // element y position
    ];
}
// #endregion