type ObjectAny = { [key:string]:any };

export default class StateProxy{
    // #region MAIN
    static new( data={} ){ return new Proxy( data, new StateProxy( data ) ); }

    data   : ObjectAny;
    events = new EventTarget();

    constructor( data: ObjectAny ){
        this.data = data;
    }
    // #endregion

    // #region METHODS
    update( struct: ObjectAny, emitChange=false ){
        Object.assign( this.data, struct );
        
        if( emitChange ) this.emit( 'change', null );
        return this;
    }
    // #endregion

    // #region PROXY TRAPS
    get( target: any, prop: string, receiver: unknown ){
        // console.log( "GET", "target", target, "prop", prop, "rec", receiver );    
        if( prop === '$' ) return this;
        return Reflect.get( target, prop, receiver ); // target[ prop ];
    }

    set( target: any, prop: string, value: any ){
        // console.log( "SET", "target", target, "prop", prop, "value", value, 'prev', Reflect.get( target, prop ) );
        if( prop === '$' ) return false;

        // Only update the state if the value is different
        if( Reflect.get( target, prop ) !== value ){
            Reflect.set( target, prop, value );     // Save data to Object
            this.emit( prop + 'Change', value );    // Emit event that property changed
            this.emit( 'change', { prop, value } ); // Emit event that any property changed
        }
        return true;
    }
    // #endregion

    // #region EVENTS
    on( evtName: string, fn: EventListenerOrEventListenerObject | null ){
        this.events.addEventListener( evtName, fn );
        return this;
    }

    off( evtName: string, fn: EventListenerOrEventListenerObject | null ){
        this.events.removeEventListener( evtName, fn );
        return this;
    }

    once( evtName: string, fn: EventListenerOrEventListenerObject | null ){
        this.events.addEventListener( evtName, fn, { once:true } ); 
        return this;
    }
    
    emit( evtName: string, data: any ){
        this.events.dispatchEvent( new CustomEvent( evtName, { detail:data, bubbles: false, cancelable:true, composed:false } ) );
        return this;
    }
    // #endregion
}