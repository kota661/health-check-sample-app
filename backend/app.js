const express = require('express');
const app = express();
const http = require('http');

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.end('This is backend app');
});

app.get('/healthz', (req, res) => {
  res.send('OK');
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

