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

}

