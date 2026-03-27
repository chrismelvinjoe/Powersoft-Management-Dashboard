const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one that comes with json-server
server.use(jsonServer.bodyParser);
// Increase the limit for base64 images
server.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // This is just a hint for the middleware, the actual limit is often 
    // controlled by the underlying body-parser which json-server uses.
    // json-server 0.17.4 uses express's body-parser.
  }
  next();
});

// Actually, json-server uses body-parser internally. 
// To override the limit, we might need to use express directly or 
// rely on the default behavior if it's high enough. 
// Standard json-server 0.17.x has a 10mb limit sometimes.
// Let's enforce a 50mb limit for JSON.
const express = require('express');
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb', extended: true }));

const port = process.env.PORT || 5000;

server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
