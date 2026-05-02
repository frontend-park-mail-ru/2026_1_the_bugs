import type { ApartmentDetails } from './index';

export interface UploadedImage {
  name: string;
  previewUrl: string;
  file: File | null;
}

export interface CreatePosterFormData {
  housingType: string;
  address: string;
  floor: string;
  floorCount: string;
  flatNumber: string;
  complexName: string;
  complex: string;
  roomCount: string;
  area: string;
  images: UploadedImage[];
  features: string[];
  description: string;
  price: string;
}

export interface CreatePosterPayload {
    price: number;
    description: string;
    category_alias: string;
    area: number;

    address: string;
    lat?: number; 
    lon?: number;   
    city?: string;           
    metro_station_id?: number; 
    district?: string;          
    floor_count: number;       
    company_id?: number;       

    flat_category_id: number;   
    flat_number?: number;      
    flat_floor: number;

    features: string[];   

    images: Array<{
        file: File;
        order: number;
        url?: string;
    }>;
}


export type CreatePosterResponse = {
  alias: string
  id: string
};
export type CreatePosterStep = 1 | 2 | 3 | 4 | 5;

export const TOTAL_CREATE_POSTER_STEPS = 5;

export const INITIAL_CREATE_POSTER_FORM: CreatePosterFormData = {
  housingType: '',
  address: '',
  floor: '',
  floorCount: '',
  flatNumber: '',
  complexName: '',
  complex: '',
  roomCount: '',
  area: '',
  images: [],
  features: [],
  description: '',
  price: ''
};

