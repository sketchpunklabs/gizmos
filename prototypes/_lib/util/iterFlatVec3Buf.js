
export default function iterFlatVec3Buf( buf ){
    let i        = 0;
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
    return { [Symbol.iterator](){ return { next }; } };
}