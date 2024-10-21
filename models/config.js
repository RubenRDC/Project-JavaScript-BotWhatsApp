class Config {
  constructor(urlBrowser, numberAdminBot, groups, badWords, urlWhiteList) {
    this.urlBrowser = urlBrowser;
    this.numberAdminBot = numberAdminBot;
    this.groups = [groups];
    this.badWords = [badWords];
    this.urlWhiteList = [urlWhiteList];
  }
}
const createFile = async (path, content) => {
  try {
    const data = await fs.writeFile(path, content);
    return { data: JSON.parse(data) };
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

let config = new Config(
  "",
  5491121723166,
  ["120363350034104808"],
  ["venta", "vendo"],
  [
    "https://www.youtube.com",
    "https://www.tiktok.com",
    "http://www.youtube.com",
    "http://www.tiktok.com",
    "https://www.instagram.com",
    "http://www.instagram.com",
  ]
);

module.exports = {
  config,
};
