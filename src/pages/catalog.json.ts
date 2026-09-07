import type {APIContext} from 'astro';
import {catalog} from '~/lib/catalog';
export async function GET({site}:APIContext){return new Response(JSON.stringify(await catalog(site),null,2),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
