import { NextResponse } from 'next/server';

export const revalidate = 86400;

const query = `[out:json][timeout:25];(nwr["shop"="supermarket"](49.78,23.92,49.91,24.15);nwr["shop"="convenience"](49.78,23.92,49.91,24.15));out center tags;`;
const endpoints = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};
const brandPatterns: [string, RegExp][] = [
  ['Сільпо', /сільпо|silpo|sil'po|silpo/i],
  ['Рукавичка', /рукавичка|rukavychka|rukavichka/i],
  ['Близенько', /близенько|blyzenko|blizenko/i],
  ['Сімі', /(?:^|\W)сімі(?:$|\W)|(?:^|\W)simi(?:$|\W)/i],
];

export async function GET() {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: query }),
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) continue;
      const payload: { elements?: OsmElement[] } = await response.json();
      const stores = (payload.elements ?? []).flatMap((item) => {
        const tags = item.tags ?? {};
        const candidate = `${tags.brand ?? ''} ${tags.name ?? ''} ${tags['name:uk'] ?? ''}`;
        const brand = brandPatterns.find(([, pattern]) => pattern.test(candidate))?.[0];
        const lat = item.lat ?? item.center?.lat;
        const lng = item.lon ?? item.center?.lon;
        if (!brand || lat == null || lng == null) return [];
        const address = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', ');
        return [{ id: `${item.type}-${item.id}`, brand, lat, lng, address: address || 'Адреса не вказана в OpenStreetMap', osmUrl: `https://www.openstreetmap.org/${item.type}/${item.id}` }];
      });
      return NextResponse.json({ stores, source: 'OpenStreetMap / Overpass', updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Overpass error:', error);
    }
  }
  return NextResponse.json({ stores: [], error: 'Не вдалося завантажити магазини з OpenStreetMap. Спробуйте пізніше.' }, { status: 503 });
}
