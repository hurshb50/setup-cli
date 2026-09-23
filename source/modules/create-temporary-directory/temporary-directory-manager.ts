import fs from "fs/promises";
import { createTemporaryDirectory as createSystemTemporaryDirectory } from "./create-temporary-directory";

export class TemporaryDirectoryManager {
    private readonly trackedPaths = new Set<string>();

    async create(): Promise<string> {
        const temporaryDirectoryPath = await createSystemTemporaryDirectory();
        this.trackedPaths.add(temporaryDirectoryPath);

        return temporaryDirectoryPath;
    }

    track(temporaryDirectoryPath: string): void {
        this.trackedPaths.add(temporaryDirectoryPath);
    }

    async removeAll(): Promise<void> {
        const pathsToRemove = [...this.trackedPaths];
        this.trackedPaths.clear();

        await Promise.all(
            pathsToRemove.map((temporaryDirectoryPath) =>
                fs.rm(temporaryDirectoryPath, { recursive: true, force: true }),
            ),
        );
    }
}
