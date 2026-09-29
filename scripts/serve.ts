/**
 * Minimal static server for `_site/`, used by the smoke tests.
 * Bun serves files directly, so this needs no dependency.
 */
const ROOT = new URL("../_site/", import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4173);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    // Refuse traversal outside the site root.
    const file = Bun.file(`${ROOT}${path.replace(/^\/+/, "")}`);
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    return new Response(file);
  },
});
console.log(`serving _site on http://127.0.0.1:${PORT}`);
