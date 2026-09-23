import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export async function createEntrypoint(temporaryDirectoryPath: string, cliName: string): Promise<void> {
    const sourceDirectoryPath = path.join(temporaryDirectoryPath, "source");
    const sourceDirectoryExists = existsSync(sourceDirectoryPath);

    if (sourceDirectoryExists) throw new Error("Source directory already exists");

    await fs.mkdir(sourceDirectoryPath);

    const entrypointLines = [
        "#!/usr/bin/env node",
        'import { program } from "@commander-js/extra-typings";',
        'import { name, version } from "../package.json";',
        'program.name(name).version(version).description("TODO")',
        "program.parse()",
    ];

    const entrypointFileContent = entrypointLines.join("\n");
    const entrypointFilePath = path.join(sourceDirectoryPath, `${cliName}.ts`);
    await fs.writeFile(entrypointFilePath, entrypointFileContent);
}
