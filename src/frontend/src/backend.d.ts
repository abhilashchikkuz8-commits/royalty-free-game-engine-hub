import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Asset {
    id: bigint;
    uploaderName: string;
    previewUrl: string;
    name: string;
    description: string;
    fileSize: string;
    blobId?: string;
    category: AssetCategory;
    downloadCount: bigint;
    engineTags: Array<string>;
}
export enum AssetCategory {
    fonts = "fonts",
    audio = "audio",
    shaders = "shaders",
    sprites = "sprites",
    tilemaps = "tilemaps",
    models = "models"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAsset(name: string, description: string, category: AssetCategory, engineTags: Array<string>, uploaderName: string, fileSize: string, previewUrl: string, blobId: string | null): Promise<bigint>;
    getAllAssets(): Promise<Array<Asset>>;
    getAssetById(id: bigint): Promise<Asset | null>;
    getAssetsByCategory(category: AssetCategory): Promise<Array<Asset>>;
    getCallerUserRole(): Promise<UserRole>;
    incrementAssetDownloadCount(id: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
}
