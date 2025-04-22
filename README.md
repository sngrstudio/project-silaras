# SNGR Creative's Astro Base Starter

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/sngrstudio/astro-base-template)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/sngrstudio/astro-base-template)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/sngrstudio/astro-base-template)

```sh
bun create astro@latest -- --template sngrstudio/astro-base-template
```

_(or use bun, pnpm, yarn, whatever you like. I am using Bun.)_

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

<!-- ![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554) -->

## ❓ What is this?

This is SNGR Creative's opinionated base, minimal starter designed for SNGR Creative's projects (and as base for another theme).

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   ├── base.astro
│   │   ├── meta.astro
│   │   └── layout.astro
│   └── pages/
│       ├── index.astro
│       └── about.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [Astro's guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `bun install`         | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`       | Build your production site to `./dist/`          |
| `bun run preview`     | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## Batteries included:

- A `.devcontainer` custom configuration to use either in [GitHub Codespaces](https://github.com/features/codespaces), [Gitpod Flex](https://www.gitpod.io/docs/flex/introduction/overview), or [run locally](https://containers.dev) using Docker (make sure Docker is installed first).
- a Gitpod Flex automations config _(feel free to delete it if you don't need it)_.
- a Renovate config file at `renovate.json`.
- Prettier, (will be configured automatically if you're using Dev Container)

## 👀 Want to learn more?

Feel free to check [Astro's documentation](https://docs.astro.build) or jump into Astro's [Discord server](https://astro.build/chat).
