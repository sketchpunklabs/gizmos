
/* [[[ Notes ]]]
- original source used matrices to tranform points between spaces
- Rewrote code to remove the need to transform points as things will be done in local space with polygons
- Rewrite is limited to axis aligned deformations, original allows for any axis to be used.

https://github.com/keenanwoodall/Deform/blob/master/Code/Runtime/Mesh/Deformers/CylindrifyDeformer.cs
*/

export default class Cylindrify{
    static apply( pnts: Array<TVec3>, axis=2, radius=3, factor=0.5 ): void{
        const fi = 1-factor;    // Lerp been original value * curved values
        let p    : TVec3;       // Point
        let a    : number;      // Components
        let b    : number;
        let len  : number;
        let i    : number = 2;  // Maybe X? Haven't tested it
        let ii   : number = 1;

        switch( axis ){
            case 1: i = 0; ii = 2; break;   // Y Axis
            case 2: i = 0; ii = 1; break;   // Z Axis
        }
    
        for( p of pnts ){
            // Get the rotating components with radius offset
            a = p[i];
            b = p[ii] - radius;
            
            // Normalize
            len = Math.sqrt( a**2 + b**2 );
            a   = ( len != 0 )? a / len : 0;
            b   = ( len != 0 )? b / len : 0;
    
            p[i]  = p[i]  * fi + a * radius * factor;
            p[ii] = p[ii] * fi + b * radius * factor + radius * factor;
        }
    }
}

// Original Port, Only does Y axis
// export default class Cylindrify{
//     factor = 0.8;  // between 0 & 1;
//     radius = 3;
//     axis   = [1,0,0];

//     apply( verts: Array<number> ){
//         const v = [0,0,0];
//         const n = [0,0,0];
//         const o = [0,0,0];

//         for( let i=0; i < verts.length; i+=3 ){
//             vec3.fromBuf( verts, i, v );
//             let a = v[0]
//             let b = v[2] - this.radius;

//             let len = Math.sqrt( a ** 2 + b ** 2 );
//             a = ( len != 0 )? a / len : 0;
//             b = ( len != 0 )? b / len : 0;

//             o[ 0 ] = a * this.radius;
//             o[ 1 ] = v[ 1 ];
//             o[ 2 ] = b * this.radius;

//             o[ 2 ] += this.radius;

//             vec3.toBuf( o, verts, i );
//         }
//     }
// }