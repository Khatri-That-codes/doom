'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getDailyDrop, getStories, type A, type DailyDrop } from './api';
import { INTERESTS, ORE, TICKER } from './data';

const px='font-pixel';
const Badge=({c,children}:{c:string;children:React.ReactNode})=><span className={`${px} inline-block px-2 py-0.5 text-[11px] text-onore`} style={{background:ORE[c]}}>{children}</span>;
const Star=({on}:{on:boolean})=><span aria-hidden className="text-lg" style={{color:on?'var(--gold)':'inherit'}}>{on?'★':'☆'}</span>;

export default function Home(){
 const [tab,setTab]=useState(0);
 const [dark,setDark]=useState(false);
 const [saved,setSaved]=useState<Set<string>>(new Set());
 const [open,setOpen]=useState<A|null>(null);
 const [cat,setCat]=useState('All');
 const [active,setActive]=useState<string[]>(INTERESTS.slice(0,4));
 const [articles,setArticles]=useState<A[]>([]);
 const [dailyDrop,setDailyDrop]=useState<DailyDrop|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{const d=localStorage.getItem('doom-theme')==='dark';setDark(d);document.documentElement.classList.toggle('dark',d)},[]);
 useEffect(()=>{
  Promise.all([getStories(),getDailyDrop()])
   .then(([nextArticles,nextDrop])=>{setArticles(nextArticles);setDailyDrop(nextDrop);setError(null)})
   .catch((reason:unknown)=>setError(reason instanceof Error?reason.message:'Unable to load content from the backend'))
   .finally(()=>setLoading(false));
 },[]);
 const toggleTheme=()=>{const d=!dark;setDark(d);localStorage.setItem('doom-theme',d?'dark':'light');document.documentElement.classList.toggle('dark',d)};
 const bookmark=(id:string)=>setSaved(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n});
 useEffect(()=>{
  const k=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(null);
   if(tab===0&&/^[0-4]$/.test(e.key)&&!(e.target instanceof HTMLInputElement))setCat(['All','Trending','Tech','Business','Stocks'][+e.key]);
   if(/^[1-3]$/.test(e.key)&&e.altKey)setTab(+e.key-1)};
  window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[tab]);
 const tabs=['Explore','Pulse','Food for Thought'];
 return <div className="min-h-dvh pb-20 md:pb-0">
  <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b-4 border-shade/70 bg-surface px-3">
   <h1 className={`${px} text-xl font-bold`}>DOOM</h1>
   <nav className="mx-auto hidden gap-1 md:flex" aria-label="Hotbar">
    {tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`mc-btn px-4 py-1.5 text-sm ${tab===i?'mc-on bg-card':''}`}>[{i+1}] {t}</button>)}
   </nav>
   <div className="ml-auto flex items-center gap-2 md:ml-0">
    <span className={`${px} mc-slot px-2 py-1 text-xs text-emerald`} title="Saved articles">XP {saved.size*10}</span>
    <button onClick={toggleTheme} className="mc-btn px-3 py-1 text-xs" aria-label="Toggle Overworld / Deepslate">{dark?'☾ Deepslate':'☀ Overworld'}</button>
   </div>
  </header>
  <main>
   {error&&<div role="alert" className="mx-auto mt-4 max-w-6xl border-4 border-redstone bg-card p-4 text-sm">Backend unavailable: {error}</div>}
   {tab===0&&<Explore articles={articles} loading={loading} cat={cat} setCat={setCat} saved={saved} bookmark={bookmark} setOpen={setOpen}/>}
   {tab===1&&<Pulse articles={articles} active={active} setActive={setActive} saved={saved} bookmark={bookmark} setOpen={setOpen}/>}
   {tab===2&&<Food drop={dailyDrop} loading={loading} goExplore={()=>setTab(0)}/>}
  </main>
  <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-3 gap-1 border-t-4 border-shade/70 bg-surface p-1 md:hidden" aria-label="Hotbar">
   {tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`mc-btn text-[11px] leading-tight ${tab===i?'mc-on bg-card':''}`}>[{i+1}]<br/>{t}</button>)}
  </nav>
  <Reader a={open} close={()=>setOpen(null)} saved={saved} bookmark={bookmark}/>
 </div>}

