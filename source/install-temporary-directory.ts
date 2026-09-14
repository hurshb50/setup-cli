import childProcess from "child_process";
import fs from "fs/promises";

export async function installTemporaryDirectory(
    temporaryDirectoryPath: string,
    cliDirectoryPath: string,
): Promise<void> {
    childProcess.execSync("vp install", { cwd: temporaryDirectoryPath, stdio: "inherit" });
    await fs.cp(temporaryDirectoryPath, cliDirectoryPath, { recursive: true });
}
