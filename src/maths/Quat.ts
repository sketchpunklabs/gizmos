
export default class Quat extends Array< number >{
    // #region MAIN
    constructor( v ?: ConstVec4 ){
        super( 4 );

        if( v instanceof Quat || v instanceof Float32Array || ( v instanceof Array && v.length == 4 ) ){
            this[ 0 ] = v[ 0 ];
            this[ 1 ] = v[ 1 ];
            this[ 2 ] = v[ 2 ];
            this[ 3 ] = v[ 3 ];
        }else{
            this[ 0 ] = 0;
            this[ 1 ] = 0;
            this[ 2 ] = 0;
            this[ 3 ] = 1;
        }
    }
    // #endregion

    // #region SETTERS / GETTERS
    copy( a: ConstVec4 ): this{
        this[ 0 ] = a[ 0 ];
        this[ 1 ] = a[ 1 ];
        this[ 2 ] = a[ 2 ];
        this[ 3 ] = a[ 3 ];
        return this
    }
    // #endregion

    // #region FROM SETTERS
    /** Axis must be normlized, Angle in Radians  */
    fromAxisAngle( axis: ConstVec3, rad: number ): this{ 
        const half = rad * 0.5;
        const s    = Math.sin( half );
        this[ 0 ]  = axis[ 0 ] * s;
        this[ 1 ]  = axis[ 1 ] * s;
        this[ 2 ]  = axis[ 2 ] * s;
        this[ 3 ]  = Math.cos( half );
        return this;
    }
    
    fromAxes( xAxis: ConstVec3, yAxis: ConstVec3, zAxis: ConstVec3 ): this{
        const m00 = xAxis[0], m01 = xAxis[1], m02 = xAxis[2],
              m10 = yAxis[0], m11 = yAxis[1], m12 = yAxis[2],
              m20 = zAxis[0], m21 = zAxis[1], m22 = zAxis[2],
              t = m00 + m11 + m22;
        let x, y, z, w, s;

        if(t > 0.0){
            s = Math.sqrt(t + 1.0);
            w = s * 0.5 ; // |w| >= 0.5
            s = 0.5 / s;
            x = (m12 - m21) * s;
            y = (m20 - m02) * s;
            z = (m01 - m10) * s;
        }else if((m00 >= m11) && (m00 >= m22)){
            s = Math.sqrt(1.0 + m00 - m11 - m22);
            x = 0.5 * s;// |x| >= 0.5
            s = 0.5 / s;
            y = (m01 + m10) * s;
            z = (m02 + m20) * s;
            w = (m12 - m21) * s;
        }else if(m11 > m22){
            s = Math.sqrt(1.0 + m11 - m00 - m22);
            y = 0.5 * s; // |y| >= 0.5
            s = 0.5 / s;
            x = (m10 + m01) * s;
            z = (m21 + m12) * s;
            w = (m20 - m02) * s;
        }else{
            s = Math.sqrt(1.0 + m22 - m00 - m11);
            z = 0.5 * s; // |z| >= 0.5
            s = 0.5 / s;
            x = (m20 + m02) * s;
            y = (m21 + m12) * s;
            w = (m01 - m10) * s;
        }

        this[ 0 ] = x;
        this[ 1 ] = y;
        this[ 2 ] = z;
        this[ 3 ] = w;
        return this;
    }
    // #endregion

    // #region OPERATORS
    /** Multiple Quaternion onto this Quaternion */
    mul( q: ConstVec4 ): Quat{ 
        const ax = this[0], ay = this[1], az = this[2], aw = this[3],
              bx = q[0],    by = q[1],    bz = q[2],    bw = q[3];
        this[ 0 ] = ax * bw + aw * bx + ay * bz - az * by;
        this[ 1 ] = ay * bw + aw * by + az * bx - ax * bz;
        this[ 2 ] = az * bw + aw * bz + ax * by - ay * bx;
        this[ 3 ] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }

    /** PreMultiple Quaternions onto this Quaternion */
    pmul( q: ConstVec4 ): Quat{
        const ax = q[0],    ay  = q[1],     az = q[2],    aw = q[3],
              bx = this[0], by  = this[1],  bz = this[2], bw = this[3];
        this[ 0 ] = ax * bw + aw * bx + ay * bz - az * by;
        this[ 1 ] = ay * bw + aw * by + az * bx - ax * bz;
        this[ 2 ] = az * bw + aw * bz + ax * by - ay * bx;
        this[ 3 ] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }

    norm(): this{
        let len =  this[0]**2 + this[1]**2 + this[2]**2 + this[3]**2;
        if( len > 0 ){
            len = 1 / Math.sqrt( len );
            this[ 0 ] *= len;
            this[ 1 ] *= len;
            this[ 2 ] *= len;
            this[ 3 ] *= len;
        }
        return this;
    }
    // #endregion
}