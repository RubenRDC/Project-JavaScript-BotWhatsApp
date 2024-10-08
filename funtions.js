const Tesseract = require("tesseract.js");

const urlWhiteList = [
  "https://www.youtube.com",
  "https://www.tiktok.com",
  "http://www.youtube.com",
  "http://www.tiktok.com",
  "https://www.instagram.com",
  "http://www.instagram.com",
];

const badWords = ["cp", "venta", "vendo"];

const filterTextChat = async (message) => {
  const chat = await message.getChat();
  if (chat.isGroup) {
    //console.log(message.author);
    if (checkText(message.body)) {
      await message.delete(true);
    } else if (message.links.length > 0) {
      if (!checkURL(message.links)) {
        //console.log(message.body);
        await message.delete(true);
        await chat.removeParticipants([message.author]);
        //message.reply("Contenido no permitido.");
      }
    } else {
      //command(chat, message);
    }
  }
};

const checkText = async (text) => {
  let countBadWords = 0;
  const textLower = text.toLowerCase();
  badWords.forEach((e) => {
    if (textLower.includes(e)) {
      countBadWords++;
    }
  });
  //console.log("Text =" + textLower + "\nBad Words = " + countBadWords);
  return countBadWords > 0;
};

const checkURL = (arrayObjectLink) => {
  let count = 0;
  //console.log(msgs.length);
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
