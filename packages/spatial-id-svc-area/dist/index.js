import*as a from"spatial-id-svc-base";var e={d:(a,o)=>{for(var t in o)e.o(o,t)&&!e.o(a,t)&&Object.defineProperty(a,t,{enumerable:!0,get:o[t]})},o:(a,e)=>Object.prototype.hasOwnProperty.call(a,e)},o={};e.d(o,{FC:()=>n,a$:()=>h,oq:()=>l,Y8:()=>b,C3:()=>s,DB:()=>r,Pv:()=>i,pK:()=>d,l9:()=>c});const t=(f={fetchJson:()=>a.fetchJson,fetchJsonStream:()=>a.fetchJsonStream},p={},e.d(p,f),p),r=async function*({baseUrl:a,authInfo:e,payload:o,abortSignal:r}){for await(const s of(0,t.fetchJsonStream)({method:"POST",baseUrl:a,path:"/area_service/blocked_areas_list",authInfo:e,payload:o,abortSignal:r}))yield s},s=async({baseUrl:a,authInfo:e,id:o,abortSignal:r})=>await(0,t.fetchJson)({method:"GET",baseUrl:a,path:`/area_service/blocked_areas/${encodeURIComponent(o)}`,authInfo:e,abortSignal:r}),n=async({baseUrl:a,authInfo:e,payload:o,abortSignal:r})=>await(0,t.fetchJson)({method:"POST",baseUrl:a,path:"/area_service/blocked_areas",authInfo:e,payload:o,abortSignal:r}),l=async({baseUrl:a,authInfo:e,id:o,abortSignal:r})=>{await(0,t.fetchJson)({method:"DELETE",baseUrl:a,path:`/area_service/blocked_areas/${encodeURIComponent(o)}`,authInfo:e,abortSignal:r})},c=async function*({baseUrl:a,authInfo:e,payload:o,abortSignal:r}){for await(const s of(0,t.fetchJsonStream)({method:"POST",baseUrl:a,path:"/area_service/blocked_areas_events",authInfo:e,payload:o,abortSignal:r}))yield s},d=async function*({baseUrl:a,authInfo:e,payload:o,abortSignal:r}){for await(const s of(0,t.fetchJsonStream)({method:"POST",baseUrl:a,path:"/area_service/reserved_areas_list",authInfo:e,payload:o,abortSignal:r}))yield s},i=async({baseUrl:a,authInfo:e,id:o,abortSignal:r})=>await(0,t.fetchJson)({method:"GET",baseUrl:a,path:`/area_service/reserved_areas/${encodeURIComponent(o)}`,authInfo:e,abortSignal:r}),h=async({baseUrl:a,authInfo:e,payload:o,abortSignal:r})=>await(0,t.fetchJson)({method:"POST",baseUrl:a,path:"/area_service/reserved_areas",authInfo:e,payload:o,abortSignal:r}),b=async({baseUrl:a,authInfo:e,id:o,abortSignal:r})=>{await(0,t.fetchJson)({method:"DELETE",baseUrl:a,path:`/area_service/reserved_areas/${encodeURIComponent(o)}`,authInfo:e,abortSignal:r})};var f,p,S=o.FC,y=o.a$,v=o.oq,g=o.Y8,u=o.C3,I=o.DB,U=o.Pv,m=o.pK,_=o.l9;export{S as createBlockedArea,y as createReservedArea,v as deleteBlockedArea,g as deleteReservedArea,u as getBlockedArea,I as getBlockedAreas,U as getReservedArea,m as getReservedAreas,_ as watchBlockedAreas};
//# sourceMappingURL=index.js.map