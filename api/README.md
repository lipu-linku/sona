# sona API

This folder holds the code for the sona API, hosted at https://api.linku.la/.

The API is built using TypeScript, Vite, and [Hono](https://hono.dev/), using Zod schemas verified against the source data, in the [schemas directory](../schemas).

## Contributing

Requirements:
- [Node.js](https://nodejs.org/) (preferably latest)
- [pnpm](https://pnpm.io/) v8

How to contribute:
- Fork the repo and make any changes you want.
- Build the schemas in `../schemas/` with `pnpm run build`
- Run the dev server using `pnpm run -F sona-api dev` and verify that your changes work.
- Create a pull request back to the main branch and request a review from a maintainer.
