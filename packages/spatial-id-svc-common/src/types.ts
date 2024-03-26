export interface SpatialIdentification {
  ID: string;
}

export interface Point {
  latitude: number;
  longitude: number;
  altitude: number;
  altitudeAttribute: AltitudeAttribute;
}

export type AltitudeAttribute =
  | 'ALTITUDE_ATTRIBUTE_ELIPSOIDE'
  | 'ALTITUDE_ATTRIBUTE_MSL'
  | 'ALTITUDE_ATTRIBUTE_AGL';
