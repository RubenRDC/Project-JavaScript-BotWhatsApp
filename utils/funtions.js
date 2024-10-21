const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const { config } = require(`../models/config`);

const readFileP = async (path) => {
  try {
    const data = await fs.readFile(path, "utf-8");
    return { data: JSON.parse(data) };
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

const filterTextChat = async (message) => {
  const chat = await message.getChat();
  const verifyText = await checkText(message.body);
  if (verifyText) {
    return await deleteContent(chat, message);
  } else if (message.links.length > 0) {
    if (!(await checkURL(message.links))) {
      return await deleteContent(chat, message);
    }
  }
  return false;
};

const verifyGroup = (idGroup) => {
  const text = idGroup.replace("@g.us", "").replace("@c.us", "");
  if (text == config.numberAdminBot) {
    return { IsAvaliableGroup: false, IsAdminBot: true };
  } else {
    for (const element of config.groups) {
      if (text == element) {
        return { IsAvaliableGroup: true, IsAdminBot: false };
      }
    }
  }
  return { IsAvaliableGroup: false, IsAdminBot: false };
};

const deleteContent = async (chat, message) => {
  try {
    await message.delete(true);
    await chat.removeParticipants([message.author]);
  } catch (error) {
    console.log(
      `[${new Date(
        Date.now()
      ).toString()}] No fue posible eliminar el contenido o al participante [${
        message.author
      }].`
    );
    return false;
  }
  return true;
};

const checkText = async (text) => {
  let countBadWords = 0;
  const textLower = text.toLowerCase();
  config.badWords.forEach((e) => {
    if (textLower.includes(e)) {
      countBadWords++;
    }
  });
  return countBadWords > 0;
};

const checkURL = async (arrayObjectLink) => {
  let count = 0;
  arrayObjectLink.forEach((element) => {
    let { link } = element;

    config.urlWhiteList.forEach((whiteUrl) => {
      if (link.toLowerCase().includes(whiteUrl)) {
        count++;
      }
    });
  });
  return count == arrayObjectLink.length;
};

const realizarOCR = async (imagenBase64) => {
  let data = await Tesseract.recognize(
    imagenBase64,
    "spa" // Código de idioma (español)
  );
  return data.data.text;
};

module.exports = {
  filterTextChat,
  realizarOCR,
  checkText,
  deleteContent,
  verifyGroup,
};
