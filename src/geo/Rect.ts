export default class Rect{
    static rounded( w=1, h=1, radius=0.2, seg=4 ){
        const sCnt = seg + 1;
        const out  = new Array( sCnt * 4 * 3 );
        const wh   = w / 2 - radius;
        const hh   = h / 2 - radius;
        let j      = 0;
        let jj     = sCnt * 3;
        let jjj    = sCnt * 3 * 2;
        let jjjj   = sCnt * 3 * 3;
        let rad : number
        let x   : number 
        let y   : number;
        
        for( let i=0; i <= seg; i++ ){
            rad = ( i / seg ) * ( Math.PI / 2 );
            x   = radius * Math.cos( rad ) + wh;
            y   = radius * Math.sin( rad ) + hh;

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

    static roundSteps( w=2, h=2, radius=0.2, arcSteps=4, wSteps=6, hSteps=6 ): Array< Array<number> >{
        const wh  = w * 0.5;
        const hh  = h * 0.5;
        const ax  = wh - radius;
        const ay  = hh - radius;
        let v: Array<number>;
        let i: number;
    
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Arc Points
        const arc: Array< Array<number> > = [];
        let   inc = -Math.PI / 2 / ( arcSteps - 1 );
        let   rad: number;
        for( i=0; i < arcSteps; i++ ){
            rad = i * inc;
            arc.push( [ Math.cos( rad ) * radius, 0, Math.sin( rad ) * radius ] );
        }
        
        // Horizontal points
        const hori: Array< Array<number> > = [];
        inc        = ax / wSteps;
        for( i=wSteps-1; i > 0; i-- ) hori.push( [ i*inc, 0, -hh ] );
        for( i=0; i < wSteps; i++ )   hori.push( [-i*inc, 0, -hh ] );
    
        // Vertical points
        const vert: Array< Array<number> > = [];
        inc        = ay / hSteps;
        for( i=hSteps-1; i > 0; i-- ) vert.push( [ -wh, 0, i * -inc ] );
        for( i=0; i < hSteps; i++ )   vert.push( [ -wh, 0, i * inc ] );        
    
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Built Polygon
        const pnts: Array< Array<number> > = [];
    
        for( v of arc ) pnts.push( [  v[0]+ax, v[1],  v[2]-ay ] ); // TR
    
        pnts.push( ...hori );   // TOP
    
        for( v of arc ) pnts.push( [  v[2]-ax, v[1], -v[0]-ay ] ); // TL -90y
    
        pnts.push( ...vert );   // LEFT
    
        for( v of arc )  pnts.push( [ -v[0]-ax, v[1], -v[2]+ay ] ); // BL -180y
    
        for( v of hori ) pnts.push( [ -v[0], v[1], -v[2] ] ); // BOTTOM
    
        for( v of arc )  pnts.push( [ -v[2]+ax, v[1],  v[0]+ay ] ); // BR +90y
    
        for( v of vert ) pnts.push( [ -v[0], v[1], -v[2] ] ); // RIGHT

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return pnts;
    }
}

