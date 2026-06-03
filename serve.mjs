import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4180);
const types = { ".avif":"image/avif", ".css":"text/css; charset=utf-8", ".gif":"image/gif", ".html":"text/html; charset=utf-8", ".jpeg":"image/jpeg", ".jpg":"image/jpeg", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".mp4":"video/mp4", ".png":"image/png", ".svg":"image/svg+xml; charset=utf-8", ".wdp":"image/vnd.ms-photo", ".webp":"image/webp" };
function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  return path.join(root, normalized === "/" ? "index.html" : normalized);
}
async function resolveRequest(urlPath) {
  const candidate = safePath(urlPath);
  try { const info = await stat(candidate); if (info.isFile()) return candidate; } catch {}
  try { const info = await stat(path.join(candidate, "index.html")); if (info.isFile()) return path.join(candidate, "index.html"); } catch {}
  return path.join(root, "index.html");
}
createServer(async (request, response) => {
  try {
    const filePath = await resolveRequest(request.url || "/");
    response.setHeader("content-type", types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.statusCode = 500;
    response.end(String(error));
  }
}).listen(port, () => console.log(`Auto-MC-Sensor wiki: http://localhost:${port}`));
