
export interface TripDetails {
  destination: string;
  days: number;
  objective: string;
  startDate: string;
  source?: string;
}

export interface WeatherInfo {
  condition: string;
  tempHigh: number;
  tempLow: number;
}

export interface Activity {
  time: string;
  duration: string;
  title: string;
  description: string;
  location?: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
  weather?: WeatherInfo;
}

export interface FlightInfo {
  airline: string;
  duration: string;
  stops: string;
  priceRange: string;
  details: string;
  times?: string;
  layoverDetails?: string;
  amenities?: string;
}

export interface HotelInfo {
  name: string;
  rating: string;
  priceRange: string;
  highlight: string;
  details: string;
}

export interface HeroImage {
  url: string;
  photographerName: string;
  photographerUrl: string;
}

export interface Itinerary {
  title: string;
  summary: string;
  heroSearchTerm: string; // Used to fetch premium visuals
  days: DayPlan[];
  selectedFlight?: FlightInfo;
  selectedHotel?: HotelInfo;
  heroImage?: HeroImage;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  text: string;
  sources: GroundingChunk[];
  structuredFlights?: FlightInfo[];
}

export interface SavedTrip {
  id: string;
  details: TripDetails;
  itinerary: Itinerary;
  savedAt: string;
}
