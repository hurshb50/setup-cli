import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import os from "os";
import handlebars from "handlebars";
import childProcess from "child_process";

async function createTemporaryDirectory(): Promise<string> {
    const systemTemporaryDirectoryPath = os.tmpdir();
    const temporaryDirectoryPathPrefix = path.join(systemTemporaryDirectoryPath, "setup-cli");
    const temporaryDirectoryPath = await fs.mkdtemp(temporaryDirectoryPathPrefix);

    return temporaryDirectoryPath;
}

async function copyAssetsDirectory(currentDirectoryPath: string, temporaryDirectoryPath: string): Promise<void> {
    const assetsDirectoryPath = path.join(currentDirectoryPath, "assets");
    await fs.cp(assetsDirectoryPath, temporaryDirectoryPath, { recursive: true });
}

async function renderTemplates(
    currentDirectoryPath: string,
    temporaryDirectoryPath: string,
    cliName: string,
    personalGithubUsername: string,
    personalName: string,
    personalEmail: string,
): Promise<void> {
    const templatesDirectoryPath = path.join(currentDirectoryPath, "templates");
    const templateFileNames = await fs.readdir(templatesDirectoryPath);

    const pendingWrites = templateFileNames.map(async (templateFileName) => {
        const templateFileIsNotValid = templateFileName.endsWith(".template") !== true;
        const templateFilePath = path.join(templatesDirectoryPath, templateFileName);

        if (templateFileIsNotValid) {
            throw new Error(
                `Template file at '${templateFilePath}' is not valid because it does not end with '.template'.`,
            );
        }

        const templateFileBuffer = await fs.readFile(templateFilePath);
        const templateFileContent = templateFileBuffer.toString();
        const renderTemplate = handlebars.compile(templateFileContent);

        const renderedFileContent = renderTemplate({
            cliName,
            personalGithubUsername,
            personalName,
            personalEmail,
        });

        const renderedFileName = templateFileName.replace(".template", "");
        const renderedFilePath = path.join(temporaryDirectoryPath, renderedFileName);
        await fs.writeFile(renderedFilePath, renderedFileContent);
    });

    await Promise.all(pendingWrites);
}

async function createEntrypoint(temporaryDirectoryPath: string, cliName: string): Promise<void> {
    const sourceDirectoryPath = path.join(temporaryDirectoryPath, "source");
    const sourceDirectoryExists = existsSync(sourceDirectoryPath);

    if (sourceDirectoryExists) throw new Error("Source directory already exists");

    await fs.mkdir(sourceDirectoryPath);

    const entrypointLines = [
        'import { program } from "@commander-js/extra-typings";',
        `program.name("${cliName}").version("0.0.0").description("TODO")`,
        "program.parse()",
    ];

    const entrypointFileContent = entrypointLines.join("\n");
    const entrypointFilePath = path.join(sourceDirectoryPath, `${cliName}.ts`);
    await fs.writeFile(entrypointFilePath, entrypointFileContent);
}

async function installTemporaryDirectory(temporaryDirectoryPath: string, cliDirectoryPath: string): Promise<void> {
    childProcess.execSync("vp install", { cwd: temporaryDirectoryPath, stdio: "inherit" });
    await fs.cp(temporaryDirectoryPath, cliDirectoryPath, { recursive: true });
}

program
    .name(name)
    .description("This tool helps to scaffold a CLI that you can publish to NPM.")
    .version(version)
    .argument("cli-name", "Name of the CLI")
    .argument("personal-github-username", "Your github username")
    .argument("personal-name", "Your personal name")
    .argument("personal-email", "Your personal email")
    .option("--directory <string>", "Path where the cli should be located (e.g. `../example`)")
    .action(async (cliName, personalGithubUsername, personalName, personalEmail, { directory }) => {
        const cliDirectoryPath = directory ?? cliName;
        const cliDirectoryExists = existsSync(cliDirectoryPath);

        if (cliDirectoryExists) throw new Error(`CLI directory already exists at '${cliDirectoryPath}'.`);

        const temporaryDirectoryPath = await createTemporaryDirectory();
        const currentDirectoryPath = import.meta.dirname;

        await Promise.all([
            copyAssetsDirectory(currentDirectoryPath, temporaryDirectoryPath),
            renderTemplates(
                currentDirectoryPath,
                temporaryDirectoryPath,
                cliName,
                personalGithubUsername,
                personalName,
                personalEmail,
            ),
            createEntrypoint(temporaryDirectoryPath, cliName),
        ]);

        await installTemporaryDirectory(temporaryDirectoryPath, cliDirectoryPath);
    });

program.parse();
