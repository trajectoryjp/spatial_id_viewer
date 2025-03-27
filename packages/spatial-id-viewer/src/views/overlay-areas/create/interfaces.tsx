export interface OwnerAddressInfo {
  type: StreamType;
  input: string;
}

export enum StreamType {
  grpc = 'grpc',
  rest = 'rest',
  other = 'other',
}
