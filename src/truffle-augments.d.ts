/// <reference path="../node_modules/@sundaysky/smartvideo-hub-truffle-component-library/dist/augments.d.ts" />

declare module "@mui/material/styles/createPalette" {
    interface Brand {
        gradientBlackBlue: string;
        gradientMagentaBlue: string;
        gradientMagentaOrange: string;
    }
    interface Other {
        editorBackground: string;
    }
    interface Palette {
        brand: Brand;
        other: Other;
    }
    interface PaletteOptions {
        brand?: Brand;
        other?: Other;
    }
}

export {};
