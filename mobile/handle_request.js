const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1234;
// eslint-disable-next-line no-undef
const DUMP_DIR = path.resolve(__dirname, '__test__/dump');

if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR);
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const timestamp = Date.now();
        const filePath = path.join(DUMP_DIR, `${timestamp}.json`);
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
