import {getCollection} from 'astro:content';
import type {APIContext} from 'astro';
import {absolute} from '~/lib/site';
export async function getStaticPaths(){return(await getCollection('posts',({data})=>!data.draft)).map(post=>({params:{slug:post.id},props:{post}}));}
export function GET({props,site}:APIContext){const p=props.post;return new Response(['# '+p.data.title,'',p.data.description,'','Published: '+p.data.pubDate.toISOString().slice(0,10),'Source: '+absolute('/blog/'+p.id,site),'',p.body??''].join('\n'),{headers:{'Content-Type':'text/markdown; charset=utf-8'}});}
