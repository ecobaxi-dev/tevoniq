import https from 'node:https';
import { lookup } from 'node:dns/promises';

const urls = [
  'https://registry.npmjs.org/-/ping',
  'https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz',
];
try {
  const addresses = await lookup('registry.npmjs.org', { all: true });
  console.log(
    'Registry DNS:',
    addresses.map(({ address, family }) => `${address} IPv${family}`).join(', '),
  );
} catch (error) {
  console.log('DNS failed:', error.code);
}
for (const family of [0, 4]) {
  for (const url of urls) {
    await new Promise((resolve) => {
      let bytes = 0;
      const started = Date.now();
      const label = `${family ? 'IPv4' : 'Default'} ${new URL(url).pathname}`;
      const req = https.get(url, { family }, (res) => {
        res.on('data', (chunk) => {
          bytes += chunk.length;
        });
        res.on('end', () => {
          console.log(
            `${label}: HTTP ${res.statusCode}, ${bytes} bytes, ${Date.now() - started} ms`,
          );
          clearTimeout(deadline);
          resolve();
        });
        res.on('error', (error) => {
          console.log(`${label}: response ${error.code || error.message}, ${bytes} bytes`);
          clearTimeout(deadline);
          resolve();
        });
      });
      const deadline = setTimeout(() => req.destroy(new Error('30 second deadline')), 30000);
      req.on('error', (error) => {
        console.log(`${label}: ${error.code || error.message}`);
        clearTimeout(deadline);
        resolve();
      });
    });
  }
}
