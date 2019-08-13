import Nightmare from 'nightmare';
import Parquets from 'parquets';

import { postsSchema } from '../models.js';
import { getPostData, getPostDetails } from '../html-parsers/index.js';

const nightmare = Nightmare({
  show: false,
  webPreferences: {
    images: false,
  },
});

const BASE_URL =
  'https://www.imobiliare.ro/vanzare-terenuri-constructii/bucuresti';
const PAGE_PARAM = 'pagina=';

export function getIdsFromPosts(urls) {
  return urls
    .reduce(function(accumulator, url) {
      return accumulator.then(function(results) {
        return nightmare
          .goto(url)
          .wait('body')
          .click('a.btn-actiune.btn-actiune--principal')
          .evaluate(() => document.querySelector('body').innerHTML)
          .then(function(response) {
            let posts = getPostData(response);
            results.push(posts);
            return results;
          })
          .catch(err => console.log(err));
      });
    }, Promise.resolve([]))
    .then(res => res.flat());
}

export async function scrapePostIds(
  baseUrl = BASE_URL,
  startPage = 1,
  endPage = 1
) {
  // building page urls
  let urls = [];
  for (let page = startPage; page < endPage + 1; page++) {
    urls.push(`${baseUrl}?${PAGE_PARAM}${page}`);
  }

  // getting the Post-ids
  let posts = await getIdsFromPosts(urls);
  return posts;
}

export async function crawlPosts(posts) {
  let postsWriter = await Parquets.ParquetWriter.openFile(
    postsSchema,
    'terenuri.parquet'
  );
  return posts
    .reduce((acc, post, idx) => {
      return acc.then(results => {
        return nightmare
          .goto(post.href)
          .wait('body')
          .click('a.btn-actiune.btn-actiune--principal')
          .evaluate(() => document.querySelector('body').innerHTML)
          .then(async function(response) {
            console.log(`Processing post:${post.postID} | idx: ${idx} `);
            let postDetails = getPostDetails(response);
            let row = {
              ...postDetails,
              scrapedOnTS: new Date(),
              postID: post.postID,
              href: post.href,
            };
            await postsWriter.appendRow(row);
            results.push(row);
            return results;
          })
          .catch(err => console.log(err));
      });
    }, Promise.resolve([]))
    .finally(async () => {
      await postsWriter.close();
    });
}
