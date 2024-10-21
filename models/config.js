class Config {
  constructor(urlBrowser, numberAdminBot, groups) {
    this.urlBrowser = urlBrowser;
    this.numberAdminBot = numberAdminBot;
    this.groups = [groups];
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

let config = new Config(undefined, 5491121723166, ["120363350034104808"]);

module.exports = {
  config,
};
