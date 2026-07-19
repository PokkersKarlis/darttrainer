export type Breakpoint = 'compact' | 'medium' | 'wide';

export type DesignType = 'portrait' | 'landscape' | 'square';

export type DisplayFrame = {
    width: number;
    height: number;
    breakpoint: Breakpoint;
    designType: DesignType;
};
