import Ray  from './Ray';
import Vec3 from '../maths/Vec3';

export default function intersectOBB( ray: Ray, center:ConstVec3, xDir: ConstVec3, yDir: ConstVec3, zDir: ConstVec3, halfLen: ConstVec3 ):  [number, number] | null{
    const rayDelta  = new Vec3( center ).sub( ray.posStart ); // Distance between Ray start and Box Position
    let tMin        = 0;
    let tMax        = 1000000;
    let axis        : ConstVec3;
    let nomLen      : number;
    let denomLen    : number;
    let tmp         : number; 
    let min         : number;
    let max         : number;
    const list      = [ xDir, yDir, zDir ];

    for( let i=0; i < 3; i++){
        axis        = list[ i ];
        nomLen      = Vec3.dot( axis, rayDelta ); 	    // Get the length of Axis and distance to ray position
        denomLen    = Vec3.dot( ray.vecLength, axis );  // Get Length of ray and axis

        if( Math.abs( denomLen ) > 0.00001 ){ // Can't divide by Zero
            min = ( nomLen - halfLen[i] ) / denomLen;
            max = ( nomLen + halfLen[i] ) / denomLen;

            if( min > max ){  tmp = min; min = max; max = tmp; }    // Swap
            if( min > tMin ){ tMin = min;  }            // Biggest Min
            if( max < tMax ){ tMax = max;  }            // Smallest Max

            if( tMax < tMin ) return null;
        }else if(
            -nomLen - halfLen[i] > 0 || 
            -nomLen + halfLen[i] < 0 ) return null;  // Are almost parallel check
    }

    return [tMin,tMax];
}