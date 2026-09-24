# setup-cli

Scaffolds a TypeScript CLI that publishes to npm through GitHub. The generated project uses Vite+ for tooling and commander for argument parsing. Releases use npm's OIDC trusted publishing with staged releases.

## Usage

```bash
vpx @hurshb50/setup-cli@latest <cli-name> --personal-github-username <username> --personal-name <name> --personal-email <email>
```

```bash
vpx @hurshb50/setup-cli@latest hello-cli --personal-github-username hurshb50 --personal-name "Hursh Patel" --personal-email hurshb50@gmail.com
```

Pass `--directory <path>` to generate the project somewhere other than `./<cli-name>`.

## What you get

- A Vite+ TypeScript project with a commander entrypoint at `source/<cli-name>.ts`
- A scoped `package.json` wired for npm
- A `.gitignore` and an initialized git repository
- GitHub Actions workflows that stage npm releases and publish GitHub releases
- A generated README that walks through the one-time GitHub and npm setup
