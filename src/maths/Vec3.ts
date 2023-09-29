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
    clone(): Vec3{ return new Vec3( this ); }
    // #endregion

    // #region SETTERS
    xyz( x:number, y:number, z:number ): this{
        this[ 0 ] = x;
        this[ 1 ] = y;
        this[ 2 ] = z;
        return this;
    }

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

    fromScale( a: ConstVec3, s:number ): this{
        this[ 0 ] = a[ 0 ] * s;
        this[ 1 ] = a[ 1 ] * s;
        this[ 2 ] = a[ 2 ] * s;
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

    fromCross( a: ConstVec3, b: ConstVec3 ): this{
        const ax = a[0], ay = a[1], az = a[2],
              bx = b[0], by = b[1], bz = b[2];

        this[ 0 ] = ay * bz - az * by;
        this[ 1 ] = az * bx - ax * bz;
        this[ 2 ] = ax * by - ay * bx;
        return this;
    }

    fromLerp( a: ConstVec3, b: ConstVec3, t: number ): this{
        const ti  = 1 - t;
        this[ 0 ] = a[ 0 ] * ti + b[ 0 ] * t;
        this[ 1 ] = a[ 1 ] * ti + b[ 1 ] * t;
        this[ 2 ] = a[ 2 ] * ti + b[ 2 ] * t;
        return this;
    }

    /** Project Postion onto a Plane */
    fromPlaneProj( v: ConstVec3, planePos: ConstVec3, planeNorm: ConstVec3 ): this{
        // p = target + norm * -( dot( norm, target ) + planeConst )
        const planeConst = -Vec3.dot( planePos, planeNorm );
        const scl        = -( Vec3.dot( planeNorm, v ) + planeConst );
        this[0] = v[0] + planeNorm[0] * scl;
        this[1] = v[1] + planeNorm[1] * scl;
        this[2] = v[2] + planeNorm[2] * scl;
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

    mul( v: ConstVec3 ): this{
        this[ 0 ] *= v[ 0 ];
        this[ 1 ] *= v[ 1 ];
        this[ 2 ] *= v[ 2 ];
        return this;
    }

    div( v: ConstVec3 ): this{
        this[ 0 ] /= v[ 0 ];
        this[ 1 ] /= v[ 1 ];
        this[ 2 ] /= v[ 2 ];
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

    negate(): this{
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    }

    scaleThenAdd( scale: number, a: ConstVec3 ): this{
        this[0] += a[0] * scale;
        this[1] += a[1] * scale;
        this[2] += a[2] * scale;
        return this;
    }

    min( a: ConstVec3 ): this{
        this[ 0 ] = Math.min( this[ 0 ], a[ 0 ] );
        this[ 1 ] = Math.min( this[ 1 ], a[ 1 ] );
        this[ 2 ] = Math.min( this[ 2 ], a[ 2 ] );
        return this;
    }

    max( a: ConstVec3 ): this{
        this[ 0 ] = Math.max( this[ 0 ], a[ 0 ] );
        this[ 1 ] = Math.max( this[ 1 ], a[ 1 ] );
        this[ 2 ] = Math.max( this[ 2 ], a[ 2 ] );
        return this;
    }
    // #endregion

    // #region STATIC    
    static len( a: ConstVec3 ): number{ return Math.sqrt( a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]** 2 ); }
    static lenSqr( a: ConstVec3 ): number{ return a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]** 2; }

    static dist( a: ConstVec3, b: ConstVec3 ): number{ return Math.sqrt( (a[ 0 ]-b[ 0 ]) ** 2 + (a[ 1 ]-b[ 1 ]) ** 2 + (a[ 2 ]-b[ 2 ]) ** 2 ); }
    static distSqr( a: ConstVec3, b: ConstVec3 ): number{ return (a[ 0 ]-b[ 0 ]) ** 2 + (a[ 1 ]-b[ 1 ]) ** 2 + (a[ 2 ]-b[ 2 ]) ** 2; }

    static dot( a: ConstVec3, b: ConstVec3 ): number { return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ]; }

    // Scale SRC in relation to TARGET
    static projectScale( from: ConstVec3, to: ConstVec3 ) : number{
        // Modified project from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
        // dot( a, b ) / dot( b, b ) * b
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const denom = this.dot( to, to );
        return ( denom < 0.000001 )? 0 : this.dot( from, to ) / denom;
    }

    static angle( a: ConstVec3, b: ConstVec3 ): number{
        //acos(dot(a,b)/(len(a)*len(b))) 
        //let theta = this.dot( a, b ) / ( Math.sqrt( a.lenSqr * b.lenSqr ) );
        //return Math.acos( Math.max( -1, Math.min( 1, theta ) ) ); // clamp ( t, -1, 1 )

        // atan2(len(cross(a,b)),dot(a,b))  
        const d = this.dot( a, b ),
              c = new Vec3().fromCross( a, b );
        return Math.atan2( Vec3.len(c), d ); 

        // This also works, but requires more LEN / SQRT Calls
        // 2 * atan2( ( u * v.len - v * u.len ).len, ( u * v.len + v * u.len ).len );

        //https://math.stackexchange.com/questions/1143354/numerically-stable-method-for-angle-between-3d-vectors/1782769
        // θ=2 atan2(|| ||v||u−||u||v ||, || ||v||u+||u||v ||)

        //let cosine = this.dot( a, b );
        //if(cosine > 1.0) return 0;
        //else if(cosine < -1.0) return Math.PI;
        //else return Math.acos( cosine / ( Math.sqrt( a.lenSqr * b.lenSqr() ) ) );
    }

    // #endregion
}