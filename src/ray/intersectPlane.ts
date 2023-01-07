import type Ray from './Ray';
import { vec3 } from 'gl-matrix';

/** T returned is scale to vector length, not direction */
export default function intersectPlane( ray:Ray, planePos: vec3, planeNorm: vec3 ) : number | null {
    // ((planePos - rayOrigin) dot planeNorm) / ( rayVecLen dot planeNorm )
    // pos = t * rayVecLen + rayOrigin;
    const denom = vec3.dot( ray.vecLength, planeNorm );         // Dot product of ray Length and plane normal
    if( denom <= 0.000001 && denom >= -0.000001 ) return null;  // abs(denom) < epsilon, using && instead to not perform absolute.

    const t = vec3.dot( vec3.sub( [0,0,0], planePos, ray.posStart ), planeNorm ) / denom;
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