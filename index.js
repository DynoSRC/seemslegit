const bodyParser = require('body-parser');
const express = require('express');
const memes = require('./memes');
const path = require('path');

const PORT = process.env.PORT || 5000;
const S3_PATH = 'https://s3-us-west-2.amazonaws.com/seemslegit';

function memeResponse(res, meme, redirect=false) {
  const type = memes[meme];
  const url = `${S3_PATH}/${meme}.${type}`;

  if (redirect) {
    res.redirect(302, url);
  } else {
    const random = randomKey(memes);
    const attachment = type ?
        {'image_url': url, 'fallback': 'Valid meme, but failed to load. :('} :
        {'text': '600+ memes, but this one is invalid. Try this: ' + random}
    res.json({
      'response_type': 'in_channel',
      'attachments': [attachment]
    });
  }
}

function randomKey(obj) {
  const keys = Object.keys(obj);
  return keys[keys.length * Math.random() << 0];
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/meme', (req, res) => {
    memeResponse(res, req.query.meme, true);
  })
  .post('/meme', (req, res) => {
    const meme = req.body.meme || req.body.text || req.query.text;
    memeResponse(res, meme, !!req.body.meme);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
