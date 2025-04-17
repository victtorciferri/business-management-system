declare module 'node-vibrant' {
  interface Swatch {
    hex: string;
    rgb: number[];
    hsl: number[];
    population: number;
    bodyTextColor: string;
    titleTextColor: string;
    getHex(): string;
  }

  interface Palette {
    Vibrant?: Swatch;
    Muted?: Swatch;
    DarkVibrant?: Swatch;
    DarkMuted?: Swatch;
    LightVibrant?: Swatch;
    LightMuted?: Swatch;
    [key: string]: Swatch | undefined;
  }

  interface VibrantStatic {
    from(src: string | Blob): VibrantStatic;
    getPalette(): Promise<Palette>;
  }

  export function from(src: string | Blob): VibrantStatic;
}