import path from "path";
import fs from "fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { copyAssetsDirectory } from "./copy-assets-directory";
import { TemporaryDirectoryManager } from "../create-temporary-directory/temporary-directory-manager";

const temporaryDirectories = new TemporaryDirectoryManager();

afterEach(() => temporaryDirectories.removeAll());

describe("copyAssetsDirectory", () => {
    it("copies the contents of the assets directory into the temporary directory", async () => {
        const currentDirectoryPath = await temporaryDirectories.create();
        const temporaryDirectoryPath = await temporaryDirectories.create();

        const assetsDirectoryPath = path.join(currentDirectoryPath, "assets");
        await fs.mkdir(path.join(assetsDirectoryPath, "nested"), { recursive: true });
        await fs.writeFile(path.join(assetsDirectoryPath, "nested", "example.txt"), "nested content");
        await fs.writeFile(path.join(assetsDirectoryPath, ".gitignore"), "node_modules");

        await copyAssetsDirectory(currentDirectoryPath, temporaryDirectoryPath);

        const nestedFileContent = await fs.readFile(path.join(temporaryDirectoryPath, "nested", "example.txt"), "utf8");
        expect(nestedFileContent).toBe("nested content");

        const gitignoreContent = await fs.readFile(path.join(temporaryDirectoryPath, ".gitignore"), "utf8");
        expect(gitignoreContent).toBe("node_modules");
    });

    it("does not copy other top-level directories from the current directory", async () => {
        const currentDirectoryPath = await temporaryDirectories.create();
        const temporaryDirectoryPath = await temporaryDirectories.create();

        await fs.mkdir(path.join(currentDirectoryPath, "assets"));
        await fs.writeFile(path.join(currentDirectoryPath, "assets", "included.txt"), "included");
        await fs.mkdir(path.join(currentDirectoryPath, "templates"));
        await fs.writeFile(path.join(currentDirectoryPath, "templates", "excluded.txt"), "excluded");

        await copyAssetsDirectory(currentDirectoryPath, temporaryDirectoryPath);

        await expect(fs.readFile(path.join(temporaryDirectoryPath, "included.txt"), "utf8")).resolves.toBe("included");
        await expect(fs.access(path.join(temporaryDirectoryPath, "excluded.txt"))).rejects.toThrow();
    });
});
