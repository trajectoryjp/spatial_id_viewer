import*as a from"spatial-id-svc-base";var t={d:(a,e)=>{for(var o in e)t.o(e,o)&&!t.o(a,o)&&Object.defineProperty(a,o,{enumerable:!0,get:e[o]})},o:(a,t)=>Object.prototype.hasOwnProperty.call(a,t)},e={};t.d(e,{Wy:()=>l,LG:()=>i,yh:()=>n,P_:()=>r,AF:()=>s});const o=(h={fetchRawJson:()=>a.fetchRawJson},c={},t.d(c,h),c),r=async({baseUrl:a,abortSignal:t})=>await(0,o.fetchRawJson)({method:"GET",baseUrl:a,path:"/search_path/configuration",abortSignal:t}),s=async({baseUrl:a,payload:t,abortSignal:e})=>await(0,o.fetchRawJson)({method:"POST",baseUrl:a,path:"/search_path/barrier_maps",payload:t,abortSignal:e}),l=async({baseUrl:a,payload:t,abortSignal:e})=>await(0,o.fetchRawJson)({method:"POST",baseUrl:a,path:"/search_path/geodetic_to_key",payload:t,abortSignal:e}),n=async({baseUrl:a,payload:t,abortSignal:e})=>await(0,o.fetchRawJson)({method:"POST",baseUrl:a,path:"/search_path/tile_to_key",payload:t,abortSignal:e}),i=async({baseUrl:a,payload:t,abortSignal:e})=>await(0,o.fetchRawJson)({method:"POST",baseUrl:a,path:"/search_path/key_to_tile",payload:t,abortSignal:e});var h,c,y=e.Wy,p=e.LG,b=e.yh,d=e.P_,g=e.AF;export{y as convertGeodeticToKey,p as convertKeysToTileXyzs,b as convertTileXyzsToKeys,d as getConfiguration,g as listBarrierMaps};
//# sourceMappingURL=index.js.map