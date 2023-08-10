import type Ray from './Ray';
import Vec3     from '../maths/Vec3';

/** T returned is scale to vector length, not direction */
export default function intersectPlane( ray:Ray, planePos: ConstVec3, planeNorm: ConstVec3 ) : number | null {
    // ((planePos - rayOrigin) dot planeNorm) / ( rayVecLen dot planeNorm )
    // pos = t * rayVecLen + rayOrigin;
    const denom = Vec3.dot( ray.vecLength, planeNorm );         // Dot product of ray Length and plane normal
    if( denom <= 0.000001 && denom >= -0.000001 ) return null;  // abs(denom) < epsilon, using && instead to not perform absolute.

    const v: TVec3 = [
        planePos[0] - ray.posStart[0],
        planePos[1] - ray.posStart[1],
        planePos[2] - ray.posStart[2],
    ];

    const t = Vec3.dot( v, planeNorm ) / denom;
    return ( t >= 0 )? t : null;
}


/** T returned is scale to direction length, not vector length */
/* An alternative way to intersect, needs plane constant to work, so I added its computation into the function.
function intersectPlane2( ray, planePos, planeNorm ){
    const denom      = vec3.dot( planeNorm, ray.direction );
    const planeConst = -vec3.dot( planePos, planeNorm );

    if( denom === 0 ){
        // Distance to plane is zero, then its coplanar, meaning the start of the ray is on the plane
        return ( ( vec3.dot( planeNorm, ray.posStart ) + planeConst) === 0 )? 0 : null;
    }
    
    const t = - ( vec3.dot( ray.posStart, planeNorm ) + planeConst ) / denom;
    return t >= 0 ? t : null;
}
*/