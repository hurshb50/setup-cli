import fs from "fs/promises";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createTemporaryDirectory } from "../create-temporary-directory";
import { TemporaryDirectoryManager } from "../temporary-directory-manager";

const temporaryDirectories = new TemporaryDirectoryManager();

afterEach(() => temporaryDirectories.removeAll());

describe("createTemporaryDirectory", () => {
    it("creates a new directory", async () => {
        const temporaryDirectoryPath = await createTemporaryDirectory();
        temporaryDirectories.track(temporaryDirectoryPath);

        const directoryStats = await fs.stat(temporaryDirectoryPath);
        expect(directoryStats.isDirectory()).toBe(true);
    });

    it("creates a unique directory on every call", async () => {
        const firstTemporaryDirectoryPath = await createTemporaryDirectory();
        const secondTemporaryDirectoryPath = await createTemporaryDirectory();
        temporaryDirectories.track(firstTemporaryDirectoryPath);
        temporaryDirectories.track(secondTemporaryDirectoryPath);

        expect(secondTemporaryDirectoryPath).not.toBe(firstTemporaryDirectoryPath);
    });
});
