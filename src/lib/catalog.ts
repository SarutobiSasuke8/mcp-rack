import {getCollection} from 'astro:content';
import {SITE,absolute} from './site';
/** Projects that support MCP work but are not MCP servers themselves. */
export const companionTools=new Set(['mcp-dashboard','mcp-host-gateway','mcp-eval-harness']);
export const CATALOG_SCHEMA_VERSION='1.2.0';
export async function catalog(site:URL|undefined){
const servers=(await getCollection('servers')).sort((a,b)=>a.data.order-b.data.order);
const rack=await getCollection('rack');
const posts=(await getCollection('posts',({data})=>!data.draft)).sort((a,b)=>b.data.pubDate.valueOf()-a.data.pubDate.valueOf());
return {schemaVersion:CATALOG_SCHEMA_VERSION,generatedAt:new Date().toISOString(),generatedAtMeaning:'Build time, not a verification date.',name:SITE.name,description:SITE.description,website:absolute('/',site),editorialPolicy:absolute('/standards',site),
provenance:'Maintainer-authored metadata. Inclusion is not an independent security audit. Confirm current versions and permissions with the source.',
servers:servers.map(({data:s})=>({...s,listingType:'owner-built',author:SITE.owner.name,softwareType:companionTools.has(s.slug)?'companion-tool':'mcp-server',hosted:s.hosted??null,url:absolute('/servers/'+s.slug,site),markdownUrl:absolute('/servers/'+s.slug+'.md',site),docs:s.docs??s.repo})),
curated:rack.map(({data:r})=>({...r,listingType:'curated',independentAudit:false})),
articles:posts.map(p=>({slug:p.id,...p.data,url:absolute('/blog/'+p.id,site),markdownUrl:absolute('/blog/'+p.id+'.md',site)}))};
}
