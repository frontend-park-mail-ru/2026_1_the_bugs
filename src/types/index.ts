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

export interface UtilityCompany {
  id: number;
  phone: string;
  company_name: string;
  geo: UtilityCompanyGeo;
  address: string;
  avatar_url: string | null;
  alias: string;
  photos: UtilityCompanyPhoto[];
}



export interface ErrorAlert{
    message: string;
}
