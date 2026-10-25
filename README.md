# Muhammad Ahsan Ali — Personal Website

Static HTML, CSS, and JavaScript portfolio and blog. All published files are in `dist/`. No backend, dashboard, database, or build step is required.

## Preview

Open `dist/index.html` in your browser. Blog posts are linked from `dist/blogs.html`.

## GitHub Pages

Push the repository to the `main` branch. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The included workflow publishes only `dist/`.

Navigation and assets use relative URLs, supporting GitHub Pages project paths and custom domains. The CV in `dist/` is downloadable by visitors.

## Update articles

Edit article HTML files in `dist/` and update their cards in `dist/blogs.html`. To add an article, create a new HTML page using the existing article as a template and add a link on the Blogs page. Push changes to `main` to publish updates after GitHub Pages is configured.
