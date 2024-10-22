const { startBot } = require("./listeners");
const { loadConfig } = require("./models/config");
loadConfig();
startBot();