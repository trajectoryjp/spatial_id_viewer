// バイナリファイルを arraybuffer-loader で埋め込むための型定義

// box.glb
module '*.glb' {
  const content: ArrayBuffer;
  export default content;
}

// jp_gsi_gsigeo2011.tif
module '*.tif' {
  const content: ArrayBuffer;
  export default content;
}
