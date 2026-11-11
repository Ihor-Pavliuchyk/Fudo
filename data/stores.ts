/** Ілюстративні точки для UI. НЕ є перевіреними адресами магазинів. */
export type StoreBrand = 'Сільпо' | 'Рукавичка' | 'Близенько' | 'Сімі';
export type DemoStore = { id: string; brand: StoreBrand; lat: number; lng: number };
export const demoStores: DemoStore[] = [
  { id: 'silpo-demo', brand: 'Сільпо', lat: 49.8419, lng: 24.0315 },
  { id: 'rukavychka-demo', brand: 'Рукавичка', lat: 49.8452, lng: 24.0262 },
  { id: 'blyzenko-demo', brand: 'Близенько', lat: 49.8382, lng: 24.0239 },
  { id: 'simi-demo', brand: 'Сімі', lat: 49.8356, lng: 24.0351 },
];
