import type Ray from './Ray';
import { vec3 } from 'gl-matrix';

export class NearSegmentResult{
    segPosition : vec3      = [0,0,0];
    rayPosition : vec3      = [0,0,0];
    distanceSq  : number    = 0;
}

/** Returns [ T of Segment, T of RayLen ] */
export function nearSegment( ray: Ray, p0: vec3, p1: vec3, results ?: NearSegmentResult ){
    // http://geomalgorithms.com/a07-_distance.html
    const   u = vec3.sub( [0,0,0], p1, p0 ),
            v = ray.vecLength,
            w = vec3.sub( [0,0,0], p0, ray.posStart ),
            a = vec3.dot( u, u ), // always >= 0
            b = vec3.dot( u, v ),
            c = vec3.dot( v, v ), // always >= 0
            d = vec3.dot( u, w ),
            e = vec3.dot( v, w ),
            D = a * c - b * b;    // always >= 0

    let tU = 0, // T Of Segment 
        tV = 0; // T Of Ray

    // Compute the line parameters of the two closest points
    if( D < 0.000001 ){	            // the lines are almost parallel
        tU = 0.0;
        tV = ( b > c ? d/b : e/c ); // use the largest denominator
    }else{
        tU = ( b*e - c*d ) / D;
        tV = ( a*e - b*d ) / D;
    }

    if( tU < 0 || tU > 1 || tV < 0 || tV > 1 ) return false;
    
    // Segment Position : u.scale( tU ).add( p0 )
    // Ray Position :     v.scale( tV ).add( this.origin ) ];
    if( results ){
        vec3.lerp( results.rayPosition, ray.posStart, ray.posEnd, tV );
        vec3.lerp( results.segPosition, p0, p1, tU );
        results.distanceSq = vec3.sqrDist( results.segPosition, results.rayPosition );
    }

    return true;
}