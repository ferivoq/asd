// ==MiruExtension==
// @name         AnimeDrive
// @version      v1.0.0
// @author       FeriVOQ, Hun0r
// @lang         hu
// @license      MIT
// @icon         https://cdn.discordapp.com/icons/702098578251841577/be50b5dbcb30bd99512b6df29284db0c.webp?size=96
// @package      animedrive.anime
// @type         bangumi
// @webSite      https://animedrive.hu/
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("animedriveApi"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "AnimeDrive API",
      key: "animedriveApi",
      type: "input",
      description: "API URL",
      defaultValue: "http://192.168.0.185:5000",
    });
  }

  async latest(page) {
    const res = await this.req(`/top-airing`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
    }));
  }

  async detail(url) {
    const res = await this.req(`/info/${url}`);
    return {
      id: res.id,
      title: res.title,
      cover: res.imageUrl,
      desc: res.description,
      episodes: [
        {
          title: "Ep",
          urls: res.episodes.map((item) => ({
            name: `Episode ${item.number}`,
            url: `/watch/${item.animeid}&ep=${item.id}`,
            animeid: item.animeid,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/search?q=${kw}&page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.image,
    }));
  }

  async watch(url) {
    const res = await this.req(url);

    return {
      type: "mp4",
      url: res.stream.multi.main.url,
    };
  }
}
