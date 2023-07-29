export {};

import type  Ray from './ray/Ray';

declare global{
    type TVec2          = [number,number] | Float32Array | Array<number> | number[];
    type ConstVec2      = Readonly< TVec2 >;
    
    type TVec3          = [number,number,number] | Float32Array | Array<number> | number[];
    type ConstVec3      = Readonly< TVec3 >;

    type TVec4          = [number,number,number,number] | Float32Array | Array<number> | number[];
    type ConstVec4      = Readonly< TVec4 >;

    type TVec3Struct    = { x: number, y:number, z:number };

    type TMat3          = Float32Array | Array< number > | number[]; // Matrix 3x3
    type ConstMat3      = Readonly< TMat3 >

    type TMat4          = Float32Array | Array< number > | number[];
    type ConstMat4      = Readonly< TMat4 >;

    interface IGizmo{
        onHover( ray: Ray ) : boolean;
        onDown( ray: Ray )  : string | null;
        onUp()              : void;
    }
}