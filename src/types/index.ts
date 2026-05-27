export interface Coordinate {
  readonly lat: number;
  readonly lng: number;
}

export interface TMapLatLng {
  readonly lat: number;
  readonly lng: number;
}

export interface TMapMarkerGeometry {
  readonly id: string;
  readonly position: TMapLatLng;
}

export interface TMapMultiMarkerOptions {
  map: any;
  readonly geometries: readonly TMapMarkerGeometry[];
}

export interface TMapGeocoderResult {
  readonly result: {
    readonly location: {
      readonly lat: number;
      readonly lng: number;
    };
  };
}

export interface TMapMapOptions {
  readonly center: TMapLatLng;
  readonly zoom: number;
  readonly viewMode: '2D' | '3D';
}

export type FavoriteCategory = 'home' | 'work' | 'travel' | 'other';

export interface Favorite {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly coordinate: Coordinate;
  readonly category: FavoriteCategory;
  readonly createdAt: number;
}

export interface HistoryItem {
  readonly id: string;
  readonly name: string;
  readonly coordinate: Coordinate;
  readonly startTime: number;
  readonly duration: number;
}

export type WaypointType = 'start' | 'waypoint' | 'end';

export interface Waypoint {
  readonly id: string;
  readonly name: string;
  readonly coordinate: Coordinate;
  readonly stayDuration: number;
  readonly type: WaypointType;
}

export type MoveMode = 'walk' | 'bike' | 'drive' | 'free';

export interface AppSettings {
  theme: 'light' | 'dark';
  privacyMode: boolean;
  notification: boolean;
  accuracy: number;
  moveSpeed: 'slow' | 'normal' | 'fast';
}

export interface MockState {
  isActive: boolean;
  currentCoordinate: Coordinate | null;
  targetCoordinate: Coordinate | null;
}