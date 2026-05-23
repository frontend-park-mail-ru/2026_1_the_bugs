export interface IFilters {
  category?: string;
  room_count?: number;
  min_price?: number;
  max_price?: number;
  min_square?: number;
  max_square?: number;
  min_flat_floor?: number;
  max_flat_floor?: number;
  min_building_floor?: number;
  max_building_floor?: number;
  facilities?: string[];
  not_first_floor?: boolean;
  not_last_floor?: boolean;
}

export interface Apartment {
  id: number;
  alias: string;
  metro: string;
  address: string;
  area: number;
  price: number;
  rating: number;
  beds: number;
  flat_category: string;
  imageUrl: string;
  has_active_promotion?: boolean;
}

export interface Profile {
  avatar_url: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  //has_password: boolean;
}

export interface MyPoster {
  id: number;
  alias: string;
  address: string;
  area: number;
  price: number;
  avatar_url: string;
  category: Category
}

export interface UtilityCompanyPhoto {
  img_url: string;
  order: number;
}

export interface UtilityCompanyGeo {
  lat: number;
  lon: number;
}

export interface Developer{
  developer_name: string;
  avatar_url: string | null;
}

export interface UtilityCompany {
  id: number;
  phone: string;
  company_name: string;
  geo: UtilityCompanyGeo;
  address: string;
  avatar_url: string | null;
  alias: string;
  photos: UtilityCompanyPhoto[];
  developer: Developer;
  description: string;
}
export interface Category{
  alias: string;
  name: string;
}

export interface Roommate {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  poster_alias?: string;
}

export interface RoommatesResponse {
  users: Roommate[];
}
export interface Tag {
  alias: string
  name: string
}

export interface UserPoolProfile {
  first_name: string;
  last_name: string;
  avatar_url: string;
  gender: string;
  birthday: string;
  description: string;
  tags: Tag[];
}

export interface UserMatchContacts {
  email: string;
  phone: string;
}

export interface ApartmentDetails {
  id: number;
  alias: string;
  price: number;
  category: Category;
  description: string;
  area: number;

  building_geo: {
    lat: number;
    lon: number;
  };

  address: string;
  district: string;
  metro: string;

  metro_geo: {
    lat: number;
    lon: number;
  };

  city: string;
  floor_count: number;

  images: Array<{
    img_url: string;
    order: number;
  }>;

  /** Список удобств/инфраструктуры, связанных с объявлением */
  facilities?: Array<{
    alias: string;
    name: string;
  }>;

  seller: {
    avatar_url: string | null;
    first_name: string;
    last_name: string;
    phone: string;
  };

  flat: {
    flat_category: string;
    flat_number: number;
    floor: number;
    //room_count: number;
  };

  company?: {
    id: number;
    company_name: string;
    avatar_url: string | null;
    alias: string;
  };

}

export interface ErrorAlert{
    message: string;
}

export interface UserResponse {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    avatar_url: string | null;
    form_filled?: boolean
}