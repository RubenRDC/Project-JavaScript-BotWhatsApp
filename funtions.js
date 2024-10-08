const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
let badWords, urlWhiteList;

const readFileP = async (path) => {
  try {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  badWords = await readFileP("./variables/badWords.config");
  urlWhiteList = await readFileP("./variables/whiteURLlist.config");
})();

const filterTextChat = async (message) => {
  const chat = await message.getChat();
  if (chat.isGroup) {
    if (checkText(message.body)) {
      deleteContent(chat, message);
    } else if (message.links.length > 0) {
      if (!checkURL(message.links)) {
        deleteContent(chat, message);
      }
    }
  }
};

const deleteContent = async (chat, message) => {
  await message.delete(true);
  await chat.removeParticipants([message.author]);
};

const checkText = async (text) => {
  let countBadWords = 0;
  const textLower = text.toLowerCase();
  badWords.forEach((e) => {
    if (textLower.includes(e)) {
      countBadWords++;
    }
  });
  return countBadWords > 0;
};

const checkURL = (arrayObjectLink) => {
  let count = 0;
  arrayObjectLink.forEach((element) => {
    let { link } = element;

    urlWhiteList.forEach((whiteUrl) => {
      if (link.toLowerCase().includes(whiteUrl)) {
        console.log(link);
        count++;
      }
    });
  });
  return count == arrayObjectLink.length;
};

const command = async (chat, message) => {
  let text = "" + message.body.toLowerCase();
  if (text.includes("#add")) {
    let number = text.replace("#add", "").trim();
    if (number.length > 10) {
      await chat.addParticipants([number + "@c.us"]);
      console.log("Añadiendo a... " + (number + "@c.us"));
    }
    await message.delete(true);
  } else if (text.includes("#delete")) {
    let number = text.replace("#delete", "").trim();
    if (number.length > 10) {
      await chat.removeParticipants([number + "@c.us"]);
    }
    await message.delete(true);
  }
};
const realizarOCR = async (imagenBase64) => {
  let data = await Tesseract.recognize(
    imagenBase64,
    "spa" // Código de idioma (español)
  );
  return data.data.text;
};

module.exports = { filterTextChat, realizarOCR, checkText };
