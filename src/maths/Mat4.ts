export default class Mat4 extends Array< number >{
    // #region CONSTRUCTOR
    constructor(){ 
        super(16);
        this[0]  = 1;
        this[1]  = 0;
        this[2]  = 0;
        this[3]  = 0;

        this[4]  = 0;
        this[5]  = 1;
        this[6]  = 0;
        this[7]  = 0;

        this[8]  = 0;
        this[9]  = 0;
        this[10] = 1;
        this[11] = 0;

        this[12] = 0;
        this[13] = 0;
        this[14] = 0;
        this[15] = 1;
    }
    // #endregion

    // #region FROM OPS
    fromInvert( mat: ConstMat4 ): this{
        const a00 = mat[0],  a01 = mat[1],  a02 = mat[2],  a03 = mat[3],
              a10 = mat[4],  a11 = mat[5],  a12 = mat[6],  a13 = mat[7],
              a20 = mat[8],  a21 = mat[9],  a22 = mat[10], a23 = mat[11],
              a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

              b00 = a00 * a11 - a01 * a10,
              b01 = a00 * a12 - a02 * a10,
              b02 = a00 * a13 - a03 * a10,
              b03 = a01 * a12 - a02 * a11,
              b04 = a01 * a13 - a03 * a11,
              b05 = a02 * a13 - a03 * a12,
              b06 = a20 * a31 - a21 * a30,
              b07 = a20 * a32 - a22 * a30,
              b08 = a20 * a33 - a23 * a30,
              b09 = a21 * a32 - a22 * a31,
              b10 = a21 * a33 - a23 * a31,
              b11 = a22 * a33 - a23 * a32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; // Calculate the determinant

        if( !det ) return this;
        det = 1.0 / det;

        this[0]  = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this[1]  = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this[2]  = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this[3]  = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        this[4]  = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this[5]  = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this[6]  = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this[7]  = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        this[8]  = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        this[9]  = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return this;
    }
    // #endregion

    // #region OPERATIONS
    mul( b: ConstMat4 ): this{ 
        const   a00 = this[0],	a01 = this[1],	a02 = this[2],	a03 = this[3],
                a10 = this[4],	a11 = this[5],	a12 = this[6],	a13 = this[7],
                a20 = this[8],	a21 = this[9],	a22 = this[10],	a23 = this[11],
                a30 = this[12],	a31 = this[13],	a32 = this[14],	a33 = this[15];

        // Cache only the current line of the second matrix
        let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        this[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        this[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        this[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        this[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return this;	
    }

    pmul( b: ConstMat4 ): this{ 
        const   a00 = b[0],	 a01 = b[1],  a02 = b[2],  a03 = b[3],
                a10 = b[4],  a11 = b[5],  a12 = b[6],  a13 = b[7],
                a20 = b[8],  a21 = b[9],  a22 = b[10], a23 = b[11],
                a30 = b[12], a31 = b[13], a32 = b[14], a33 = b[15];

        // Cache only the current line of the second matrix
        let b0  = this[0], b1 = this[1], b2 = this[2], b3 = this[3];
        this[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = this[4]; b1 = this[5]; b2 = this[6]; b3 = this[7];
        this[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = this[8]; b1 = this[9]; b2 = this[10]; b3 = this[11];
        this[8]  = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[9]  = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = this[12]; b1 = this[13]; b2 = this[14]; b3 = this[15];
        this[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        this[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        this[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        this[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return this;	
    }
    // #endregion

    // #region TRANSFORMS
    transformVec3( v: TVec3, out ?: TVec3 ): TVec3{
        const x = v[0], y = v[1], z = v[2];
        out    = out || v;
        out[0] = this[0] * x + this[4] * y + this[8]  * z + this[12];
        out[1] = this[1] * x + this[5] * y + this[9]  * z + this[13];
        out[2] = this[2] * x + this[6] * y + this[10] * z + this[14];
        return out;
    }

    transformVec4( v: TVec4, out?: TVec4 ): TVec4{
        const x = v[0], y = v[1], z = v[2], w = v[3];
        out    = out || v;
        out[0] = this[0] * x + this[4] * y + this[8]  * z + this[12] * w;
        out[1] = this[1] * x + this[5] * y + this[9]  * z + this[13] * w;
        out[2] = this[2] * x + this[6] * y + this[10] * z + this[14] * w;
        out[3] = this[3] * x + this[7] * y + this[11] * z + this[15] * w;
        return out;
    }
    // #endregion
}