import {
  type CreatePosterFormData,
  type CreatePosterPayload,
  type CreatePosterStep,
} from '../../types/posterCreate';
import { validateStep, type CreatePosterField } from './validation';

export const STEP_TITLES = [
  'Тип и адрес',
  'Этаж и ЖК',
  'Комнаты и площадь',
  'Фотографии',
  'Особенности и цена'
];

export const HOUSING_OPTIONS = ['Квартира'];
export const ROOM_OPTIONS = ['0', '1', '2', '3', '4', '5', '6+'];
export const FEATURE_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Парковка' },
  { value: 'conditioner', label: 'Кондиционер' },
  { value: 'dishwasher', label: 'Посудомоечная машина' },
  { value: 'balcony', label: 'Балкон' },
  { value: 'wardrobe', label: 'Гардеробная' },
  { value: 'pets', label: 'Можно с животными' }
];

export const STEP_ERROR_FIELDS: Record<CreatePosterStep, CreatePosterField[]> = {
  1: ['housingType', 'address'],
  2: ['floor', 'floorCount', 'flatNumber', 'complexName'],
  3: ['roomCount', 'area'],
  4: ['images'],
  5: ['features', 'description', 'price']
};



export function collectErrorsUpToStep(step: CreatePosterStep, data: CreatePosterFormData) {
  const nextErrors: Partial<Record<CreatePosterField, string>> = {};
  for (let i = 1; i <= step; i++) {
    Object.assign(nextErrors, validateStep(i as CreatePosterStep, data).errors);
  }
  return nextErrors;
}

export function mapToPayload(
  form: CreatePosterFormData,
  coordinates: { latitude: number; longitude: number } | null
): CreatePosterPayload {
  let roomCountNumber
  if (form.roomCount == 'Студия'){
    roomCountNumber = 0
  }else{
     roomCountNumber = form.roomCount === '6+' ? 6 : Number(form.roomCount);
  }
  const flatNumber = form.flatNumber.trim() ? Number(form.flatNumber) : 0;
  const imagePayload: CreatePosterPayload['images'] = form.images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image.file !== null)
    .map(({ image, index }) => ({ file: image.file as File, order: index + 1 }));

  return {
    title: `${form.housingType.trim()} ${form.address.trim()}`,
    category: form.housingType.trim(),
    address: form.address.trim(),
    ...(coordinates ? { lat: coordinates.latitude, lon: coordinates.longitude } : {}),
    price: Number(form.price),
    area: Number(form.area),
    floor_count: Number(form.floorCount),
    description: form.description.trim(),
    features: form.features,
    flat: {
      flat_category: `${form.roomCount.trim()}-комнатная`,
      flat_number: flatNumber,
      floor: Number(form.floor),
      rooms: roomCountNumber
    },
    images: imagePayload
  };
}