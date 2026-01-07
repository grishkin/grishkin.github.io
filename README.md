# Personal GitHub Page

## Development

This project uses [Vite](https://vitejs.dev/) for building JavaScript demos.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server:

```bash
npm run dev
```

You can access the main site at `http://localhost:5173/` and demos at `http://localhost:5173/demos/<demo-name>/`.

### Building

To build the project for production:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Creating a New Demo

1. Create a new folder in `demos/` (e.g., `demos/my-new-demo`).
2. Add an `index.html` file in that folder.
3. Add your JavaScript and CSS files.
4. Link your JS file in `index.html` using `<script type="module" src="./main.js"></script>`.

Vite will automatically detect the new demo and include it in the build.

## Deployment

Since this is a User Page (`username.github.io`), GitHub Pages serves content from the root of the `master` (or `main`) branch.

**Recommended Workflow:**

1. Keep your source code in a branch named `source` (or `develop`).
2. When ready to deploy, run the build.
3. Push the contents of the `dist/` folder to the `master` branch.

You can automate this using the `gh-pages` package or a GitHub Action.

