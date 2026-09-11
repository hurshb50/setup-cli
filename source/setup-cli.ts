import { program } from "@commander-js/extra-typings";
import packageJSON from "../package.json";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const currentName = "setup-cli";

program
    .name(currentName)
    .description("This tool helps to scaffold a CLI that you can publish to NPM.")
    .version(packageJSON.version)
    .argument("name", "Name of the CLI.")
    .action(async (name) => {
        const alreadyExists = existsSync(name);

        if (alreadyExists) throw new Error("This name is already used by a file or directory.");

        mkdirSync(name);
        cpSync(import.meta.dir, name, { recursive: true });
        rmSync(join(name, "setup-cli.mjs"));
        mkdirSync(join(name, "source"));

        const commands = [
            'import { program } from "@commander-js/extra-typings";',
            `program.name("${name}").description("TODO")`,
            "program.parse()",
        ];

        writeFileSync(join(name, "source", `${name}.ts`), commands.join("\n"));
        execSync("vp install", { cwd: import.meta.dir, stdio: "inherit" });
    });

program.parse();
