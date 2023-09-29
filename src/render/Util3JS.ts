/* eslint-disable @typescript-eslint/no-explicit-any */
import { BufferGeometry, BufferAttribute }                  from 'three';

export default class Util3JS{

    static geoBuffer( props: any ): BufferGeometry{
        const geo = new BufferGeometry();
        geo.setAttribute( 'position', new BufferAttribute( props.vertices, 3 ) );
    
        if( props.indices ) geo.setIndex( new BufferAttribute( props.indices, 1 ) );
        if( props.normal )  geo.setAttribute( 'normal', new BufferAttribute( props.normal, 3 ) );
        if( props.uv )      geo.setAttribute( 'uv', new BufferAttribute( props.uv, 2 ) );
    
        return geo;
    }

    static glColor( hex: number, out: Array<number> = [0,0,0] ): Array<number>{
        const NORMALIZE_RGB = 1 / 255;
        out[0] = ( hex >> 16 & 255 ) * NORMALIZE_RGB;
        out[1] = ( hex >> 8 & 255 )  * NORMALIZE_RGB;
        out[2] = ( hex & 255 )       * NORMALIZE_RGB;
    
        return out;
    }

}

