export interface OwnerAddressInfo {
  type: StreamType;
  input: string;
}

export enum StreamType {
  grpc = 'gRPCサーバーアドレスおよびポート',
  rest = 'RESTサーバーベースURL',
  other = 'その他形式',
}
