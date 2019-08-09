const dotenv = require('dotenv');
dotenv.config();

const Nightmare = require('nightmare');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const { MONGODB_PASS, MONGODB_URL, MONGODB_USER } = process.env;
mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_URL}`, {useNewUrlParser: true});

const nightmare = Nightmare({ show: true })
const BASE_URL = 'https://www.imobiliare.ro/vanzare-terenuri-constructii/bucuresti';
const PAGE_PARAM = 'pagina=';

const postsSchema = new mongoose.Schema({
    postID: String
  });


const Post = mongoose.model('Post', postsSchema);

// Parsing data using cheerio
let getData = html => {
    let data = [];
    const $ = cheerio.load(html);
    $('div.container-box-anunturi').each((row, raw_element) => {
      $(raw_element).find('div.box-anunt').each((i, elem) => {
        elem.attribs.id && data.push(elem.attribs.id);
      });
    });
    return data;
  }

let urls = [];
for (let page=1; page < 67; page++) {
    urls.push(`${BASE_URL}?${PAGE_PARAM}${page}`);
}




const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('DB connected <---------------------');
  console.log('cleaning collection');
  Post.deleteMany({}).exec();
  urls.reduce(function(accumulator, url) {
    return accumulator.then(function(results) {
      return nightmare.goto(url)
        .wait('body')
        .click('a.btn-actiune.btn-actiune--principal')
        .evaluate(() => document.querySelector('body').innerHTML)
        .then(function(response){
          results.push(getData(response));
          return results;
        })
        .catch(err=>console.log(err));
    });
  }, Promise.resolve([])).then(function(results){
      results.flat().forEach(r => {
          let p = new Post({ postID: r});
          console.log(p);
          p.save();
      });
  }).then(()=>{
      console.log('DONE');
  });
});
