export default class Vec3 extends Array< number >{
    // #region STATIC PROPERTIES
    static UP       = [  0,  1,  0 ];
    static DOWN     = [  0, -1,  0 ];
    static LEFT     = [ -1,  0,  0 ];
    static RIGHT    = [  1,  0,  0 ];
    static FORWARD  = [  0,  0,  1 ];
    static BACK     = [  0,  0, -1 ];
    // #endregion

    // #region MAIN 
    constructor()
    constructor( v: TVec3 | ConstVec3 )
    constructor( v: number )
    constructor( x: number, y: number, z: number )
    constructor( v ?: TVec3 | ConstVec3 | number, y ?: number, z ?: number ){
        super( 3 );
        
        if( v instanceof Vec3 || v instanceof Float32Array || ( v instanceof Array && v.length == 3 )){
            this[ 0 ] = v[ 0 ]; 
            this[ 1 ] = v[ 1 ]; 
            this[ 2 ] = v[ 2 ];
        }else if( typeof v === 'number' && typeof y === 'number' && typeof z === 'number' ){
            this[ 0 ] = v
            this[ 1 ] = y; 
            this[ 2 ] = z;
        }else if( typeof v === 'number' ){
            this[ 0 ] = v;
            this[ 1 ] = v;
            this[ 2 ] = v;
        }else{
            this[ 0 ] = 0;
            this[ 1 ] = 0;
            this[ 2 ] = 0;
        }
    }
    // #endregion

    // #region GETTERS
    get len(): number{ return Math.sqrt( this[ 0 ]**2 + this[ 1 ]**2 + this[ 2 ]**2 ); }
    get lenSqr(): number{ return  this[ 0 ]**2 + this[ 1 ]**2 + this[ 2 ]**2; }
    // #endregion

    // #region SETTERS
    copy( a: ConstVec3 ): this{
        this[ 0 ] = a[ 0 ];
        this[ 1 ] = a[ 1 ];
        this[ 2 ] = a[ 2 ];
        return this;
    }
    // #endregion

    // #region FROM OPERATORS
    fromAdd( a: ConstVec3, b: ConstVec3 ): this{
        this[ 0 ] = a[ 0 ] + b[ 0 ];
        this[ 1 ] = a[ 1 ] + b[ 1 ];
        this[ 2 ] = a[ 2 ] + b[ 2 ];
        return this;
    }

    fromSub( a: ConstVec3, b: ConstVec3 ): this{
        this[ 0 ] = a[ 0 ] - b[ 0 ];
        this[ 1 ] = a[ 1 ] - b[ 1 ];
        this[ 2 ] = a[ 2 ] - b[ 2 ];
        return this;
    }

    fromNorm( v: ConstVec3 ): this {
        let mag = Math.sqrt( v[ 0 ]**2 + v[ 1 ]**2 + v[ 2 ]**2 );
        if( mag == 0 ) return this;

        mag = 1 / mag;
        this[ 0 ] = v[ 0 ] * mag;
        this[ 1 ] = v[ 1 ] * mag;
        this[ 2 ] = v[ 2 ] * mag;
        return this;
    }

    fromScaleThenAdd( scale: number, a: ConstVec3, b: ConstVec3 ): this{
        this[0] = a[0] * scale + b[0];
        this[1] = a[1] * scale + b[1];
        this[2] = a[2] * scale + b[2];
        return this;
    }

    fromQuat( q: ConstVec4, v: ConstVec3 ): Vec3{
        const qx = q[0], qy = q[1], qz = q[2], qw = q[3],
              vx = v[0], vy = v[1], vz = v[2],
              x1 = qy * vz - qz * vy,
              y1 = qz * vx - qx * vz,
              z1 = qx * vy - qy * vx,
              x2 = qw * x1 + qy * z1 - qz * y1,
              y2 = qw * y1 + qz * x1 - qx * z1,
              z2 = qw * z1 + qx * y1 - qy * x1;
        this[ 0 ] = vx + 2 * x2;
        this[ 1 ] = vy + 2 * y2;
        this[ 2 ] = vz + 2 * z2;
        return this;
    }
    // #endregion

    // #region OPERATORS
    add( a: ConstVec3 ): this{
        this[ 0 ] += a[ 0 ];
        this[ 1 ] += a[ 1 ];
        this[ 2 ] += a[ 2 ];
        return this;
    }

    sub( v: ConstVec3 ): this{
        this[ 0 ] -= v[ 0 ];
        this[ 1 ] -= v[ 1 ];
        this[ 2 ] -= v[ 2 ];
        return this;
    }

    scale( v: number ): this{
        this[ 0 ] *= v;
        this[ 1 ] *= v;
        this[ 2 ] *= v;
        return this;
    }

    norm(): this{
        let mag = Math.sqrt( this[0]**2 + this[1]**2 + this[2]**2 );
        if( mag != 0 ){
            mag      = 1 / mag;
            this[ 0 ] *= mag;
            this[ 1 ] *= mag;
            this[ 2 ] *= mag;
        }
        return this;
    }
    // #endregion

    // #region STATIC    
    static len( a: ConstVec3 ): number{ return Math.sqrt( a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]** 2 ); }
    static lenSqr( a: ConstVec3 ): number{ return a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]** 2; }

    static dist( a: ConstVec3, b: ConstVec3 ): number{ return Math.sqrt( (a[ 0 ]-b[ 0 ]) ** 2 + (a[ 1 ]-b[ 1 ]) ** 2 + (a[ 2 ]-b[ 2 ]) ** 2 ); }
    static distSqr( a: ConstVec3, b: ConstVec3 ): number{ return (a[ 0 ]-b[ 0 ]) ** 2 + (a[ 1 ]-b[ 1 ]) ** 2 + (a[ 2 ]-b[ 2 ]) ** 2; }

    static dot( a: ConstVec3, b: ConstVec3 ): number { return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ]; }
    // #endregion
}