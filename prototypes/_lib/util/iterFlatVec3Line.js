
export default function iterFlatVec3Line( buf, isClosedLoop=false ){
    let i        = 0;
    let j        = 0;
    let jj       = 0;
    const a      = [0,0,0];
    const b      = [0,0,0];
    const cnt    = buf.length / 3;
    const iEnd   = ( !isClosedLoop )? cnt-1 : cnt;
    const result = { value:{ a, b }, done:false };

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
        }
        return result;
    };
    return { [Symbol.iterator](){ return { next }; } };
}