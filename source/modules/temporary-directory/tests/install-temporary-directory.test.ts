import path from "path";
import fs from "fs/promises";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { installTemporaryDirectory } from "../install-temporary-directory";
import { TemporaryDirectoryManager } from "../temporary-directory-manager";

const temporaryDirectories = new TemporaryDirectoryManager();

afterEach(() => temporaryDirectories.removeAll());

const { execSyncMock } = vi.hoisted(() => ({ execSyncMock: vi.fn() }));

vi.mock("child_process", () => ({ default: { execSync: execSyncMock } }));

describe("installTemporaryDirectory", () => {
    it("installs dependencies in the temporary directory, copies it to the CLI directory, and initializes git", async () => {
        const temporaryDirectoryPath = await temporaryDirectories.create();
        await fs.writeFile(path.join(temporaryDirectoryPath, "example.txt"), "content");

        const cliDirectoryPath = path.join(await temporaryDirectories.create(), "my-cli");

        await installTemporaryDirectory(temporaryDirectoryPath, cliDirectoryPath);

        const copiedFileContent = await fs.readFile(path.join(cliDirectoryPath, "example.txt"), "utf8");
        expect(copiedFileContent).toBe("content");

        expect(execSyncMock).toHaveBeenCalledWith("vp install", {
            cwd: temporaryDirectoryPath,
            stdio: "inherit",
        });
        expect(execSyncMock).toHaveBeenCalledWith("git init -b main", {
            cwd: cliDirectoryPath,
            stdio: "inherit",
        });
    });
});
