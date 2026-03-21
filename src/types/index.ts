export interface Apartment {
  id: number;
  metro: string;
  address: string;
  area: number;
  price: number;
  rating: number;
  beds: number;
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



export interface ErrorAlert{
    message: string;
}
