declare module 'node-vibrant' {
  interface Swatch {
    hex: string;
    rgb: number[];
    hsl: number[];
    population: number;
    bodyTextColor: string;
    titleTextColor: string;
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

  const Vibrant: {
    from(src: string | Blob): VibrantStatic;
  };

  export default Vibrant;
}