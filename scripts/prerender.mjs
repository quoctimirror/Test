/**
 * Pre-rendering script for static pages.
 * Run after build: node scripts/prerender.mjs
 *
 * This script:
 * 1. Starts a local server serving the dist/ folder
 * 2. Uses Puppeteer to visit each route
 * 3. Captures the rendered HTML (with meta tags from react-helmet-async)
 * 4. Saves the HTML back to dist/ for each route
 */

import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const PORT = 4173;

const ROUTES_TO_PRERENDER = [
  "/",
  "/home",
  "/welcome",
  "/products",
  "/collections",
  "/services",
  "/about",
  "/contact",
  "/news",
  "/support",
  "/all-gems",
  "/locations",
  "/immersive-showroom",
  "/book-an-appointment",
  "/find-your-piece",
];

function getMimeType(filePath) {
  const ext = filePath.split(".").pop();
  const mimes = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
  };
  return mimes[ext] || "application/octet-stream";
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === "/" ? "index.html" : req.url);

      // SPA fallback - serve index.html for routes
      if (!existsSync(filePath) || !filePath.includes(".")) {
        filePath = join(DIST_DIR, "index.html");
      }

      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": getMimeType(filePath) });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  // Check if dist exists
  if (!existsSync(DIST_DIR)) {
    console.error("Error: dist/ directory not found. Run `npm run build` first.");
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error("Error: puppeteer not installed. Run `npm install puppeteer --save-dev`");
    process.exit(1);
  }

  const server = await startServer();
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log(`Pre-rendering ${ROUTES_TO_PRERENDER.length} routes...`);

  for (const route of ROUTES_TO_PRERENDER) {
    try {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for react-helmet-async to update the head
      await page.waitForFunction(
        () => document.querySelector('meta[property="og:title"]') !== null,
        { timeout: 5000 }
      ).catch(() => {
        // Not all pages may have og:title, continue anyway
      });

      const html = await page.content();

      // Determine output path
      const outputPath =
        route === "/"
          ? join(DIST_DIR, "index.html")
          : join(DIST_DIR, route, "index.html");

      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputPath, html);
      console.log(`  ✓ ${route}`);

      await page.close();
    } catch (err) {
      console.error(`  ✗ ${route}: ${err.message}`);
    }
  }

  await browser.close();
  server.close();
  console.log("Pre-rendering complete!");
}

prerender().catch(console.error);
