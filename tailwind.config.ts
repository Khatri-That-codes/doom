import type { Config } from 'tailwindcss';
// Colours live in app/globals.css. This only maps them to class names (opacity modifiers like /50 supported).
const v=(n:string)=>`color-mix(in srgb, var(--${n}) calc(<alpha-value> * 100%), transparent)`;
export default { content:['./app/**/*.{ts,tsx}'], darkMode:'class',
 theme:{extend:{colors:Object.fromEntries(['canvas','surface','card','ink','shade','onore','redstone','diamond','gold','emerald','amethyst'].map(n=>[n,v(n)])),
  fontFamily:{pixel:['var(--font-pixel)','monospace'],body:['var(--font-body)','sans-serif']}}}} satisfies Config;
