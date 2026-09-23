import path from "path";
import fs from "fs/promises";

export async function copyAssetsDirectory(currentDirectoryPath: string, temporaryDirectoryPath: string): Promise<void> {
    const assetsDirectoryPath = path.join(currentDirectoryPath, "assets");
    await fs.cp(assetsDirectoryPath, temporaryDirectoryPath, { recursive: true });
}
