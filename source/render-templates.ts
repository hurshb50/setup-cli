import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";

export async function renderTemplates(
    currentDirectoryPath: string,
    temporaryDirectoryPath: string,
    cliName: string,
    personalGithubUsername: string,
    personalName: string,
    personalEmail: string,
): Promise<void> {
    const templatesDirectoryPath = path.join(currentDirectoryPath, "templates");
    const templateFilePaths = await findTemplateFilePaths(templatesDirectoryPath);

    const pendingWrites = templateFilePaths.map(async (templateFilePath) => {
        const templateFileIsNotValid = templateFilePath.endsWith(".template") !== true;

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

        const renderedFileRelativePath = path
            .relative(templatesDirectoryPath, templateFilePath)
            .replace(/\.template$/, "");

        const renderedFilePath = path.join(temporaryDirectoryPath, renderedFileRelativePath);
        await fs.mkdir(path.dirname(renderedFilePath), { recursive: true });
        await fs.writeFile(renderedFilePath, renderedFileContent);
    });

    await Promise.all(pendingWrites);
}

async function findTemplateFilePaths(directoryPath: string): Promise<string[]> {
    const entryNames = await fs.readdir(directoryPath);

    const pendingTemplateFilePaths = entryNames.map(async (entryName) => {
        const entryPath = path.join(directoryPath, entryName);
        const entryStats = await fs.stat(entryPath);

        if (entryStats.isDirectory()) {
            return findTemplateFilePaths(entryPath);
        }

        return [entryPath];
    });

    const nestedTemplateFilePaths = await Promise.all(pendingTemplateFilePaths);

    return nestedTemplateFilePaths.flat();
}
