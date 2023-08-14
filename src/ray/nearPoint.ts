import Ray  from './Ray';
import Vec3 from '../maths/Vec3';

export default function nearPoint( ray: Ray, p: ConstVec3, distLimit=0.1 ) : number | null{
    /* closest_point_to_line3D
    let dx	= bx - ax,
        dy	= by - ay,
        dz	= bz - az,
        t	= ( (px-ax)*dx + (py-ay)*dy + (pz-az)*dz ) / ( dx*dx + dy*dy + dz*dz ) ; */
    
    const v = new Vec3( p ).sub( ray.posStart ).mul( ray.vecLength );
    const t = ( v[0] + v[1] + v[2] ) / Vec3.lenSqr( ray.vecLength );

    if( t < 0 || t > 1 ) return null;                       // Over / Under shoots the Ray Segment
    const lenSqr = Vec3.distSqr( ray.posAt( t, v ), p );    // Distance from point to nearest point on ray.

    return ( lenSqr <= (distLimit*distLimit) )? t : null;
}