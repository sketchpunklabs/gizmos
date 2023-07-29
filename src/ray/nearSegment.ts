import type Ray from './Ray';
import Vec3 from '../maths/Vec3';

export class NearSegmentResult{
    segPosition : TVec3  = [0,0,0];
    rayPosition : TVec3  = [0,0,0];
    distanceSq  : number = 0;
    distance    : number = 0;
}

/** Returns [ T of Segment, T of RayLen ] */
export function nearSegment( ray: Ray, p0: ConstVec3, p1: ConstVec3, results ?: NearSegmentResult ) : Array<number> | null{
    // http://geomalgorithms.com/a07-_distance.html
    const u = new Vec3( p1 ).sub( p0 );
    const v = ray.vecLength;
    const w = new Vec3( p0 ).sub( ray.posStart );
    const a = Vec3.dot( u, u ); // always >= 0
    const b = Vec3.dot( u, v );
    const c = Vec3.dot( v, v ); // always >= 0
    const d = Vec3.dot( u, w );
    const e = Vec3.dot( v, w );
    const D = a * c - b * b;    // always >= 0

    let tU = 0; // T Of Segment 
    let tV = 0; // T Of Ray

    // Compute the line parameters of the two closest points
    if( D < 0.000001 ){	            // the lines are almost parallel
        tU = 0.0;
        tV = ( b > c ? d/b : e/c ); // use the largest denominator
    }else{
        tU = ( b*e - c*d ) / D;
        tV = ( a*e - b*d ) / D;
    }

    if( tU < 0 || tU > 1 || tV < 0 || tV > 1 ) return null;
    
    // Segment Position : u.scale( tU ).add( p0 )
    // Ray Position :     v.scale( tV ).add( this.origin ) ];
    if( results ){
        const ti = 1 - tU;
        results.segPosition[ 0 ] = p0[0] * ti + p1[0] * tU;
        results.segPosition[ 1 ] = p0[1] * ti + p1[1] * tU;
        results.segPosition[ 2 ] = p0[2] * ti + p1[2] * tU;
        
        ray.posAt( tV, results.rayPosition );
        
        results.distanceSq = Vec3.distSqr( results.segPosition, results.rayPosition );
        results.distance   = Math.sqrt( results.distanceSq );
    }

    return [ tU, tV ];
}