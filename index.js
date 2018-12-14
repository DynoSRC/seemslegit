const bodyParser = require('body-parser');
const express = require('express');
const memes = require('./memes');
const path = require('path');
const levenshtein = require('fast-levenshtein');

const PORT = process.env.PORT || 5000;
const S3_PATH = 'https://s3-us-west-2.amazonaws.com/seemslegit';

function memeResponse(res, meme, redirect=false) {
  const type = memes[meme];
  const url = `${S3_PATH}/${meme}.${type}`;

  if (redirect) {
    res.redirect(302, url);
  } else {
    const closest = !type && closestMeme(meme);
    const attachment = type ?
        {'image_url': url, 'fallback': 'Valid meme, but failed to load. :('} :
        {
          'text':
              '600+ memes, but this one is invalid. Did you mean: ' + closest,
          'actions': [{
            'type': 'button',
            'text': 'View all memes',
            'url': 'https://seemslegit.herokuapp.com/list',
          }],
        };
    res.json({
      'response_type': 'in_channel',
      'attachments': [attachment],
    });
  }
}

function closestMeme(inputMeme) {
  return Object.keys(memes).reduce((memo, meme) => {
    const score = levenshtein.get(inputMeme, meme);
    if (score < memo.score) {
      memo.score = score;
      memo.meme = meme;
    }
    return memo;
  }, {score: Infinity, meme: null}).meme;
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/list', (req, res) => {
    res.render('pages/list', {memes: memes, s3Path: S3_PATH});
  })
  .get('/meme', (req, res) => {
    memeResponse(res, req.query.meme, true);
  })
  .post('/meme', (req, res) => {
    const meme = req.body.meme || req.body.text || req.query.text;
    memeResponse(res, meme, !!req.body.meme);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
