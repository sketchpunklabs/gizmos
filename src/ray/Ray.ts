import Vec3 from '../maths/Vec3'
import Mat4 from '../maths/Mat4'

export default class Ray{
    // #region MAIN
    posStart    = new Vec3();   // Origin
    posEnd      = new Vec3();   // 
    direction   = new Vec3();   // Direction from Start to End
    vecLength   = new Vec3();   // Vector Length between start to end
    // #endregion

    // #region SETUP
    fromEndPoints( a: ConstVec3, b: ConstVec3 ): this{
        this.posStart.copy( a );                    // Starting Point of the Ray
        this.posEnd.copy( b );                      // The absolute end of the ray
        this.vecLength.fromSub( b, a );             // Vector Length
        this.direction.fromNorm( this.vecLength );  // Normalized Vector Length 
        return this;
    }

    fromScreenProjection( x: number, y:number, w:number, h:number, projMatrix: ConstMat4, camMatrix: ConstMat4 ): this{
        // http://antongerdelan.net/opengl/raycasting.html
        // Normalize Device Coordinate
        const nx  = x / w * 2 - 1;
        const ny  = 1 - y / h * 2;

        // inverseWorldMatrix = invert( ProjectionMatrix * ViewMatrix ) OR
        // inverseWorldMatrix = localMatrix * invert( ProjectionMatrix ) 
        // const invMatrix = mat4.invert( projMatrix )
        // mat4.mul( camMatrix, invMatrix, invMatrix );
        const invMatrix = new Mat4().fromInvert( projMatrix ).pmul( camMatrix );
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
        // Clip Cords would be [nx,ny,-1,1];
        const clipNear   = [ nx, ny, -1, 1 ];
        const clipFar    = [ nx, ny, 1, 1 ];

        // using 4d Homogeneous Clip Coordinates
        invMatrix.transformVec4( clipNear );
        invMatrix.transformVec4( clipFar );

        // Normalize by using W component
        for( let i=0; i < 3; i++){
            clipNear[ i ] /= clipNear[ 3 ];
            clipFar [ i ] /= clipFar [ 3 ];
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Final Compute
        this.posStart.copy( clipNear );                         // Starting Point of the Ray
        this.posEnd.copy( clipFar );                            // The absolute end of the ray
        this.vecLength.fromSub( this.posEnd, this.posStart );   // Vector Length
        this.direction.fromNorm( this.vecLength );              // Normalized Vector Length
        return this;
    }
    // #endregion

    // #region GETTERS / SETTERS
    /** Get position of the ray from T Scale of VecLen */
    posAt( t: number, out: TVec3 = [0,0,0] ): TVec3{
        // RayVecLen * t + RayOrigin
        // also works lerp( RayOrigin, RayEnd, t )
        out[ 0 ] = this.vecLength[ 0 ] * t + this.posStart[ 0 ];
        out[ 1 ] = this.vecLength[ 1 ] * t + this.posStart[ 1 ];
        out[ 2 ] = this.vecLength[ 2 ] * t + this.posStart[ 2 ];
        return out;
    }

    /** Get position of the ray from distance from origin */
    directionAt( len: number, out: TVec3 = [0,0,0] ): TVec3{
        out[ 0 ] = this.direction[ 0 ] * len + this.posStart[ 0 ];
        out[ 1 ] = this.direction[ 1 ] * len + this.posStart[ 1 ];
        out[ 2 ] = this.direction[ 2 ] * len + this.posStart[ 2 ];        
        return out;
    }

    clone(): Ray{
        const r = new Ray();
        r.posStart.copy(  this.posStart );
        r.posEnd.copy(    this.posEnd );
        r.direction.copy( this.direction );
        r.vecLength.copy( this.vecLength );   
        return r;
    }
    // #endregion

    // #region OPS
    transformMat4( m: Mat4 ): this{
        this.fromEndPoints( 
            m.transformVec3( this.posStart, [0,0,0] ), 
            m.transformVec3( this.posEnd,   [0,0,0] ),
        );
        return this;
    }
    // #endregion
}