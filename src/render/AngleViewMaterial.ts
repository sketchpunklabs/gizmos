// @ts-nocheck

import * as THREE from 'three';

export default function AngleViewMaterials(): THREE.Material{
    const mat = new THREE.RawShaderMaterial({
        depthTest       : true,
        side            : THREE.DoubleSide,
        transparent     : true, 

        uniforms        : {
            radArc   : { type :'float', value: 45 * Math.PI / 180 },
            radAngle : { type :'float', value: 0 },
        },

        extensions      : { 
            derivatives : true
        },

        vertexShader    : `#version 300 es
        in	vec3    position;
        in  vec3    normal;
        in	vec2    uv;
        
        uniform     mat4    modelMatrix;
        uniform     mat4    viewMatrix;
        uniform     mat4    projectionMatrix;

        out vec3    fragWPos;  // World Space Position
        out vec3    fragNorm;
        out vec2    fragUV;
        
        // ################################################################

        void main(){
            vec4 wPos 	        = modelMatrix * vec4( position, 1.0 );  // World Space
            vec4 vPos           = viewMatrix * wPos;               // View Space
            
            fragUV              = uv;
            fragWPos            = wPos.xyz;
            fragNorm            = ( modelMatrix * vec4( normal, 0.0 ) ).xyz;

            gl_Position			= projectionMatrix * vPos;
        }`,

        fragmentShader  : `#version 300 es
        precision mediump float;

        in  vec3    fragWPos;
        in  vec3    fragNorm;
        in  vec2    fragUV;
        out vec4    outColor;

        uniform float radArc;
        uniform float radAngle;

        // ################################################################

        float ring( vec2 coord, float outer, float inner ){ 
            float radius = dot( coord, coord );
            float dxdy   = fwidth( radius );
            return  smoothstep( inner - dxdy, inner + dxdy, radius ) - 
                    smoothstep( outer - dxdy, outer + dxdy, radius );
        }

        float circle( vec2 coord, float outer ){ 
            float radius = dot( coord, coord );
            float dxdy   = fwidth( radius );
            return 1.0 - smoothstep( outer - dxdy, outer + dxdy, radius );
        }

        // https://www.shadertoy.com/view/XtXyDn
        float arc( vec2 uv, vec2 up, float angle, float radius, float thick ){
            float hAngle = angle * 0.5;

            // vector from the circle origin to the middle of the arc
            float c  = cos( hAngle );
            
            // smoothing perpendicular to the arc
            float d1 = abs( length( uv ) - radius ) - thick;
            float w1 = 1.5 * fwidth( d1 ); // proportional to how much d1 change between pixels
            float s1 = smoothstep( w1 * 0.5, -w1 * 0.5, d1 ); 

            // smoothing along the arc
            float d2 = dot( up, normalize( uv ) ) - c;
            float w2 = 1.5 * fwidth( d2 ); // proportional to how much d2 changes between pixels
            float s2 = smoothstep( w2 * 0.5, -w2 * 0.5, d2 ); 

            // mix perpendicular and parallel smoothing
            return s1 * ( 1.0 - s2 );
        }

        // ################################################################

        void main(){
            vec2  uv    = fragUV * 2.0 - 1.0;  // Remap 0:1 to -1:1
            // vec3 norm   = normalize( fragNorm );
            // outColor    = vec4( norm, 1.0 );

            float mask  = 0.0;
            float radOffset = radians( 90.0 );
            // float radAngle  = radians( 0.0 ) + radOffset;
            // float radArc    = radians( 90.0 );

            float radDir    = radAngle + radOffset + radArc * 0.5;
            vec2  centerDir = vec2( cos( radDir ), sin( radDir ) );

            mask = arc( uv, centerDir, radArc, 0.60, 0.25 );
            mask = max( mask, ring( uv, 0.98, 0.85 ) );
            mask = max( mask, circle( uv, 0.08 ) );
            
            outColor.rgb = vec3( mask );
            outColor.a   = mask;
        }`
    });

    Object.defineProperty( mat, 'degAngle', { 
        set: ( v )=>{ mat.uniforms.radAngle.value = v * Math.PI / 180; } 
    });

    Object.defineProperty( mat, 'degArc', { 
        set: ( v )=>{ mat.uniforms.radArc.value = v * Math.PI / 180; } 
    });

    Object.defineProperty( mat, 'radArc', { 
        set: ( v )=>{ mat.uniforms.radArc.value = v; } 
    });
    
    return mat;
}