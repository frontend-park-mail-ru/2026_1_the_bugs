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

export const HOUSING_OPTIONS: Record<string, string> = {
  'flat':'Квартира',
};
export const ROOM_OPTIONS = ['Студия', '1', '2', '3', '4', '5', '6+'];
const ROOM_COUNT_TO_FLAT_CATEGORY_ID: Record<string, number> = {
  '0': 1,
  '1': 2,
  '2': 3,
  '3': 4,
  '4': 5,
  '5': 6,
  '6+': 7,
};
export const ROOM_COUNT_TO_ROOM_LABEL: Record<string, string> = {
  'Студия': 'Студия',
  '1-комн.': '1',
  '2-комн.': '2',
  '3-комн.': '3',
  '4-комн.': '4',
  '5-комн.': '5',
  '6+ комн.': '6+',
};

    // ('Wi-Fi', 'wifi'),
    // ('Кондиционер', 'conditioner'),
    // ('Стиральная машина', 'washing-machine'),
    // ('Сушилка', 'dryer'),
    // ('Гладильная доска', 'ironing-board'),
    // ('Утюг', 'iron'),
    // ('Телевизор', 'tv'),
    // ('Холодильник', 'fridge'),
    // ('Микроволновка', 'microwave'),
    // ('Электроплита', 'stove'),
    // ('Посудомойка', 'dishwasher'),
    // ('Лифт', 'elevator'),
    // ('Парковка', 'parking'),
    // ('Консьерж', 'concierge'),
    // ('Детская площадка', 'playground');

export const FEATURE_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Парковка' },
  { value: 'conditioner', label: 'Кондиционер' },
  { value: 'dishwasher', label: 'Посудомойка' },
  { value: 'elevator', label: 'Лифт' },
  { value: 'concierge', label: 'Консьерж' },
  { value: 'tv', label: 'Телевизор' },
  { value: 'fridge', label: 'Холодильник' },
  { value: 'microwave', label: 'Микроволновка' },
  { value: 'stove', label: 'Электроплита' },
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
    category_alias: form.housingType.trim(),
    address: form.address.trim(),
    ...(coordinates ? { lat: coordinates.latitude, lon: coordinates.longitude } : {}),
    price: Number(form.price),
    area: Number(form.area),
    floor_count: Number(form.floorCount),
    description: form.description.trim(),
    features: form.features,
    flat_category_id: ROOM_COUNT_TO_FLAT_CATEGORY_ID[form.roomCount.trim()] || 1,
    flat_number: flatNumber,
    flat_floor: Number(form.floor),
    images: imagePayload,
    city_id: 1, // TODO: выбрать город
  };
}

