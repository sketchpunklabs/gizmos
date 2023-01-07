export default class Vec3Buffer{
    // #region MAIN
    constructor( ary=[] ){ this.useBuffer( ary ); }
    // #endregion

    // #region GETTERS / SETTERS
    useBuffer( buf ){
        this.flat = buf;
        this._len = buf.length / 3;
        return this;
    }

    get length(){ return this._len; }

    at( i, out=[0,0,0] ){
        i       *= 3;
        out[ 0 ] = this.flat[ i+0 ];
        out[ 1 ] = this.flat[ i+1 ];
        out[ 2 ] = this.flat[ i+2 ];
        return out;
    }

    push( x, y=null, z=null ){
        if( Array.isArray( x ) ) this.flat.push( ...x );
        else                     this.flat.push( x, y, z );

        this._len++;
        return this;
    }
    // #endregion

    // #region ITERATORS
    [Symbol.iterator](){
        let i        = 0;
        const buf    = this.flat;
        const len    = buf.length;
        const result = { value:[0,0,0], done:false };
        const next   = ()=>{
            if( i >= len ) result.done = true;
            else{
                result.value[ 0 ] = buf[ i++ ];
                result.value[ 1 ] = buf[ i++ ];
                result.value[ 2 ] = buf[ i++ ];
            }
            return result;
        };
        return { next }; 
    }

    iterLine( isClosedLoop=false ){
        let i        = 0;
        let j        = 0;
        let jj       = 0;
        const a      = [0,0,0];
        const b      = [0,0,0];
        const buf    = this.flat;
        const cnt    = buf.length / 3;
        const iEnd   = ( !isClosedLoop )? cnt-1 : cnt;
        const result = { value:{ a, b, isLast:false }, done:false };

        const next   = ()=>{
            if( i >= iEnd ) result.done = true;
            else{
                j  = i * 3;
                jj = ( ( i + 1 ) % cnt ) * 3;

                a[ 0 ] = buf[ j+0 ];
                a[ 1 ] = buf[ j+1 ];
                a[ 2 ] = buf[ j+2 ];

                b[ 0 ] = buf[ jj+0 ];
                b[ 1 ] = buf[ jj+1 ];
                b[ 2 ] = buf[ jj+2 ];
                
                i++;

                result.value.isLast = ( i >= iEnd );
            }
            return result;
        };
        return { [Symbol.iterator](){ return { next }; } };
    }
    // #endregion
}