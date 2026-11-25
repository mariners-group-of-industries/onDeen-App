const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function safeFile(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(root, relative);
  return candidate.startsWith(root + path.sep) ? candidate : path.join(root, 'index.html');
}

const server = http.createServer((request, response) => {
  if ((request.url || '').split('?')[0] === '/config.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(`window.ONDEEN_API_URL = ${JSON.stringify(process.env.ONDEEN_API_URL || '')};`);
    return;
  }
  const file = safeFile(request.url);
  fs.stat(file, (error, stats) => {
    const target = !error && stats.isFile() ? file : path.join(root, 'index.html');
    fs.readFile(target, (readError, data) => {
      if (readError) {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Unable to load the admin console');
        return;
      }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': target.endsWith('index.html') || ['app.js', 'styles.css'].includes(path.basename(target)) ? 'no-store' : 'public, max-age=3600',
      });
      response.end(data);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`OnDeen Admin Console listening on ${port}`);
});
