// ==MiruExtension==
// @name         AnimeDrive
// @version      v0.0.2
// @author       FeriVOQ, Hun0r
// @lang         hu
// @license      MIT
// @icon         https://i.imgur.com/ZST5sUd.png
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
    const res = await this.req(`/episode/${url}`);

    const getQualityUrl = async (quality) => {
      const qualitySource = res.sources.find(source => source.quality === quality);
      if (qualitySource) {
        return qualitySource.url;
      } else {
        return res.sources[res.sources.length - 1].url;
      }
    };

    const prefQuality = await this.getSetting("prefQuality");
    const initialUrl = await getQualityUrl(prefQuality);

    return {
      type: "mp4",
      url: initialUrl,
      controls: [
        {
          name: "quality",
          html: "Quality",
          position: "right",
          selector: [...new Set(res.sources.map(item => item.quality))].map(quality => ({
            name: quality,
            html: quality,
          })),
          onSelect: async function (quality) {
            const qualityUrl = await getQualityUrl(quality.name);
            this.switchUrl(qualityUrl);
          },
        },
      ],
    };
  }
}
