/**
 * Location — tipo dominio condiviso (SSOT)
 * Una location geografica dove l'organizzazione opera, con coordinate, numeri
 * di impatto e metadati. Usato da InteractiveMap, MapModal e ProjectDetailModal.
 */
export interface Location {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  projects: number;
  beneficiaries: string;
  status: string;
  description: string;
  image: string;
  meals?: number;
  kits?: number;
  volunteers?: number;
}
