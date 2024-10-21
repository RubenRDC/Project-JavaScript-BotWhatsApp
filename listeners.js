const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const {
  filterTextChat,
  realizarOCR,
  checkText,
  deleteContent,
  verifyGroup,
} = require("./utils/funtions");

const context = {};
const emojiReport = "⚠";
const countEmojiReport = 2;
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const extensionOneView = `${__dirname}/extensionOneView/WhatsApp-Bypass-Once-View-main`;

let client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "LocalAuth",
  }),
  puppeteer: {
    //headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: [
      `--disable-extensions-except=${extensionOneView}`,
      `--load-extension=${extensionOneView}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions",
      "--disable-gpu",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-dev-shm-usage",
    ],
  },
});

const startBot = () => {
  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("message", async (message) => {
    const { IsAvaliableGroup, IsAdminBot } = verifyGroup(message.id.remote);
    if (IsAvaliableGroup) {
      if ((await filterTextChat(message)) == false) {
        if (
          (message.type == "image" || message.type == "sticker") &&
          message.hasMedia &&
          !message.isViewOnce
        ) {
          let { data, mimetype } = await message.downloadMedia();

          if (allowedMimeTypes.includes(mimetype)) {
            let text = await realizarOCR(`data:${mimetype};base64,${data}`);
            if (await checkText(text)) {
              await deleteContent(message.getChat(), message);
            }
          }
        }
      }
    } else if (IsAdminBot) {
      const chat = await message.getChat();
      if (!context[chat.id.user]) {
        chat.sendMessage(
          "> Mensaje del Administrador Recibido... \nOpcion 1:\nOpcion 2:\nOpcion 3:\nOpcion 4:"
        );
        context[chat.id.user] = { step: 0 };
      } else {
        chat.sendMessage("> Mensaje del Administrador Recibido...");
      }
    }
    /*console.log(
      `[${new Date(Date.now()).toString()}] Tipo: [${message.type}], Texto: [${
        message.body
      }], Remitente: [${message.author}] - [${chat.id.user}] [${chat.name}]`
    );*/
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
