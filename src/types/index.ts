export interface Apartment {
  id: number;
  title: string;
  location: string;
  area: number;
  price: number;
  rating: number;
  beds: number;
  imageUrl: string;
}

export interface ErrorResponse extends Error{
    status: number;
    message: string;
}

