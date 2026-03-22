export interface Apartment {
  id: number;
  alias: string;
  metro: string;
  address: string;
  area: number;
  price: number;
  rating: number;
  beds: number;
  imageUrl: string;
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
  };

  company: {
    id: number;
    company_name: string;
    avatar_url: string | null;
    alias: string;
  };
}

export interface ErrorAlert{
    message: string;
}
