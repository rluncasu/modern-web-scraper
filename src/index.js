import dotenv from 'dotenv';
dotenv.config();
import * as tasks from './tasks/index.js';

(async function doWork() {
  let postIds = await tasks.scrapePostIds(
    'https://www.imobiliare.ro/vanzare-terenuri-constructii/bucuresti',
    1,
    65
  );

  await tasks.crawlPosts(postIds);
  console.log('DAN! ,<----------------------');
  process.exit();
})();
