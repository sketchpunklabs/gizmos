export type MouseHandlersProps = {
    click   ?: ( e:MouseEvent,   pos: ConstVec2 )=>void;
    down    ?: ( e:PointerEvent, pos: ConstVec2 )=>boolean;
    move    ?: ( e:PointerEvent, pos: ConstVec2 )=>void;
    up      ?: ( e:PointerEvent, pos: ConstVec2 )=>void;
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

    onPointerDown = ( e: PointerEvent )=>{
        if( this._actions?.down && this.enabled ){
            const coord = eventLocalPos( e );

            if( this._actions.down( e, coord ) ){
                e.preventDefault();
                e.stopPropagation();
                this._stopClick = true;
                this._isActive  = true;
            }
        }
    };

    onPointerMove = ( e: PointerEvent )=>{
        if( this._actions?.move && this.enabled ){
            const pos         = eventLocalPos( e );

            // Only for dragging events, dont do it for Hovering events
            if( this._isActive ){
                ( e.target as HTMLElement ).releasePointerCapture( e.pointerId );
                e.preventDefault();
                e.stopPropagation();
            }

            this._actions.move( e, pos );    
        }
    };

    onPointerUp   = ( e: PointerEvent )=>{
        if( !this.enabled )     return;
        if( this._isActive ){
            ( e.target as HTMLElement ).releasePointerCapture( e.pointerId );
            
            this._isActive = false;

            if( this._actions?.up ) this._actions.up( e, eventLocalPos( e ) );
        }
    };
    // #endregion
}


// #region HELPERS
function eventLocalPos( e: MouseEvent ): TVec2{
    const rect = ( e.target as HTMLElement ).getBoundingClientRect() ;
    return [
        e.clientX - rect.x, // element x position
        e.clientY - rect.y, // element y position
    ];
}
// #endregion