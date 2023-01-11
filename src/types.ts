import type  Ray from './ray/Ray';

export interface IGizmo{
    onHover( ray: Ray ) : boolean;
    onDown( ray: Ray )  : string | null;
    onUp()              : void;
};