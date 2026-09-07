import {getCollection} from 'astro:content';
import type {APIContext} from 'astro';
import {catalog} from '~/lib/catalog';
export async function GET({site}:APIContext){const c=await catalog(site);const posts=await getCollection('posts',({data})=>!data.draft);
const lines=['# MCP Rack',c.description,'',c.provenance,'Generated: '+c.generatedAt,c.generatedAtMeaning,'','## Owner-built projects',...c.servers.flatMap(s=>['','# '+s.name,s.url,s.summary,'Status: '+s.status,'Transport: '+s.transport,'License: '+s.license,'Source: '+s.repo,...s.highlights.map(h=>'- '+h),'Install: '+(s.install??'Consult source.')]),'','## Curated picks',...c.curated.flatMap(r=>['','# '+r.name,'Maker: '+r.by,r.url,r.blurb,'Use: '+r.useCase]),'','## Journal',...posts.flatMap(p=>['','# '+p.data.title,p.data.pubDate.toISOString().slice(0,10),p.body??''])];return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
