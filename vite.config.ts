import { defineConfig } from "vite-plus";

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
        copy: ["source/assets", "source/templates"],
    },
    test: { passWithNoTests: true },
});

export default configuration;
