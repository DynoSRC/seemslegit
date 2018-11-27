const express = require('express');
const memes = require('./memes');
const path = require('path');

const PORT = process.env.PORT || 5000;
const S3_PATH = 'https://s3-us-west-2.amazonaws.com/seemslegit';

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/meme', (req, res) => {
    const meme = req.query.meme;
    const type = memes[meme];
    res.redirect(302, `${S3_PATH}/${meme}.${type}`);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
