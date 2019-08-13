import cheerio from 'cheerio';

export function getPostData(html) {
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

export function getPostDetails(html) {
  const $ = cheerio.load(html);

  const utilities = $('.utilitati li')
    .map((i, e) =>
      $(e)
        .text()
        .trim()
        .toLowerCase()
    )
    .toArray();

  const characteristics = $('.lista-tabelara li')
    .toArray()
    .reduce((acc, l) => {
      let o = {
        [$(l)
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .trim()
          .toLowerCase()
          .replace(':', '')]: $(l)
          .children()
          .text()
          .trim()
          .toLowerCase(),
      };
      return { ...acc, ...o };
    }, {});

  return {
    title: $('#content-detalii .titlu h1')
      .text()
      .trim()
      .toLowerCase(),
    location: $('#content-detalii .titlu .header_info .row div:nth-of-type(1)')
      .text()
      .trim()
      .toLowerCase(),
    actualizat: $(
      '#content-detalii .titlu .header_info .row div:nth-of-type(2)'
    )
      .text()
      .trim()
      .toLowerCase(),
    price: $('#content-detalii .pret.first[itemprop="price"]')
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim()
      .toLowerCase(),
    priceCurrency: $('#content-detalii .pret.first [itemprop="priceCurrency"]')
      .text()
      .trim()
      .toLowerCase(),
    description: $('#b_detalii_text')
      .text()
      .trim()
      .toLowerCase(),
    water: utilities.includes('apa'),
    gas: utilities.includes('gaz'),
    drainage: utilities.includes('canalizare'),
    electricity: utilities.includes('curent'),
    area: characteristics['suprafaţă teren'] || '',
    street_front_length: characteristics['front stradal'] || '',
    street_front_num: characteristics[''] || '',
    pot: characteristics['p.o.t.'] || '',
    cut: characteristics['c.u.t.'] || '',
    urban_coef_source: characteristics['sursă coef. urbanistici'] || '',
    terrain_type: characteristics['tip teren'] || '',
    classification: characteristics['clasificare teren'] || '',
    constructions: characteristics['construcţie pe teren'] || '',
    built_area: characteristics['suprafaţă construită'] || '',
  };
}
