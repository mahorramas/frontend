import type { Region } from "@/lib/location";

export interface RegionalPriceFields {
  precio_lista_chiapas?: number;
  precio_oferta_chiapas?: number;
  precio_lista_tabasco?: number;
  precio_oferta_tabasco?: number;
  precio_lista_tapachula?: number;
  precio_oferta_tapachula?: number;
}

export function getActivePrices(item: RegionalPriceFields, region: Region) {
  const pricesByRegion = {
    chiapas: {
      lista: item.precio_lista_chiapas || 0,
      oferta: item.precio_oferta_chiapas || 0,
    },
    tabasco: {
      lista: item.precio_lista_tabasco || 0,
      oferta: item.precio_oferta_tabasco || 0,
    },
    tapachula: {
      lista: item.precio_lista_tapachula || 0,
      oferta: item.precio_oferta_tapachula || 0,
    },
  };

  const selected = pricesByRegion[region];

  return {
    lista: selected.lista || selected.oferta,
    oferta: selected.oferta || selected.lista,
  };
}
