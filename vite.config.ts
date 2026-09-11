import { defineConfig } from "vite-plus";
import path from "path";

const distributionDirectory = path.join(import.meta.dirname, "distribution");
const assetsDirectory = path.join(distributionDirectory, "assets");

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
        copy: [
            "templates",
            { from: ".zed", to: assetsDirectory },
            { from: ".gitignore", to: assetsDirectory },
            { from: "AGENTS.md", to: assetsDirectory },
            { from: "tsconfig.json", to: assetsDirectory },
        ],
    },
    test: { passWithNoTests: true },
});

export default configuration;
