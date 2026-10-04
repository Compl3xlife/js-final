import { cpSync, createReadStream, existsSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const served = ["img", "fonts", "data", "favicon.ico"];
const copied = ["img", "fonts", "data", "css", "favicon.ico"];
const types = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".css": "text/css",
  ".json": "application/json",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

const notFoundPage = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Blinker</title>
    <script>
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "") +
        l.pathname.split("/").slice(0, 1 + pathSegmentsToKeep).join("/") + "/?/" +
        l.pathname.slice(1).split("/").slice(pathSegmentsToKeep).join("/").replace(/&/g, "~and~") +
        (l.search ? "&" + l.search.slice(1).replace(/&/g, "~and~") : "") +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
`;

function staticExtras() {
  return {
    name: "static-extras",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = decodeURIComponent((req.url || "").split("?")[0]);
        const pathname = raw.startsWith("/js-final/") || raw === "/js-final" ? raw.slice("/js-final".length) || "/" : raw;
        const rel = pathname.replace(/^\//, "");
        const allowed = served.some((item) => rel === item || rel.startsWith(`${item}/`));
        if (!allowed) return next();
        const file = join(process.cwd(), rel);
        if (!existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader("Content-Type", types[extname(file).toLowerCase()] || "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      const out = join(process.cwd(), "dist");
      for (const item of copied) {
        cpSync(join(process.cwd(), item), join(out, item), { recursive: true });
      }
      writeFileSync(join(out, "404.html"), notFoundPage);
    },
  };
}

export default defineConfig({
  base: "/js-final/",
  plugins: [react(), staticExtras()],
  server: {
    port: 5173,
    proxy: {
      "/js-final/api": {
        target: "http://127.0.0.1:8765",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/js-final/, ""),
      },
    },
  },
});
