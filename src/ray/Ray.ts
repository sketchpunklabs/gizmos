import { vec3, vec4, mat4 } from 'gl-matrix';

export default class Ray{
    // #region MAIN
    posStart    : vec3 = [0,0,0]; // Origin
    posEnd      : vec3 = [0,0,0];
    direction   : vec3 = [0,0,0];
    vecLength   : vec3 = [0,0,0];
    // #endregion

    // #region GETTERS / SETTERS
    
    /** Get position of the ray from T Scale of VecLen */
    posAt( t: number, out: vec3 = [0,0,0] ): vec3{
        // RayVecLen * t + RayOrigin
        // also works lerp( RayOrigin, RayEnd, t )
        out[ 0 ] = this.vecLength[ 0 ] * t + this.posStart[ 0 ];
        out[ 1 ] = this.vecLength[ 1 ] * t + this.posStart[ 1 ];
        out[ 2 ] = this.vecLength[ 2 ] * t + this.posStart[ 2 ];
        return out;
    }

    /** Get position of the ray from distance from origin */
    directionAt( len: number, out: vec3 = [0,0,0] ): vec3{
        out[ 0 ] = this.direction[ 0 ] * len + this.posStart[ 0 ];
        out[ 1 ] = this.direction[ 1 ] * len + this.posStart[ 1 ];
        out[ 2 ] = this.direction[ 2 ] * len + this.posStart[ 2 ];        
        return out;
    }

    /** 3JS Ray Caster */
    fromCaster( caster: any ): this{
        vec3.copy( this.posStart,  caster.ray.origin.toArray() );
        vec3.copy( this.direction, caster.ray.direction.toArray() );

        const len = ( caster.far === Infinity )? 1000 : caster.far;
        vec3.scale( this.vecLength, this.direction, len );
        vec3.add( this.posEnd, this.posStart, this.vecLength );
        return this;
    }

    fromScreenProjection( x: number, y: number, w: number, h: number, projMatrix: mat4, camMatrix: mat4 ){
        // http://antongerdelan.net/opengl/raycasting.html
        // Normalize Device Coordinate
        const nx = x / w * 2 - 1;
        const ny = 1 - y / h * 2;

        // inverseWorldMatrix = invert( ProjectionMatrix * ViewMatrix ) OR
        // inverseWorldMatrix = localMatrix * invert( ProjectionMatrix ) 
        const invMatrix: mat4 = [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ];
        mat4.invert( invMatrix, projMatrix )
        mat4.mul( invMatrix, camMatrix, invMatrix );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
        // Clip Cords would be [nx,ny,-1,1];
        const clipNear = [ nx, ny, -1, 1 ];
        const clipFar  = [ nx, ny,  1, 1 ];

        // using 4d Homogeneous Clip Coordinates
        vec4.transformMat4( clipNear as vec4, clipNear as vec4, invMatrix );
        vec4.transformMat4( clipFar as vec4,  clipFar as vec4,  invMatrix );

        // Normalize by using W component
        for( let i=0; i < 3; i++){
            clipNear[ i ] /= clipNear[ 3 ];
            clipFar [ i ] /= clipFar [ 3 ];
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        vec3.copy( this.posStart, clipNear as vec3 );                   // Starting Point of the Ray
        vec3.copy( this.posEnd, clipFar as vec3 );                      // The absolute end of the ray
        vec3.sub( this.vecLength, clipFar as vec3, clipNear as vec3 );  // Vector Length
        vec3.normalize( this.direction, this.vecLength );               // Normalized Vector Length
        return this;
    }
    // #endregion
}