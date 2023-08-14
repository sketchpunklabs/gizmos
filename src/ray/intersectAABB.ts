import Ray  from './Ray';
import Vec3 from '../maths/Vec3';

// https://gist.github.com/DomNomNom/46bb1ce47f68d255fd5d
/** returns the ray LENGTH, use directionAt() */
export default function intersectAABB( ray:Ray, min: TVec3, max: TVec3 ): [number, number] | null {
    const tMin = new Vec3( min ).sub( ray.posStart );
    const tMax = new Vec3( max ).sub( ray.posStart );
    tMin.div( ray.direction );
    tMax.div( ray.direction );

    const t1    = new Vec3( tMin ).min( tMax );
    const t2    = new Vec3( tMin ).max( tMax );
    const tNear = Math.max( t1[0], t1[1], t1[2] );
    const tFar  = Math.min( t2[0], t2[1], t2[2] );

    return ( tNear < tFar )? [tNear, tFar] : null;
}