const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1234;
// eslint-disable-next-line no-undef
const DUMP_DIR = path.resolve(__dirname, '__test__/dump');

if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  let directory = DUMP_DIR;

  if (req.url && req.url.includes('/before-extract')) {
    directory = path.join(DUMP_DIR, 'before-extract');
  } else if (req.url && req.url.includes('/after-extract')) {
    directory = path.join(DUMP_DIR, 'after-extract');
  } else if (req.url && req.url.includes('/whatsapp-researcher-agent')) {
    directory = path.join(DUMP_DIR, 'whatsapp-researcher-agent');
  } 

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const timestamp = Date.now();
        const filePath = path.join(directory, `${timestamp}.json`);
        fs.writeFileSync(filePath, body);

        console.log(`\n📦 JSON recebido e salvo em ${filePath}`);
        console.log(body);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } catch (err) {
        console.error('Erro ao salvar JSON:', err);
        res.writeHead(500);
        res.end('Erro no servidor');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP ouvindo na porta ${PORT}`);
});
