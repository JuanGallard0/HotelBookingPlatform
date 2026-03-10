export interface HotelDto {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  starRating: number;
  isActive: boolean;
  activeRoomTypeCount: number;
}

export interface RoomTypeSummaryDto {
  id: number;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
}

export interface HotelDetailDto {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  starRating: number;
  isActive: boolean;
  roomTypes: RoomTypeSummaryDto[];
}
