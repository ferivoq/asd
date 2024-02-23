// ==MiruExtension==
// @name         AnimeDrive
// @version      v0.0.1
// @author       FeriVOQ
// @lang         hu
// @license      MIT
// @icon         https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0
// @package      animedrive.anime
// @type         bangumi
// @webSite      https://animedrivescrapperferi.vercel.app
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
      defaultValue: "http://127.0.0.1:5000",
    });
    this.registerSetting({
      title: "Preferred quality",
      key: "prefQuality",
      type: "input",
      description: "Choose between 360p/480p/720p/1080p",
      defaultValue: "480p",
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
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/search/${kw}?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
    }));
  }

  async watch(url, id) {
    const quality = await this.getSetting("prefQuality");
    const res = await this.req(`/watch/${id}?ep=${url}`);
    const prefQuality = res.sources.find(source => source.quality === quality);

    if (prefQuality) {
      return {
        type: "mp4",
        url: prefQuality.url,
      };
    } else {
      return {
        type: "mp4",
        url: res.sources.pop().url,
      };
    }
  }
}
