import {getCollection} from 'astro:content';
import type {APIContext} from 'astro';
import {absolute} from '~/lib/site';
import {reviewLines} from '~/lib/maturity';
export async function getStaticPaths(){return(await getCollection('servers')).map(({data:s})=>({params:{slug:s.slug},props:{server:s}}));}
export function GET({props,site}:APIContext){
  const s=props.server;
  const lines=['# '+s.name,'',s.tagline,'',s.summary,'',
    'Source: '+(s.repo??'Not public'),
    'Docs: '+(s.docs??s.repo??'Not available'),
    'Listing: '+absolute('/servers/'+s.slug,site),
    'Status: '+s.status,'Transport: '+s.transport,'License: '+s.license,
    ...reviewLines(s),
    ...(s.supportedScope?['Supported scope: '+s.supportedScope]:[]),
    ...(s.maturityEvidence?['Promotion evidence: '+s.maturityEvidence]:[]),
    'Package: '+(s.package?s.package.name+' '+(s.package.version??''):s.repo?'Source only':'Not publicly available'),
    ...(s.availability?['','## Availability','',s.availability]:[]),
    '','## Highlights','',...s.highlights.map((h:string)=>'- '+h),
    ...(s.limitations.length?['','## Current limitations','',...s.limitations.map((h:string)=>'- '+h)]:[]),
    ...(s.interestUrl?['','## Express interest','',s.interestUrl,'No release date or access promise.']:[]),
    '','## Setup','',s.install?'Claude Code command:\n\n    '+s.install:s.repo?'No install command recorded; consult the repository.':'Private preview; no public install is available.',
    '','Check prerequisites, permissions and current versions. Inclusion is not an independent security audit.'];
  return new Response(lines.join('\n'),{headers:{'Content-Type':'text/markdown; charset=utf-8'}});
}
