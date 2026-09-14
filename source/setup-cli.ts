#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { existsSync } from "fs";
import { copyAssetsDirectory } from "./copy-assets-directory";
import { createEntrypoint } from "./create-entrypoint";
import { createTemporaryDirectory } from "./create-temporary-directory";
import { installTemporaryDirectory } from "./install-temporary-directory";
import { renderTemplates } from "./render-templates";

program
    .name(name)
    .description("This tool helps to scaffold a CLI that you can publish to NPM.")
    .version(version)
    .argument("cli-name", "Name of the CLI")
    .requiredOption("--personal-github-username <string>", "Your github username")
    .requiredOption("--personal-name <string>", "Your personal name")
    .requiredOption("--personal-email <string>", "Your personal email")
    .option("--directory <string>", "Path where the cli should be located (e.g. `../example`)")
    .action(async (cliName, { personalGithubUsername, personalName, personalEmail, directory }) => {
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
