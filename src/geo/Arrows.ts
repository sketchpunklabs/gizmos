export default class Arrows{
    static single( maxH=1, minH=0.5, maxW=0.5, minW=0.2 ): Array<number>{
        const out: Array<number> = [];
        out.push(
            0,0,maxH,
            maxW,0,minH,
            minW,0,minH,
            minW,0,0,
            -minW,0,0,
            -minW,0,minH,
            -maxW,0,minH,
        );

        return out;
    }

    static double( maxH=1, minH=0.4, maxW=0.5, minW=0.25 ): Array<number>{
        const out: Array<number> = [];
        out.push(
            0,0,maxH,
            maxW,0,minH,
            minW,0,minH,

            minW,0,-minH,
            maxW,0,-minH,
            0,0,-maxH,

            -maxW,0,-minH,
            -minW,0,-minH,
            -minW,0,minH,
            -maxW,0,minH,
        );

        return out;
    }

    static quad( base=0.2, maxH=1, minH=0.6, maxW=0.35 ): Array<number>{
        const out: Array<number> = [];
        out.push(
            // Forward
            0,0,maxH,
            maxW,0,minH,
            base,0,minH,
            base,0,base, //x

            // Right
            minH,0,base,
            minH,0,maxW,
            maxH,0,0,
            minH,0,-maxW,
            minH,0,-base,
            base,0,-base, //x
            
            // Back
            base,0,-minH,
            maxW,0,-minH,
            0,0,-maxH,
            -maxW,0,-minH,
            -base,0,-minH,
            -base,0,-base, //x

            // Left
            -minH,0,-base,
            -minH,0,-maxW,
            -maxH,0,0,
            -minH,0,maxW,
            -minH,0,base,
            -base,0,base, //x

            // Rest of Front
            -base,0,minH,
            -maxW,0,minH,
        );

        return out;
    }
}