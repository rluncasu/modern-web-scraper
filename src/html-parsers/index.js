const cheerio = require('cheerio');

function getPostIds(html) {
    let data = [];
    const $ = cheerio.load(html);
    $('div.container-box-anunturi').each((row, raw_element) => {
      $(raw_element).find('div.box-anunt').each((i, elem) => {
        elem.attribs.id && data.push(elem.attribs.id);
      });
    });
    return data;
  }

module.exports = {
    getPostIds
}