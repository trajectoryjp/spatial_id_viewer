module 'textlinestream' {
  export interface TextLineStreamOptions<Mapped = string> {
    allowCR?: boolean;
    returnEmptyLines?: boolean;
    mapperFun?: (input: string) => Mapped;
  }

  class TextLineStream<Mapped = string> extends TransformStream {
    readonly readable: ReadableStream<Mapped>;
    readonly writable: WritableStream<string>;
    constructor(options?: TextLineStreamOptions<Mapped>);
  }

  export default TextLineStream;
}
