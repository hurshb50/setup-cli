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
