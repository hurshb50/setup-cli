import path from "path";
import fs from "fs/promises";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { renderTemplates } from "./render-templates";
import { TemporaryDirectoryManager } from "../temporary-directory/temporary-directory-manager";

const temporaryDirectories = new TemporaryDirectoryManager();

afterEach(() => temporaryDirectories.removeAll());

const renderValues = {
    cliName: "my-cli",
    personalGithubUsername: "octocat",
    personalName: "Mona Lisa",
    personalEmail: "mona@example.com",
};

describe("renderTemplates", () => {
    it("renders each template with the provided values and strips the '.template' suffix", async () => {
        const currentDirectoryPath = await temporaryDirectories.create();
        const temporaryDirectoryPath = await temporaryDirectories.create();

        const templatesDirectoryPath = path.join(currentDirectoryPath, "templates");
        await fs.mkdir(templatesDirectoryPath);
        await fs.writeFile(
            path.join(templatesDirectoryPath, "readme.md.template"),
            "# {{cliName}} by {{personalName}} <{{personalEmail}}> from @{{personalGithubUsername}}",
        );
        await fs.writeFile(
            path.join(templatesDirectoryPath, "package.json.template"),
            '{"name": "@{{personalGithubUsername}}/{{cliName}}"}',
        );

        await renderTemplates(
            currentDirectoryPath,
            temporaryDirectoryPath,
            renderValues.cliName,
            renderValues.personalGithubUsername,
            renderValues.personalName,
            renderValues.personalEmail,
        );

        const readmeContent = await fs.readFile(path.join(temporaryDirectoryPath, "readme.md"), "utf8");
        expect(readmeContent).toBe("# my-cli by Mona Lisa <mona@example.com> from @octocat");

        const packageJsonContent = await fs.readFile(path.join(temporaryDirectoryPath, "package.json"), "utf8");
        expect(JSON.parse(packageJsonContent)).toEqual({ name: "@octocat/my-cli" });
    });

    it("mirrors the templates directory structure", async () => {
        const currentDirectoryPath = await temporaryDirectories.create();
        const temporaryDirectoryPath = await temporaryDirectories.create();

        const templatesDirectoryPath = path.join(currentDirectoryPath, "templates");
        const workflowsDirectoryPath = path.join(templatesDirectoryPath, ".github", "workflows");
        await fs.mkdir(workflowsDirectoryPath, { recursive: true });
        await fs.writeFile(path.join(workflowsDirectoryPath, "release.yaml.template"), "name: Release {{cliName}}");

        await renderTemplates(
            currentDirectoryPath,
            temporaryDirectoryPath,
            renderValues.cliName,
            renderValues.personalGithubUsername,
            renderValues.personalName,
            renderValues.personalEmail,
        );

        const releaseContent = await fs.readFile(
            path.join(temporaryDirectoryPath, ".github", "workflows", "release.yaml"),
            "utf8",
        );
        expect(releaseContent).toBe("name: Release my-cli");

        const rootEntryNames = await fs.readdir(temporaryDirectoryPath);
        expect(rootEntryNames).toEqual([".github"]);
    });

    it("renders the repository templates without leaving unrendered placeholders", async () => {
        const repositoryRootPath = path.resolve(import.meta.dirname, "..", "..", "..");
        const temporaryDirectoryPath = await temporaryDirectories.create();

        await renderTemplates(
            repositoryRootPath,
            temporaryDirectoryPath,
            renderValues.cliName,
            renderValues.personalGithubUsername,
            renderValues.personalName,
            renderValues.personalEmail,
        );

        const packageJsonContent = await fs.readFile(path.join(temporaryDirectoryPath, "package.json"), "utf8");
        const packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>;
        expect(packageJson.name).toBe("@octocat/my-cli");
        expect(packageJson.author).toBe("Mona Lisa <mona@example.com>");
        expect(packageJson.repository).toEqual({
            type: "git",
            url: "git+https://github.com/octocat/my-cli.git",
        });
        expect(packageJsonContent).not.toContain("{{");

        const releaseWorkflowContent = await fs.readFile(
            path.join(temporaryDirectoryPath, ".github", "workflows", "release.yaml"),
            "utf8",
        );
        expect(releaseWorkflowContent).toContain("@octocat/my-cli/dist-tags");
        expect(releaseWorkflowContent).not.toContain("{{");
    });

    it("throws when a file in the templates directory does not end with '.template'", async () => {
        const currentDirectoryPath = await temporaryDirectories.create();
        const temporaryDirectoryPath = await temporaryDirectories.create();

        const templatesDirectoryPath = path.join(currentDirectoryPath, "templates");
        await fs.mkdir(templatesDirectoryPath);
        await fs.writeFile(path.join(templatesDirectoryPath, "notes.txt"), "not a template");

        await expect(
            renderTemplates(
                currentDirectoryPath,
                temporaryDirectoryPath,
                renderValues.cliName,
                renderValues.personalGithubUsername,
                renderValues.personalName,
                renderValues.personalEmail,
            ),
        ).rejects.toThrow("does not end with '.template'");
    });
});
