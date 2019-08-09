const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const mongoose = require('mongoose');
const { postsSchema } = require('../models');
const { getPostData, getPostDetails } = require('../html-parsers');

// models
const Post = mongoose.model('Post', postsSchema);

const BASE_URL =
  'https://www.imobiliare.ro/vanzare-terenuri-constructii/bucuresti';
const PAGE_PARAM = 'pagina=';

async function savePostIds(ids) {
  let promises = ids.map(async id => {
    if (!(await Post.exists({ postID: id.postID }))) {
      let p = new Post(id);
      p.save();
    }
    return Promise.resolve();
  });
  return Promise.all(promises);
}

function getIdsFromPosts(urls) {
  return urls
    .reduce(function(accumulator, url) {
      return accumulator.then(function(results) {
        return nightmare
          .goto(url)
          .wait('body')
          .click('a.btn-actiune.btn-actiune--principal')
          .evaluate(() => document.querySelector('body').innerHTML)
          .then(function(response) {
            let pageIds = getPostData(response);
            savePostIds(pageIds);
            results.push(pageIds);
            return results;
          })
          .catch(err => console.log(err));
      });
    }, Promise.resolve([]))
    .then(results => results.flat());
}

function clearPostsCollection() {
  console.log('cleaning collection');
  return Post.deleteMany({}).exec();
}

async function scrapePostIds(baseUrl = BASE_URL, startPage = 1, endPage = 1) {
  // building page urls
  let urls = [];
  for (let page = startPage; page < endPage + 1; page++) {
    urls.push(`${baseUrl}?${PAGE_PARAM}${page}`);
  }

  // getting the Post-ids
  let ids = await getIdsFromPosts(urls);
  console.log(ids);
}

async function crawlPosts() {
  let posts = await Post.find({})
    .select({ href: true })
    .lean();
  return posts.reduce((acc, post) => {
    return acc.then(results => {
      return nightmare
        .goto(post.href)
        .wait('body')
        .click('a.btn-actiune.btn-actiune--principal')
        .evaluate(() => document.querySelector('body').innerHTML)
        .then(async function(response) {
          let postDetails = getPostDetails(response);
          let u = await Post.findByIdAndUpdate(post._id, postDetails);
          results.push(postDetails);
          return results;
        })
        .catch(err => console.log(err));
    });
  }, Promise.resolve([]));
}

module.exports = {
  getIdsFromPosts,
  clearPostsCollection,
  scrapePostIds,
  savePostIds,
  crawlPosts,
};
