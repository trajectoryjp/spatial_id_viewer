import { Cartesian3 } from 'cesium';

/** 直方体で表せる範囲を表す基底クラス */
export declare abstract class CuboidCreator<Metadata extends Record<string, unknown> = Record<string, never>> {
	/** 直方体の情報を作成する */
	abstract createCuboid(): Promise<Cuboid<Metadata>>;
}
/** タイル座標ベースの直方体を表すための基底クラス */
export declare abstract class TileBasedCuboidCreator<Metadata extends Record<string, unknown> = Record<string, never>> extends CuboidCreator<Metadata> {
	readonly z: number;
	readonly x: number;
	readonly y: number;
	readonly metadata?: Metadata;
	/**
	 * タイル座標ベースの直方体を表すオブジェクトを作成する。
	 * @param z ズームレベル
	 * @param x タイル X 座標
	 * @param y タイル Y 座標
	 * @param metadata メタデータ
	 */
	constructor(z: number, x: number, y: number, metadata?: Metadata);
	/** 高度 (MSL) の範囲を返す */
	protected abstract getMslHeights(): Promise<readonly [
		number,
		number
	]>;
	createCuboid(): Promise<Cuboid<Metadata>>;
}
/**
 * 1 つ以上の直方体を表す。
 * Cesium が読み込める形式 (i3dm + 3D Tileset JSON) に変換する機能を備える。
 */
export declare class CuboidCollection<Metadata extends Record<string, unknown> = Record<string, never>> {
	readonly cuboids: readonly Cuboid<Metadata>[];
	/**
	 * 1 つ以上の直方体を表す CuboidCollection インスタンスを作成する。
	 * @param cuboids 直方体の配列
	 */
	constructor(cuboids: readonly Cuboid<Metadata>[]);
	/**
	 * 3D Tileset の JSON データをオブジェクトとして生成し返す
	 * @param i3dmUrl 生成済みの i3dm の URL。指定しない場合は i3dm を生成して data URL として埋め込む
	 * @returns JSON データのオブジェクト
	 */
	create3DTilesetJson(i3dmUrl?: string): Promise<object>;
	/** バイナリデータを data URL に変換する */
	private static toDataUrl;
	/**
	 * 3D Tileset 形式の JSON を data URL として生成し返す
	 * @param i3dmUrl 生成済みの i3dm の URL。指定しない場合は i3dm を生成して data URL として埋め込む
	 * @returns JSON の data URL
	 */
	create3DTilesetDataUrl(i3dmUrl?: string): Promise<string>;
	/**
	 * モデルが存在する範囲を直方体で返す
	 * (経度・緯度はラジアン、高度は楕円体高 (m))
	 * @returns [west, south, east, north, minHeight, maxHeight]
	 */
	calculateRegion(): number[];
	/** i3dm 形式のバイナリを生成する */
	createI3dmBinary(): Promise<ArrayBuffer>;
	/** i3dm 形式のバイナリを data URL として生成し返す */
	createI3dmDataUrl(): Promise<string>;
	/** i3dm 内部の feature table を生成する */
	private createFeatureTable;
	/** i3dm 内部の batch table を作成する */
	private createBatchTable;
	/**
	 * バイナリデータにパディングを行う
	 * @param binary パディングを行うバイナリデータ
	 * @param value パディング部分に詰める値 (0 〜 255)
	 * @param boundary 何バイト単位にパディングを行うか
	 * @returns パディング済みのバイナリデータ
	 */
	private static createPaddedBinary;
}
/** 空間 ID オブジェクト */
export declare class SpatialId<Metadata extends Record<string, unknown> = Record<string, never>> extends TileBasedCuboidCreator<Metadata> {
	readonly f: number;
	/**
	 * 空間 ID オブジェクトを作成する。
	 * @param z ズームレベル
	 * @param f 高度方向タイル座標
	 * @param x タイル X 座標
	 * @param y タイル Y 座標
	 * @param metadata メタデータ
	 */
	constructor(z: number, f: number, x: number, y: number, metadata?: Metadata);
	protected getMslHeights(): Promise<readonly [
		number,
		number
	]>;
	/** 文字列から空間 ID オブジェクトを生成する */
	static fromString<Metadata extends Record<string, unknown> = Record<string, never>>(spatialId: string, metadata?: Metadata): SpatialId<Metadata>;
	/** 空間 ID 文字列に変換する */
	toString(): string;
}
/**
 * 指定地点のおおよそのジオイド高を返す。日本付近でのみ使用可能。
 * @param long 経度 (度)
 * @param lat 緯度 (度)
 * @param defaultValue 取得できなかった場合に返す値
 * @returns ジオイド高
 */
export declare const getGeoidHeight: (long: number, lat: number, defaultValue?: number) => Promise<number>;
/** 直方体 */
export interface Cuboid<Metadata extends Record<string, unknown> = Record<string, never>> {
	/**
	 * 直方体の範囲を経度・緯度・楕円体高で表した配列
	 *
	 * 経度・緯度はラジアン、高度はメートル
	 *
	 * 順序は [west, south, east, north, minHeight, maxHeight]
	 */
	region: number[];
	/** 大きさ (m) を x, y, z それぞれの方向で表したオブジェクト */
	scale: Cartesian3;
	/** 中心座標 */
	location: Cartesian3;
	/** メタデータ */
	metadata: Metadata;
}

