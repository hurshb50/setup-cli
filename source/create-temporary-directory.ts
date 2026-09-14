import os from "os";
import path from "path";
import fs from "fs/promises";

export async function createTemporaryDirectory(): Promise<string> {
    const systemTemporaryDirectoryPath = os.tmpdir();
    const temporaryDirectoryPathPrefix = path.join(systemTemporaryDirectoryPath, "setup-cli");
    const temporaryDirectoryPath = await fs.mkdtemp(temporaryDirectoryPathPrefix);

    return temporaryDirectoryPath;
}
