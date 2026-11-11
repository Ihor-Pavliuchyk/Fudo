'use client';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

type Store={id:string;brand:string;lat:number;lng:number;address:string;osmUrl:string};
type Dorm={id:string;name:string;address:string;lat:number;lng:number;osmUrl:string;polytechnic:boolean};
const brandStyles:Record<string,{bg:string;label:string;symbol:string}>={
  'Сільпо':{bg:'#f47b20',label:'Сільпо',symbol:'С'},
  'Рукавичка':{bg:'#238449',label:'Рукавичка',symbol:'Р'},
  'Близенько':{bg:'#1565c0',label:'Близенько',symbol:'Б'},
  'Сімі':{bg:'#8e44ad',label:'Сімі',symbol:'Сі'},
};
function brandIcon(brand:string){
  const info=brandStyles[brand]??{bg:'#21784c',label:'Магазин',symbol:'М'};
  // Original, recognizable wordmark-style badges. Not official chain logos.
  return L.divIcon({className:'fudo-store-marker',html:`<div style="display:flex;align-items:center;gap:5px;background:white;border:2px solid ${info.bg};border-radius:24px;padding:3px 9px 3px 3px;box-shadow:0 3px 10px #0004;white-space:nowrap;font:800 12px Arial,sans-serif;color:#213c30"><span style="display:grid;place-items:center;background:${info.bg};color:white;border-radius:50%;width:28px;height:28px;font-size:12px">${info.symbol}</span>${info.label}</div>`,iconSize:[112,38],iconAnchor:[56,19],popupAnchor:[0,-20]});
}
const dormIcon=L.divIcon({className:'fudo-dorm-marker',html:'<div style="background:#17382c;color:white;border:3px solid white;border-radius:50%;width:36px;height:36px;display:grid;place-items:center;box-shadow:0 2px 9px #0005;font-size:19px">🎓</div>',iconSize:[36,36],iconAnchor:[18,18]});
function kmBetween(a:{lat:number;lng:number},b:{lat:number;lng:number}){
  const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
function FocusOnDorm({dorm}:{dorm:Dorm|null}){
  const map=useMap();
  useEffect(()=>{if(dorm) map.flyTo([dorm.lat,dorm.lng],15,{duration:0.8});},[dorm,map]);
  return null;
}
export default function StoreMap({brand}:{brand:string}){
  const [stores,setStores]=useState<Store[]>([]),[dorms,setDorms]=useState<Dorm[]>([]);
  const [storeError,setStoreError]=useState(''),[dormError,setDormError]=useState('');
  const [loading,setLoading]=useState(true),[selectedDormId,setSelectedDormId]=useState(''),[search,setSearch]=useState('');
  useEffect(()=>{
    let active=true;
    Promise.allSettled([
      fetch('/api/stores').then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Помилка магазинів');return d.stores as Store[];}),
      fetch('/api/dormitories').then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Помилка гуртожитків');return d.dorms as Dorm[];})
    ]).then(([a,b])=>{if(!active)return;
      if(a.status==='fulfilled')setStores(a.value);else setStoreError(String(a.reason));
      if(b.status==='fulfilled')setDorms(b.value);else setDormError(String(b.reason));
      setLoading(false);
    });return()=>{active=false;};
  },[]);
  const icons=useMemo(()=>Object.fromEntries(Object.keys(brandStyles).map(k=>[k,brandIcon(k)])),[]);
  const selectedDorm=dorms.find(d=>d.id===selectedDormId)??null;
  const filtered=stores.filter(s=>(brand==='Усі'||s.brand===brand)&&(`${s.brand} ${s.address}`.toLocaleLowerCase('uk').includes(search.toLocaleLowerCase('uk'))));
  const nearest=selectedDorm?filtered.map(s=>({...s,distance:kmBetween(selectedDorm,s)})).sort((a,b)=>a.distance-b.distance).slice(0,5):[];
  return <div style={{display:'flex',flexDirection:'column',gap:12,height:'100%'}}>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
      <label style={{fontWeight:700}}>Гуртожиток: <select aria-label="Оберіть гуртожиток" value={selectedDormId} onChange={e=>setSelectedDormId(e.target.value)} style={{maxWidth:300,padding:9,borderRadius:9,border:'1px solid #cbd8cf'}}><option value="">Усі магазини Львова</option>{dorms.filter(d=>d.polytechnic).map(d=><option key={d.id} value={d.id}>{d.name} {d.address}</option>)}{dorms.some(d=>!d.polytechnic)&&<optgroup label="Інші гуртожитки поблизу">{dorms.filter(d=>!d.polytechnic).map(d=><option key={d.id} value={d.id}>{d.name} {d.address}</option>)}</optgroup>}</select></label>
      <input aria-label="Пошук магазинів" placeholder="Пошук за назвою чи адресою" value={search} onChange={e=>setSearch(e.target.value)} style={{padding:10,border:'1px solid #cbd8cf',borderRadius:9,flex:'1 1 200px'}}/>
    </div>
    {loading&&<p role="status">Завантаження магазинів і гуртожитків…</p>}
    {storeError&&<p role="alert" style={{color:'#a33'}}>Магазини: {storeError}</p>}
    {dormError&&<p role="status" style={{color:'#875b18'}}>Гуртожитки: {dormError}</p>}
    <div style={{minHeight:370,flex:1,borderRadius:16,overflow:'hidden'}}>
      <MapContainer center={[49.8397,24.0297]} zoom={13} scrollWheelZoom style={{width:'100%',height:'100%'}}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>
        <FocusOnDorm dorm={selectedDorm}/>
        {filtered.map(store=><Marker key={store.id} position={[store.lat,store.lng]} icon={icons[store.brand]}><Popup><strong>{store.brand}</strong><p>{store.address}</p>{selectedDorm&&<p>Відстань по прямій: {kmBetween(selectedDorm,store).toFixed(2)} км</p>}<p>Знижки Fudo ще не підключені.</p><a target="_blank" rel="noopener noreferrer" href={store.osmUrl}>Переглянути в OpenStreetMap</a></Popup></Marker>)}
        {selectedDorm&&<Marker position={[selectedDorm.lat,selectedDorm.lng]} icon={dormIcon}><Popup><strong>{selectedDorm.name}</strong><p>{selectedDorm.address}</p></Popup></Marker>}
      </MapContainer>
    </div>
    <p style={{fontSize:13,color:'#526b5c',margin:0}}>Магазинів на карті: {filtered.length}. {dorms.length>0?`Гуртожитків у відкритих даних: ${dorms.length}.`:''}</p>
    {selectedDorm&&<section aria-label="Найближчі магазини" style={{background:'#f2f8f4',padding:12,borderRadius:12}}><strong>Найближчі магазини до «{selectedDorm.name}»</strong>{nearest.length?<ol style={{paddingLeft:23,margin:'8px 0 0'}}>{nearest.map(s=><li key={s.id}>{s.brand} · {s.address} — {s.distance.toFixed(2)} км</li>)}</ol>:<p>Магазинів за цим фільтром не знайдено.</p>}<small>Відстань по прямій, не довжина пішохідного маршруту. Приналежність гуртожитків перевіряйте за офіційними даними університету.</small></section>}
  </div>;
}
