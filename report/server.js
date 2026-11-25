const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 8080);
const apkRoot = fs.existsSync('/data') ? '/data' : path.join(root, 'downloads');
const apkFiles = new Set([
  'OnDeenUser-real-debug.apk',
  'OnDeenOrganiser-real-debug.apk'
]);
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.pdf': 'application/pdf',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.apk': 'application/vnd.android.package-archive',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json'
};

function safePath(requestUrl) {
  const raw = decodeURIComponent((requestUrl || '/').split('?')[0]);
  const relative = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
  if (relative.startsWith('downloads/')) {
    const filename = relative.slice('downloads/'.length);
    if (apkFiles.has(filename)) return path.join(apkRoot, filename);
  }
  const candidate = path.resolve(root, relative);
  return candidate.startsWith(root + path.sep) ? candidate : path.join(root, 'index.html');
}

function sendError(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

const server = http.createServer((request, response) => {
  const file = safePath(request.url);
  fs.stat(file, (error, stats) => {
    const target = !error && stats.isFile() ? file : path.join(root, 'index.html');
    fs.stat(target, (targetError, targetStats) => {
      if (targetError) return sendError(response, 500, 'Unable to load the review packet');
      const size = targetStats.size;
      const type = mime[path.extname(target).toLowerCase()] || 'application/octet-stream';
      const headers = {
        'Content-Type': type, 'Accept-Ranges': 'bytes',
        'Cache-Control': path.basename(target) === 'index.html' ? 'no-store' : 'public, max-age=3600'
      };
      const isApk = path.extname(target).toLowerCase() === '.apk';
      if (isApk) headers['Content-Disposition'] = `attachment; filename="${path.basename(target)}"`;
      const range = request.headers.range;
      if (range && (type.startsWith('video/') || isApk)) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        if (!match) return sendError(response, 416, 'Invalid range');
        const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]) - 1);
        const end = match[2] ? Number(match[2]) : size - 1;
        if (start > end || start >= size) return sendError(response, 416, 'Range not satisfiable');
        headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
        headers['Content-Length'] = end - start + 1;
        response.writeHead(206, headers);
        return fs.createReadStream(target, { start, end }).pipe(response);
      }
      headers['Content-Length'] = size;
      response.writeHead(200, headers);
      if (request.method === 'HEAD') return response.end();
      fs.createReadStream(target).on('error', () => response.destroy()).pipe(response);
    });
  });
});

server.listen(port, '0.0.0.0', () => console.log(`OnDeen owner review listening on ${port}`));
