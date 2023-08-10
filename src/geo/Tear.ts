export default function tearShape( radius=1, steps=24, power=8, pull=0.4 ){
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Generate half shape
    const hStep : number       = steps / 2;
    const inc   : number       = (Math.PI * 2.0) / steps;
    const arc   : Array<TVec3> = [];
    let v       : TVec3        = [0,0,0];
    let rad     : number;
    let r       : number;
    let i       : number;
    
    for( i=0; i <= hStep; i++ ){
        rad = inc * i + Math.PI * 0.5;
        r   = ( i <= hStep )
            ? (1-( i/hStep )) ** power * pull + radius 
            : radius;

        planeCircle( [0,0,0], [1,0,0], [0,1,0], rad, r, v );
        arc.push( v.slice() );
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Generate mesh vertices from the half shape

    const verts: Array<number> = [];
    // Front Face
    for( v of arc ){ verts.push( v[0], v[1], 0.1 ); }
    for( i=arc.length-2; i > 0; i-- ){ v = arc[ i ]; verts.push( -v[0], v[1], 0.1 ); }

    // Back Face
    for( v of arc ){ verts.push( v[0], v[1], -0.1 ); }
    for( i=arc.length-2; i > 0; i-- ){ v = arc[ i ]; verts.push( -v[0], v[1], -0.1 ); }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const indices : Array<number> = [];
    let   ii      : number;
    let   b       : number;
    let   c       : number;
    for( let i=0; i < steps; i++ ){
        ii = i + steps;
        c  = (i + 1) % steps;
        b  = ((i + 1) % steps) + steps;
        indices.push( i, ii, b, b, c, i );
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return {
        vertices : new Float32Array( verts ),
        indices  : new Uint16Array( indices ),
    };
}

function planeCircle( center: ConstVec3, xAxis: ConstVec3, yAxis: ConstVec3, angle: number, radius: number, out: TVec3 ): TVec3{
    const sin = Math.sin( angle );
    const cos = Math.cos( angle );
    out[0] = center[0] + radius * cos * xAxis[0] + radius * sin * yAxis[0];
    out[1] = center[1] + radius * cos * xAxis[1] + radius * sin * yAxis[1];
    out[2] = center[2] + radius * cos * xAxis[2] + radius * sin * yAxis[2];
    return out;
}