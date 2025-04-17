declare module 'tinycolor2' {
  interface TinyColor {
    toHexString(): string;
    toRgbString(): string;
    toHslString(): string;
    toName(): string | false;
    isDark(): boolean;
    isLight(): boolean;
    getLuminance(): number;
    getAlpha(): number;
    getBrightness(): number;
    setAlpha(alpha: number): TinyColor;
    toHsv(): { h: number; s: number; v: number; a: number };
    toHsl(): { h: number; s: number; l: number; a: number };
    toRgb(): { r: number; g: number; b: number; a: number };
    toPercentageRgb(): { r: string; g: string; b: string; a: number };
    toString(format?: string): string;
    toHex(allow3Char?: boolean): string;
    clone(): TinyColor;
  }

  function tinycolor(
    color: string | { [key: string]: any } | TinyColor,
    opts?: { format?: string; gradientType?: boolean }
  ): TinyColor;

  namespace tinycolor {
    export function equals(color1: string, color2: string): boolean;
    export function mix(color1: string, color2: string, amount?: number): TinyColor;
    export function random(): TinyColor;
    export function readability(color1: string, color2: string): number;
    export function isReadable(
      color1: string,
      color2: string,
      wcag2?: { level?: string; size?: string }
    ): boolean;
    export function mostReadable(
      baseColor: string,
      colorList: string[],
      args?: { includeFallbackColors?: boolean; level?: string; size?: string }
    ): TinyColor;
    export function fromRatio(ratio: { r: number; g: number; b: number; a?: number }): TinyColor;
  }

  export = tinycolor;
}