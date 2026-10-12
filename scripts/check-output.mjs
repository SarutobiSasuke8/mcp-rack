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
const sourceServers=JSON.parse(read(join(root,'src/content/servers.json')));
const sourceRack=JSON.parse(read(join(root,'src/content/rack.json')));
const legacy=JSON.parse(read(join(dist,'servers.json')));
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
  const source=(collection==='servers'?sourceServers:sourceRack).find(s=>s.slug===item.slug);
  assert(source,'Missing source record: '+item.slug);
  assert.equal(item.reviewedAt,source.reviewedAt??null,'Review date drift: '+item.slug);
  assert.deepEqual(item.review,source.review??null,'Review evidence drift: '+item.slug);
  if(collection==='servers'){
   assert(schema.properties.servers.items.properties.status.enum.includes(item.status));
   const markdown=read(resolvePath(new URL(item.markdownUrl).pathname));
   const html=read(resolvePath(new URL(item.url).pathname));
   assert(markdown.includes('Status: '+item.status));
   assert(html.includes('status-'+item.status));
   assert(html.includes('/standards/#status-labels"'),'Maturity anchor is malformed: '+item.slug);
   assert.deepEqual(legacy.servers.find(s=>s.slug===item.slug)?.review,item.review);
   if(item.reviewedAt){
    assert(markdown.includes(item.reviewedAt)&&markdown.includes(item.review.kind));
    assert(html.includes('datetime="'+item.reviewedAt+'"'));
    assert(read(join(dist,'llms-full.txt')).includes(item.review.summary));
   }
  }else assert.equal(item.selectionBasis,source.selectionBasis);
 }
}
// Hosted endpoints: link only when live, say "coming soon" otherwise, and list hosted products only on /hosted.
const hostedPage=read(resolvePath(base+'/hosted/'));
const hostedServers=catalog.servers.filter(s=>s.hosted);
for(const item of catalog.servers){
 const source=sourceServers.find(s=>s.slug===item.slug);
 assert.deepEqual(item.hosted,source.hosted??null,'Hosted drift: '+item.slug);
 assert.deepEqual(legacy.servers.find(s=>s.slug===item.slug)?.hosted,item.hosted,'Hosted drift in servers.json: '+item.slug);
 const html=read(resolvePath(new URL(item.url).pathname));
 if(!item.hosted){assert(!html.includes('data-hosted='),'Unexpected hosted block: '+item.slug);continue;}
 const linked=page=>page.includes('href="'+item.hosted.url+'"')||page.includes('href="'+item.hosted.url+'/"');
 for(const [where,page] of [[item.slug,html],['/hosted',hostedPage]]){
  if(item.hosted.live)assert(linked(page)&&page.includes('Use it hosted'),where+' must link the live hosted endpoint for '+item.slug);
  else{assert(!linked(page),where+' links a hosted endpoint that is not live: '+item.slug);assert(page.includes('Coming soon'),where+' must say coming soon for '+item.slug);}
 }
}
assert.equal((hostedPage.match(/data-hosted="/g)||[]).length,hostedServers.length,'/hosted must list every hosted product and nothing else');
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
// /sitemap.xml is the conventional path crawlers probe; it must point at a child sitemap that exists.
const conventional=read(join(dist,'sitemap.xml'));
for(const loc of conventional.matchAll(/<loc>([^<]+)<\/loc>/g))assert(existsSync(resolvePath(new URL(loc[1]).pathname)),'sitemap.xml references a missing child: '+loc[1]);
assert(existsSync(join(dist,'404.html')));
for(const name of ['openai','claude','perplexity','grok']){
 const icon=read(join(dist,'clients',name+'.svg'));
 assert(icon.includes('<svg')&&!/<script|<foreignObject|\bonload=/i.test(icon),'Invalid client logo '+name);
}
console.log('output: '+pages.length+' pages, '+count+' internal references, catalog, Markdown, JSON-LD, brand assets and sitemap passed');
