export default class Rect{
    static rounded( w=1, h=1, radius=0.2, seg=4 ){
        const sCnt = seg + 1;
        const out  = new Array( sCnt * 4 * 3 );
        const wh   = w / 2;
        const hh   = h / 2;
        let j      = 0;
        let jj     = sCnt * 3;
        let jjj    = sCnt * 3 * 2;
        let jjjj   = sCnt * 3 * 3;
        let rad, x, y;
        
        for( let i=0; i <= seg; i++ ){
            rad = ( i / seg ) * ( Math.PI / 2 );
            x   = radius * Math.cos( rad ) + wh - radius;
            y   = radius * Math.sin( rad ) + hh - radius;

            // Bottom - Right
            out[ j++ ] = x;
            out[ j++ ] = 0;
            out[ j++ ] = y;

            // Bottom - Left
            out[ jj++ ] = -y;
            out[ jj++ ] = 0;
            out[ jj++ ] = x;

            // Top - Left
            out[ jjj++ ] = -x;
            out[ jjj++ ] = 0;
            out[ jjj++ ] = -y;

            // Top - Right
            out[ jjjj++ ] = y;
            out[ jjjj++ ] = 0;
            out[ jjjj++ ] = -x;
        }

        return out;
    }
}