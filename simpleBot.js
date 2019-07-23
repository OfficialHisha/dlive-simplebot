const DAPI = require("./imported/dliveAPI");

const DEBUG = false;

let bot;
let streamer;
const commands = {
    'User': {},
    'Member': {},
    'Moderator': {},
    'Owner': {}
};
const messageQueue = [];
const commandLevelEnum = Object.freeze({'streamer': 'Owner', 'moderator': 'Moderator', 'follower': 'Member', 'all': 'User'});

module.exports = class Chatreader {
    constructor(accountsPath, streamerAccount, botAccount) {
        this.commandLevel = commandLevelEnum;
        const config = DAPI.config(accountsPath);

        if (config[botAccount] === undefined)
            console.error("The account '" + botAccount + "' is not defined in your accounts.json");
        if (config[streamerAccount] === undefined)
            console.error("The account '" + streamerAccount + "' is not defined in your accounts.json");

        bot = new DAPI.Bot(config[botAccount]);
        streamer = config[streamerAccount];

        const chatReader = new DAPI.Chatreader(streamer, function (data) {
            const message = chatReader.model(data);
            if (message.messageType === "Message") {
                const content = message.content.trim();
                switch (message.roomRole) {
                    case commandLevelEnum.streamer:
                        if (content in commands[commandLevelEnum.streamer]) {
                            commands[commandLevelEnum.streamer][content].callback(message.user.displayname, message.roomRole, message.id);
                            break;
                        }
                    case commandLevelEnum.moderator:
                        if (content in commands[commandLevelEnum.moderator]) {
                            commands[commandLevelEnum.moderator][content].callback(message.user.displayname, message.roomRole, message.id);
                            break;
                        }
                    case commandLevelEnum.follower:
                        if (content in commands[commandLevelEnum.follower]) {
                            commands[commandLevelEnum.follower][content].callback(message.user.displayname, message.roomRole, message.id);
                            break;
                        }
                    case commandLevelEnum.all:
                        if (content in commands[commandLevelEnum.all]) {
                            commands[commandLevelEnum.all][content].callback(message.user.displayname, message.roomRole, message.id);
                        }
                        break;
                }
            } else
                if (DEBUG)
                    console.log(message);
        });

        setInterval(function () {
            if (messageQueue.length > 0)
                bot.sendMessage(streamer, messageQueue.shift());
        }, 2000);
    }

    registerCommand(commandString, callBack, commandLevel = commandLevelEnum.all, chatResponse = undefined) {
        commands[commandLevel][commandString] = {'callback': callBack, 'response': chatResponse};
    }

    sendMessage(message) {
        messageQueue.push(message);
    }
};