const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PDF_DIR = path.join(__dirname, "pdfs");

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR);

const MIME = {
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith(".pdf"));
    const items = files.length
      ? files.map(f => `
        <div class="card">
          <span class="icon">📄</span>
          <span class="name">${f}</span>
          <a class="btn" href="/pdfs/${encodeURIComponent(f)}" download="${f}">Télécharger</a>
        </div>`).join("")
      : `<p class="empty">Aucun PDF disponible pour l'instant.</p>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PDFs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: #f4f6f9;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      color: #1a1a2e;
    }
    h1 { font-size: 2rem; margin-bottom: 2rem; }
    .list { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 1rem; }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }
    .icon { font-size: 1.75rem; flex-shrink: 0; }
    .name { flex: 1; font-size: .95rem; word-break: break-all; }
    .btn {
      background: #4f46e5;
      color: #fff;
      text-decoration: none;
      padding: .5rem 1rem;
      border-radius: 8px;
      font-size: .875rem;
      white-space: nowrap;
      transition: background .15s;
    }
    .btn:hover { background: #4338ca; }
    .empty { color: #888; font-style: italic; }
  </style>
</head>
<body>
  <h1>📂 Documents PDF</h1>
  <div class="list">${items}</div>
</body>
</html>`;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  if (url.pathname.startsWith("/pdfs/")) {
    const filename = decodeURIComponent(url.pathname.slice("/pdfs/".length));
    const filepath = path.join(PDF_DIR, path.basename(filename));

    if (!filepath.startsWith(PDF_DIR) || !filepath.endsWith(".pdf") || !fs.existsSync(filepath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${path.basename(filepath)}"`,
    });
    fs.createReadStream(filepath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
}).listen(PORT, () => {
  console.log(`✅  Serveur démarré → http://localhost:${PORT}`);
  console.log(`   Dépose tes PDFs dans le dossier  ./pdfs/`);
});
