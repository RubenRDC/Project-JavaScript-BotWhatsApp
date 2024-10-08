const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { filterTextChat, realizarOCR, checkText } = require("./funtions");

const emojiReport = "⚠";
const countEmojiReport = 2;
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "LocalAuth",
  }),
});

const startBot = () => {
  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("message", async (message) => {
    if (message.type == "image" || message.type == "sticker") {
      let bantext = await checkText(message.body);
      let bantextimg = false;

      if (!bantext) {
        let { mimetype, data } = await message.downloadMedia();
        if (allowedMimeTypes.includes(mimetype)) {
          let text = await realizarOCR(`data:${mimetype};base64,${data}`);
          bantextimg = await checkText(text);
        }
      }
      if (bantext || bantextimg) {
        await message.delete(true);
      }
    } else {
      await filterTextChat(message);
    }
  });

  client.on("message_edit", async (message) => {
    if (message.type == "chat") {
      await filterTextChat(message);
    }
  });

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

  client.initialize();
};

module.exports = { startBot };
