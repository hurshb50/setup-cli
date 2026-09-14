import path from "path";
import fs from "fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { createEntrypoint } from "../source/create-entrypoint";
import { TemporaryDirectoryManager } from "./temporary-directory-manager";

const temporaryDirectories = new TemporaryDirectoryManager();

afterEach(() => temporaryDirectories.removeAll());

describe("createEntrypoint", () => {
    it("creates the source directory with an entrypoint named after the CLI", async () => {
        const temporaryDirectoryPath = await temporaryDirectories.create();

        await createEntrypoint(temporaryDirectoryPath, "my-cli");

        const entrypointFilePath = path.join(temporaryDirectoryPath, "source", "my-cli.ts");
        const entrypointFileContent = await fs.readFile(entrypointFilePath, "utf8");

        expect(entrypointFileContent.length).toBeGreaterThan(0);
    });

    it("throws when the source directory already exists", async () => {
        const temporaryDirectoryPath = await temporaryDirectories.create();
        await fs.mkdir(path.join(temporaryDirectoryPath, "source"));

        await expect(createEntrypoint(temporaryDirectoryPath, "my-cli")).rejects.toThrow(
            "Source directory already exists",
        );
    });
});
