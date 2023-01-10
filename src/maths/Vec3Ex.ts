import { vec3 } from 'gl-matrix';

export default class Vec3Ex{
    static project( out:vec3, from: vec3, to: vec3 ) : vec3{
        // Modified from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
        // dot( a, b ) / dot( b, b ) * b
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const denom = vec3.dot( to, to );
        if( denom < 0.000001 ){
            out[ 0 ] = 0;
            out[ 1 ] = 0;
            out[ 2 ] = 0;
            return out;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const scl = vec3.dot( from, to ) / denom;
        out[ 0 ] = to[ 0 ] * scl;
        out[ 1 ] = to[ 1 ] * scl;
        out[ 2 ] = to[ 2 ] * scl;
        return out;
    }

    static projectScale( from: vec3, to: vec3 ) : number{
        // Modified from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
        // dot( a, b ) / dot( b, b ) * b
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const denom = vec3.dot( to, to );
        return ( denom < 0.000001 )? 0 : vec3.dot( from, to ) / denom;
    }
}