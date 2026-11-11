import { NextResponse } from 'next/server';
export const revalidate = 86400;
const endpoints = ['https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter'];
const query = '[out:json][timeout:25];(nwr["building"="dormitory"](49.79,23.96,49.87,24.08);nwr["amenity"="student_accommodation"](49.79,23.96,49.87,24.08));out center tags;';
type OsmElement = {type:string;id:number;lat?:number;lon?:number;center?:{lat:number;lon:number};tags?:Record<string,string>};
export async function GET() {
  for(const endpoint of endpoints) try {
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}),next:{revalidate:86400},signal:AbortSignal.timeout(30000)});
    if(!response.ok) continue;
    const payload:{elements?:OsmElement[]}=await response.json();
    const dorms=(payload.elements??[]).flatMap((el)=>{
      const lat=el.lat??el.center?.lat,lng=el.lon??el.center?.lon;
      if(lat==null||lng==null) return [];
      const tags=el.tags??{},name=tags['name:uk']||tags.name||'Студентський гуртожиток';
      return [{id:`${el.type}-${el.id}`,name,address:[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(', '),lat,lng,osmUrl:`https://www.openstreetmap.org/${el.type}/${el.id}`,polytechnic:/політех|polytechnic|politekh|нульп/i.test(`${name} ${tags.operator??''} ${tags['operator:uk']??''}`)}];
    });
    return NextResponse.json({dorms,source:'OpenStreetMap / Overpass'});
  }catch(error){console.error('Dormitory Overpass error:',error);}
  return NextResponse.json({dorms:[],error:'Не вдалося завантажити гуртожитки. Спробуйте пізніше.'},{status:503});
}