function Explore({articles,loading,cat,setCat,saved,bookmark,setOpen}:any){
 const list=articles.filter((a:A)=>cat==='All'||a.cat===cat);
 const row=[...TICKER,...TICKER];
 return <>
  <div className="mc-slot overflow-hidden whitespace-nowrap py-2" aria-label="Emerald Exchange">
   <div className="tick inline-flex gap-8 pl-4">{row.map(([n,p,c],i)=><span key={i} className={`${px} text-xs`}>{n} {p} <b style={{color:c>=0?'var(--emerald)':'var(--redstone)'}}>{c>=0?'▲':'▼'}{Math.abs(c)}%</b></span>)}</div>
  </div>
  <div className="mx-auto max-w-6xl p-4">
   <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
    {['All','Trending','Tech','Business','Stocks','World'].map((c,i)=><button key={c} onClick={()=>setCat(c)} className={`mc-btn shrink-0 px-3 py-2 text-xs ${cat===c?'mc-on bg-card':''}`}>[{i}] {c}</button>)}
   </div>
   {loading&&<p className="mc-panel p-4 text-sm">Mining the latest stories...</p>}
   {!loading&&!list.length&&<p className="mc-panel p-4 text-sm">No stories are available yet. Start the backend ingestion worker to populate the feed.</p>}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {list.map((a:A)=><article key={a.id} className="mc-panel flex flex-col gap-3 p-4">
     <div className="flex items-center justify-between"><Badge c={a.cat}>{a.cat}</Badge>
      <span className={`${px} text-[11px] opacity-80`} title="Sources covering this story">▤▤ x{a.src} SOURCES</span></div>
     <h2><button onClick={()=>setOpen(a)} className="text-left text-lg font-bold leading-snug hover:underline">{a.h}</button></h2>
     <p className="text-sm leading-relaxed opacity-80">{a.t.split('. ')[0]}.</p>
     <div className="flex flex-wrap gap-1">{a.tick.map(t=><button key={t} onClick={()=>setCat('Stocks')} className={`${px} mc-slot px-2 text-[11px]`}>{t}</button>)}</div>
     <div className="mt-auto flex items-center justify-between text-xs opacity-80"><span>{a.ago} · {a.pub}</span>
      <button onClick={()=>bookmark(a.id)} aria-label="Bookmark" aria-pressed={saved.has(a.id)}><Star on={saved.has(a.id)}/></button></div>
    </article>)}
   </div>
  </div></>}

function Pulse({articles,active,setActive,saved,bookmark,setOpen}:any){
 const [tune,setTune]=useState(false);
 const [pops,setPops]=useState<number[]>([]);
 const ref=useRef<HTMLDivElement>(null); const last=useRef<[string,number]>(['',0]);
 const ranked=useMemo(()=>[...articles].map((a:A)=>({a,s:a.tags.filter(t=>active.includes(t)).length})).sort((x,y)=>y.s-x.s).map(x=>x.a),[articles,active]);
 const tap=(a:A)=>{const now=Date.now();if(last.current[0]===a.id&&now-last.current[1]<300){if(!saved.has(a.id))bookmark(a.id);const k=now;setPops(p=>[...p,k]);setTimeout(()=>setPops(p=>p.filter(x=>x!==k)),1100)}last.current=[a.id,now]};
 const go=(d:number)=>ref.current?.scrollBy({top:d*ref.current.clientHeight,behavior:'smooth'});
 return <div className="relative h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-3.5rem)]">
  <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-surface/95 p-2">
   <div className="flex flex-1 gap-1 overflow-x-auto">{active.map((t:string)=><span key={t} className={`${px} mc-slot shrink-0 px-2 py-1 text-[11px]`}>{t}</span>)}</div>
   <button onClick={()=>setTune(true)} className="mc-btn px-3 py-1 text-xs">TUNE</button></div>
  <div ref={ref} className="h-full snap-y snap-mandatory overflow-y-auto">
   {ranked.map(a=><section key={a.id} onClick={()=>tap(a)} className="flex h-full snap-start items-center justify-center p-4 pt-16 select-none">
    <div className="mc-panel flex max-h-full w-full max-w-xl flex-col gap-4 overflow-auto p-6">
     <div className="flex justify-between"><Badge c={a.cat}>{a.cat}</Badge><span className={`${px} text-[11px]`}>x{a.src} SOURCES</span></div>
     <h2 className="text-2xl font-bold leading-tight">{a.h}</h2>
     <p className="leading-relaxed">{a.t}</p>
     <p className="text-xs opacity-70">Double-tap to save · {a.ago}</p>
     <button onClick={e=>{e.stopPropagation();setOpen(a)}} className="mc-btn px-4 py-2 text-sm">Read Full Story</button>
     {saved.has(a.id)&&<p className={`${px} text-xs text-emerald`}>★ SAVED</p>}
    </div></section>)}
  </div>
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{pops.map(k=><span key={k} className={`xp ${px} absolute bg-emerald px-3 py-2 text-sm text-onore`}>+10 XP SAVED!</span>)}</div>
  <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
   <button className="mc-btn px-3 py-2" onClick={()=>go(-1)} aria-label="Previous">▲</button><button className="mc-btn px-3 py-2" onClick={()=>go(1)} aria-label="Next">▼</button></div>
  {tune&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-shade/60 p-4" onClick={()=>setTune(false)}>
   <div className="mc-panel w-full max-w-sm p-5" onClick={e=>e.stopPropagation()} role="dialog" aria-label="Tune your feed">
    <h3 className={`${px} mb-3 text-lg`}>Tune your feed</h3>
    <div className="flex flex-wrap gap-2">{INTERESTS.map(t=>{const on=active.includes(t);return <button key={t} aria-pressed={on} onClick={()=>setActive(on?active.filter((x:string)=>x!==t):[...active,t])} className={`mc-btn px-3 py-1.5 text-xs ${on?'mc-on bg-emerald text-onore':''}`}>{t}</button>})}</div>
    <button onClick={()=>setTune(false)} className="mc-btn mt-4 w-full py-2 text-sm">Done</button></div></div>}
 </div>}

