import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=join(root,'dist');
const origin=new URL(process.env.SITE_URL||'https://mcprack.dev').origin;
const base=(process.env.SITE_BASE||'/').replace(/\/$/,'');
const read=p=>readFileSync(p,'utf8');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const resolvePath=pathname=>{
 assert(!base||pathname===base||pathname.startsWith(base+'/'),'Internal URL escaped deployment base: '+pathname);
 let target=join(dist,decodeURIComponent(pathname.slice(base.length)));
 if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');
 return target;
};
const catalog=JSON.parse(read(join(dist,'catalog.json')));
const schema=JSON.parse(read(join(dist,'catalog.schema.json')));
assert.equal(catalog.schemaVersion,schema.properties.schemaVersion.const);
for(const key of schema.required)assert(key in catalog,'Missing catalog field '+key);
assert.equal(catalog.website,origin+base+'/');
assert(Number.isFinite(Date.parse(catalog.generatedAt)));
for(const [collection,kind]of [['servers','owner-built'],['curated','curated']]){
 const slugs=new Set();
 for(const item of catalog[collection]){
  assert.equal(item.listingType,kind);
  assert(!slugs.has(item.slug),'Duplicate slug: '+item.slug);slugs.add(item.slug);
  assert(item.reviewedAt===null||Number.isFinite(Date.parse(item.reviewedAt)));
 }
}
for(const item of [...catalog.servers,...catalog.articles]){
 assert(existsSync(resolvePath(new URL(item.markdownUrl).pathname)),'Missing Markdown: '+item.slug);
 assert(!item.draft,'Draft exposed: '+item.slug);
}
let count=0;
const pages=walk(dist).filter(p=>p.endsWith('.html'));
for(const file of pages){
 const html=read(file),rel=relative(dist,file).replaceAll('\\','/');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,rel+' must have one H1');
 const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
 assert(canonical?.startsWith(origin+base+'/'),'Wrong canonical: '+rel);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const raw=match[1].replaceAll('&amp;','&');
  if(!raw.startsWith('/')||raw.startsWith('//'))continue;
  assert(existsSync(resolvePath(new URL(raw,origin).pathname)),rel+' broken reference: '+raw);count++;
 }
 for(const match of html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
 const image=html.match(/property="og:image" content="([^"]+)"/)?.[1];
 if(image)assert(existsSync(resolvePath(new URL(image).pathname)),'Missing social image: '+rel);
}
const robots=read(join(dist,'robots.txt'));
assert(robots.includes('Sitemap: '+origin+base+'/sitemap-index.xml'));
assert(existsSync(join(dist,'404.html')));
for(const name of ['openai','claude','perplexity','grok']){
 const icon=read(join(dist,'clients',name+'.svg'));
 assert(icon.includes('<svg')&&!/<script|<foreignObject|\bonload=/i.test(icon),'Invalid client logo '+name);
}
console.log('output: '+pages.length+' pages, '+count+' internal references, catalog, Markdown, JSON-LD, brand assets and sitemap passed');
