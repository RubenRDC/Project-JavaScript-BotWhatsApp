const fs = require("fs").promises;

class Config {
  constructor(urlBrowser, numberAdminBot, groups, badWords, urlWhiteList) {
    this.urlBrowser = urlBrowser;
    this.numberAdminBot = numberAdminBot;
    this.groups = groups;
    this.badWords = badWords;
    this.urlWhiteList = urlWhiteList;
  }
}

let preConfig = new Config(
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
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

const loadConfig = async () => {
  try {
    const data = await fs.readFile("./primordial.config", "utf-8");
    preConfig = data;
  } catch (error) {
    await fs.writeFile(
      `./primordial.config`,
      JSON.stringify(preConfig, null, " ")
    );
    throw new Error("No se encontro el archivo de configuracion primordial\nSe ha generado el archivo de configuracion necesario.");
  }
};

module.exports = {
  config: preConfig,
  loadConfig,
};
