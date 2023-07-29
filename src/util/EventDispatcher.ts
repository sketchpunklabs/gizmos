export default class EventDispatcher{
    _evt = new EventTarget();

    on( evtName: string, fn: EventListenerOrEventListenerObject ){
        this._evt.addEventListener( evtName, fn );
        return this;
    }

    off( evtName: string, fn: EventListenerOrEventListenerObject ){
        this._evt.removeEventListener( evtName, fn );
        return this;
    }

    once( evtName: string, fn: EventListenerOrEventListenerObject ){
        this._evt.addEventListener( evtName, fn, { once:true } ); 
        return this;
    }
    
    emit( evtName: string, data?: any ){
        this._evt.dispatchEvent( ( !data )
            ? new Event( evtName, { bubbles:false, cancelable:true, composed:false } ) 
            : new CustomEvent( evtName, { detail:data, bubbles:false, cancelable:true, composed:false } )
        );
        return this;
    }
}