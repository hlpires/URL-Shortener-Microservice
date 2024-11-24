require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

const port = process.env.PORT || 3001;


let urlDatabase = {};
let idCounter = 1;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/', express.static(`${process.cwd()}/public`));


app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});




app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;
  const urlObject = new URL(originalUrl);
  console.log(originalUrl, "XXX")
  // if (originalUrl.includes("?v=")) {
  //   return res.status(400).send({ error: 'invalid url' });
  // }
  if (!/^http?:\/\//.test(originalUrl)) {
    return res.send({ error: 'invalid url' });
  }
  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      return res.send({ error: 'invalid url' });
    }
  })
  if (urlDatabase[originalUrl]) {
    return res.json({
      original_url: originalUrl,
      short_url: urlDatabase[originalUrl]
    });
  }


  const shortUrl = idCounter++;
  urlDatabase[originalUrl] = shortUrl;

  res.json({
    original_url: originalUrl,
    short_url: shortUrl
  });
});

app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl;
  let originalUrl = null;
  for (let url in urlDatabase) {
    if (urlDatabase[url] == shortUrl) {
      originalUrl = url;
      break;
    }
  }

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'invalid url' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
