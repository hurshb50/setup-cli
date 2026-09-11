import { defineConfig } from "vite-plus";
import { readdirSync } from "fs";

const entries = readdirSync(".", { withFileTypes: true });

const entryNames = entries
    .map(({ name }) => name)
    .filter((name) => !name.match(/bun.lock|distribution|node_modules|source/));

const configuration = defineConfig({
    fmt: {
        printWidth: 120,
        tabWidth: 4,
        sortPackageJson: false,
    },
    lint: {
        categories: { correctness: "error" },
        options: {
            typeAware: true,
            typeCheck: true,
        },
    },
    pack: {
        entry: "./source/setup-cli.ts",
        outDir: "distribution",
        minify: true,
        copy: entryNames,
    },
    test: { passWithNoTests: true },
});

export default configuration;
