import Vec3 from '../maths/Vec3';
import Ray  from './Ray';

export class RaySphereResult{
    tMin        = 0;        // 0 > 1
    tMax        = 0;        // 0 > 1
    posEntry    = [0,0,0];
    posExit     = [0,0,0];
}

// This function is the better Sphere intersection BUT its for an infinite ray
// So the T value is creates is for the Ray.Dir instead of Ray.vec_len
export function intersectSphere( ray: Ray, origin: ConstVec3, radius: number, results ?: RaySphereResult ): boolean{
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const radiusSq      = radius * radius;
    const rayToCenter   = new Vec3( origin ).sub( ray.posStart );
    const tProj         = Vec3.dot( rayToCenter, ray.direction ); // Project the length to the center onto the Ray

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Get length of projection point to center and check if its within the sphere
    // Opposite^2 = hyptenuse^2 - adjacent^2
    const oppLenSq = Vec3.lenSqr( rayToCenter ) - ( tProj * tProj );
    if( oppLenSq > radiusSq ) return false;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if( results ){
        // -----------------------------
        // if a parallel ray right on the radius, exit & entry is the same
        if( oppLenSq == radiusSq ){
            results.tMin = tProj;
            results.tMax = tProj;

            ray.directionAt( tProj, results.posEntry );

            results.posExit[ 0 ] = results.posEntry[ 0 ];
            results.posExit[ 1 ] = results.posEntry[ 1 ];
            results.posExit[ 2 ] = results.posEntry[ 2 ];
            return true;
        }

        // -----------------------------
        // Separate positions for entry and exit
        const oLen  = Math.sqrt( radiusSq - oppLenSq ); // Opposite = sqrt( hyptenuse^2 - adjacent^2 )
        const t0    = tProj - oLen;
        const t1    = tProj + oLen;

        // Swap
        if( t1 < t0 ){
            results.tMin = t1; 
            results.tMax = t0; 
        }else{
            results.tMin = t0; 
            results.tMax = t1; 
        }

        ray.directionAt( t0, results.posEntry );
        ray.directionAt( t1, results.posExit );
    }

    return true;
}