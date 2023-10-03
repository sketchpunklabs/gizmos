function lawcosSSS( aLen: number, bLen: number, cLen: number ): number{
    // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
    // The Angle between A and B with C being the opposite length of the angle.
    let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
    if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
    else if( v > 1 )	v = 1;
    return Math.acos( v );
}

export default function arrowArcShape( ringW=0.2, arrowW=0.4, arrowH=0.4, steps=8, tail=0.1 ){
    const radius = 1;
    const rw = ringW * 0.5;
    const aw = arrowW * 0.5;
    const ah = arrowH * 0.5;

    const startRad = lawcosSSS( radius, radius, ah );
    const inc      = ( Math.PI * 0.5 - startRad * 2 ) / steps
    const verts    = [];

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Create Main Arc
    let rad : number;
    let c   : number;
    let s   : number;

    for( let i=0; i <= steps; i++ ){
        rad = startRad + inc * i;
        c   = Math.cos( rad );
        s   = Math.sin( rad );
        verts.push( c, s, rw, c, s, -rw );
    }

    const ai = verts.length / 3; // Starting Index for Arrow Points

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Arrow Head
    c = Math.cos( startRad );
    s = Math.sin( startRad );
    verts.push( 
        c,   s,  aw,    // Arrow Left Pnt
        c,   s, -aw,    // Arrow Right Pnt
        c, -ah,   0,    // Arrow Point Pnt
    );

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Arc Tail
    c = Math.cos( Math.PI * 0.5 - startRad );
    s = Math.sin( Math.PI * 0.5 - startRad );
    verts.push( c-tail, s, rw );

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Create Faces
    const indices = [];
    let a: number;
    let b: number;
    let d: number;
    for( let i=0; i < steps; i++ ){
        a = i * 2;
        b = a + 1;
        d = a + 2;
        c = a + 3;        
        indices.push( a, b, c, c, d, a );
    }

    indices.push( 0, ai, ai+2 );        // Left Arrow
    indices.push( ai+1, 1, ai+2 );      // Right Arrow
    indices.push( 1, 0, ai+2 );         // Center Arrow
    indices.push( ai-1, ai-2, ai+3 );   // Tail

    return { vertices:verts, indices };
}
