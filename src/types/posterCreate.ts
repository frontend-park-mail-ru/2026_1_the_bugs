import type { ApartmentDetails } from './index';

export interface UploadedImage {
  name: string;
  previewUrl: string;
  file: File;
}

export interface CreatePosterFormData {
  housingType: string;
  address: string;
  floor: string;
  floorCount: string;
  flatNumber: string;
  complexName: string;
  roomCount: string;
  area: string;
  images: UploadedImage[];
  features: string[];
  description: string;
  price: string;
}

export interface CreatePosterPayload {
  title: string;
  category: string;
  address: string;
  lat?: number;
  lon?: number;
  price: number;
  area: number;
  floor_count: number;
  description: string;
  features: string[];
  flat: {
    flat_category: string;
    flat_number: number;
    floor: number;
    rooms: number;
  };
  images: Array<{
    file: File;
    order: number;
  }>;
}

export type CreatePosterResponse = ApartmentDetails;

export type CreatePosterStep = 1 | 2 | 3 | 4 | 5;

export const TOTAL_CREATE_POSTER_STEPS = 5;

export const INITIAL_CREATE_POSTER_FORM: CreatePosterFormData = {
  housingType: '',
  address: '',
  floor: '',
  floorCount: '',
  flatNumber: '',
  complexName: '',
  roomCount: '',
  area: '',
  images: [],
  features: [],
  description: '',
  price: ''
};