function Food({drop,loading,goExplore}:{drop:DailyDrop|null;loading:boolean;goExplore:()=>void}){
 const [vote,setVote]=useState<number|null>(null);
 const [left,setLeft]=useState('');
 useEffect(()=>{const f=()=>{const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.floor((+m-+n)/1000);setLeft([s/3600,s/60%60,s%60].map(v=>String(Math.floor(v)).padStart(2,'0')).join(':'))};f();const i=setInterval(f,1000);return()=>clearInterval(i)},[]);
 const base=[412,268];const tot=base[0]+base[1]+(vote===null?0:1);
 const pct=(i:number)=>Math.round((base[i]+(vote===i?1:0))/tot*100);
 return <div className="mx-auto max-w-2xl p-4">
  <article className="mc-panel p-6 md:p-10" style={{background:'color-mix(in srgb,var(--card) 90%,var(--amethyst))'}}>
   {loading&&<p className="text-sm">Loading today&apos;s drop...</p>}
   {drop&&<><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><Badge c="Food">{drop.topicBadge}</Badge><span className="text-xs opacity-70">Daily Drop</span></div>
   <h2 className="mb-4 text-3xl font-bold leading-tight">{drop.hook}</h2>
   <p className="mb-4 text-lg leading-8">{drop.breakdown}</p>
   <aside className="mc-slot my-6 p-4"><h3 className={`${px} mb-1 text-sm text-amethyst`}>Why it matters in today's news</h3>
    <p className="mb-2 text-sm leading-relaxed">{drop.newsBridge}</p>
    <button onClick={goExplore} className="mc-btn px-3 py-1.5 text-xs">Back to Explore</button></aside>
   <h3 className="mb-2 font-bold">{drop.question}</h3>
   <div className="grid gap-2">{drop.options.map((o,i)=><button key={i} disabled={vote!==null} onClick={()=>setVote(i)} className="mc-btn relative overflow-hidden p-3 text-left text-sm">
    {vote!==null&&<span className="absolute inset-y-0 left-0 bg-amethyst/50 transition-all duration-700" style={{width:pct(i)+'%'}}/>}
    <span className="relative flex justify-between font-body"><span>{o}</span>{vote!==null&&<b>{pct(i)}%</b>}</span></button>)}</div>
   <p className={`${px} mt-6 text-center text-xs`}>Next drop in {left||'--:--:--'}</p></>}
  </article></div>}

function Reader({a,close,saved,bookmark}:{a:A|null;close:()=>void;saved:Set<string>;bookmark:(id:string)=>void}){
 return <><div onClick={close} className={`fixed inset-0 z-40 bg-shade/60 transition-opacity ${a?'opacity-100':'pointer-events-none opacity-0'}`}/>
  <aside aria-hidden={!a} className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l-4 border-shade/70 bg-canvas p-5 transition-transform duration-300 ${a?'translate-x-0':'translate-x-full'}`}>
   {a&&<>
    <div className="mb-4 flex items-center justify-between"><button onClick={close} className="mc-btn px-3 py-1 text-xs">✕ Close</button>
     <button onClick={()=>bookmark(a.id)} className="mc-btn px-3 py-1 text-xs" aria-pressed={saved.has(a.id)}><Star on={saved.has(a.id)}/> {saved.has(a.id)?'Saved':'Save'}</button></div>
    <div className="mb-3 flex items-center gap-2"><Badge c={a.cat}>{a.cat}</Badge><span className={`${px} text-[11px]`}>x{a.src} SOURCES</span></div>
    <h2 className="mb-4 text-2xl font-bold leading-tight">{a.h}</h2>
    <div className="mc-slot mb-4 p-3"><h3 className={`${px} mb-1 text-xs text-diamond`}>TL;DR</h3><p className="text-sm leading-relaxed">{a.t}</p></div>
    {a.body.map((p,i)=><p key={i} className="mb-4 leading-8">{p}</p>)}
    <a href={a.url} target="_blank" rel="noopener noreferrer" className="mc-btn inline-block px-4 py-2 text-sm">Read on {a.pub}</a></>}
  </aside></>}
