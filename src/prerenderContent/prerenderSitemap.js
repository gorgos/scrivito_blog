/* eslint no-console: "off" */
import * as Scrivito from "scrivito";
import jsontoxml from "jsontoxml";
import formatDate from "../utils/formatDate";

export default async function prerenderSitemap(
  objClassesWhitelist,
  storeResult
) {
  console.time("[prerenderSitemap]");

  const pages = await Scrivito.load(() =>
    prerenderSitemapSearch(objClassesWhitelist).take()
  );
  const sitemapUrls = await Scrivito.load(() => pages.map(pageToSitemapUrl));
  const content = sitemapUrlsToSitemapXml(sitemapUrls);

  console.log(
    `[prerenderSitemap] Generated sitemap.xml with ${sitemapUrls.length} items.`
  );
  console.timeEnd("[prerenderSitemap]");
  await storeResult({ filename: "/sitemap.xml", content });
}

function prerenderSitemapSearch(objClassesWhitelist) {
  return Scrivito.Obj.where("_objClass", "equals", objClassesWhitelist).andNot(
    "robotsIndex",
    "equals",
    "no"
  );
}

function pageToSitemapUrl(page) {
  return {
    url: {
      loc: Scrivito.urlFor(page),
      lastmod: formatDate(page.lastChanged(), "yyyy-mm-dd"),
    },
  };
}

function sitemapUrlsToSitemapXml(sitemapUrls) {
  return jsontoxml(
    [
      {
        name: "urlset",
        attrs: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
        children: sitemapUrls,
      },
    ],
    { xmlHeader: true }
  );
}
