import './globals.css';
import { Silkscreen, Inter } from 'next/font/google';
const pixel=Silkscreen({weight:['400','700'],subsets:['latin'],variable:'--font-pixel'});
const body=Inter({subsets:['latin'],variable:'--font-body'});
export const metadata={title:'Doom',description:'News, mined daily.'};
export default function L({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning className={`${pixel.variable} ${body.variable}`}><body>{children}</body></html>}
