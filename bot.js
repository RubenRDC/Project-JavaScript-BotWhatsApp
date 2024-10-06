const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const emojiReport = "⚠";
const countEmojiReport = 2;

const urlWhiteList = [
  "https://www.youtube.com",
  "https://www.tiktok.com",
  "http://www.youtube.com",
  "http://www.tiktok.com",
  "https://www.instagram.com",
  "http://www.instagram.com",
];

const badWords = ["cp", "venta", "vendo"];

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "LocalAuth",
  }),
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();

client.on("message", async (message) => {
  if (message.type == "chat") {
    filterTextChat(message);
  }
});

client.on("message_edit", async (message) => {
  if (message.type == "chat") {
    filterTextChat(message);
  }
});

const filterTextChat = async (message) => {
  const chat = await message.getChat();
  if (chat.isGroup) {
    console.log(message.author);
    if (checkText(message.body.toLowerCase())) {
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

const checkText = (text) => {
  let countBadWords = 0;
  badWords.forEach((e) => {
    if (text.includes(e)) {
      countBadWords++;
    }
  });
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

client.on("message_reaction", async (reac) => {
  let chat = await client.getChatById(reac.msgId.remote);
  if (chat.isGroup) {
    let idMsg = reac.msgId._serialized;
    console.log("id de Mensaje: " + idMsg);
    let ObjectMsg = await client.getMessageById(idMsg);
    let listReacts = await ObjectMsg.getReactions();
    if (listReacts != undefined) {
      listReacts.forEach((e) => {
        /*console.log(
          listReacts.length + " " + e.aggregateEmoji + " " + e.senders.length
        );*/

        if (
          e.aggregateEmoji === emojiReport &&
          e.senders.length === countEmojiReport
        ) {
          console.log(
            "Mensaje con el Id: " + idMsg + " fue eliminado por votacion."
          );
          ObjectMsg.delete(true);
        }
      });
    }
  }
});
