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
export interface Facility{

}
export interface ApartmentDetails {
  id: number;
  alias: string;
  price: number;
  category: string;
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
