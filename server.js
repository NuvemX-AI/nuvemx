const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ 
  dev, 
  hostname, 
  port,
  // Configurações para reduzir problemas de WebSocket
  quiet: false,
  experimentalHttpsServer: false
});
const handle = app.getRequestHandler();

// Configure the proxy middleware
// The first argument (context) is now part of the options object or handled by the conditional logic below.
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3001', // Your backend URL
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' }, // Ensure this matches your backend routing
  timeout: 60000, // 60 seconds timeout for the connection to the target
  proxyTimeout: 60000, // 60 seconds timeout for the response from the target
  ws: false, // Desabilita WebSocket proxy para evitar conflitos
  onError: (err, req, res, target) => {
    console.error('Proxy Error:', err);
    console.error('Request URL:', req.url);
    console.error('Target URL:', target);
    if (res && !res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Proxy Error', error: err.message }));
    } else if (res && res.headersSent) {
      console.error('Headers already sent, cannot send error response.');
    } else {
      console.error('Response object is not available.');
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Custom Server] Proxying request: ${req.method} ${req.url} to ${apiProxy.options.target}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Custom Server] Received response from target: ${proxyRes.statusCode} for ${req.url}`);
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/api')) {
      // Let http-proxy-middleware handle it
      // console.log(`[Custom Server] API request detected: ${req.method} ${req.url}`); // Redundant with onProxyReq
      apiProxy(req, res, (result) => {
        if (result instanceof Error) {
          console.error(`[Custom Server] Callback: Proxying failed for ${req.url}:`, result);
          // Error handling is now more robust within onError, 
          // but this callback can still be useful for specific post-proxy logic if needed.
          // Ensure not to send headers if already sent by onError.
          if (res && !res.headersSent) {
             res.writeHead(500, { 'Content-Type': 'application/json' });
             res.end(JSON.stringify({ message: 'Proxy routing error in callback', error: result.message }));
          }
        }
      });
    } else {
      // Let Next.js handle all other requests
      handle(req, res, parsedUrl);
    }
  });

  // Configurações do servidor para evitar problemas de WebSocket
  server.keepAliveTimeout = 65000; // 65 segundos
  server.headersTimeout = 66000; // 66 segundos
  
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> API requests to /api/* will be proxied to http://localhost:3001 with a 60s timeout`);
  });
}).catch(ex => {
  console.error('Error preparing Next.js app:', ex.stack);
  process.exit(1);
}); 