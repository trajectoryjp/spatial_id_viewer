import { ReservationMethod } from 'spatial-id-svc-route';

/** ルート全体に関連する追加の情報 */
export interface WholeRouteInfo {
  clearance: number;
  aircraftId: string;
  startTime: Date | null;
  endTime: Date | null;
  uavSize: number;
  reservationMethod: ReservationMethod;
}
