const express = require('express');
const app = express();
const http = require('http');

const port = process.env.PORT || 3000;
const backendUrl = process.env.BACKEND_URL || 'http://example.com';

app.get('/', (req, res) => {
  res.end('This is frontend app');
});

app.get('/healthz', (req, res) => {
  console.log(`backend health check  ${backendUrl}`);
  http.get(backendUrl, (backendRes) => {
    if (backendRes.statusCode === 200) {
      res.send(`Frontend and backend are ok. backendurl = ${backendUrl}`);
    } else {
      res.status(500).send(`Backend health check failed. backendurl = ${backendUrl}`);
    }
  }).on('error', (err) => {
    res.status(500).send(`Failed to connect to backend. backendurl = ${backendUrl}`);
  });;
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

