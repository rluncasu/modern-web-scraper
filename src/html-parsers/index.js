const cheerio = require('cheerio');

function getPostData(html) {
  let data = [];
  const $ = cheerio.load(html);
  $('div.container-box-anunturi').each((row, raw_element) => {
    $(raw_element)
      .find('div.box-anunt')
      .each((i, elem) => {
        if (elem.attribs.id) {
          let {
            attribs: { href },
          } = $(elem).find('a.mobile-container-url')[0];
          data.push({
            postID: elem.attribs.id,
            href,
          });
        }
      });
  });
  return data;
}

function getPostDetails(html) {
  const $ = cheerio.load(html);

  return {
    title: $('#content-detalii .titlu').text(),
    description: $('#box-detalii').text(),
  };
}

module.exports = {
  getPostData,
  getPostDetails,
};
