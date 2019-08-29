const DAPI = require("./imported/dliveAPI");

const DEBUG = true;

let bot;
let streamer;
const commands = {};
const events = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: []
}
const messageQueue = [];
const commandLevelEnum = Object.freeze({ 'streamer': 3, 'moderator': 2, 'follower': 1, 'all': 0 });
const eventEnum = Object.freeze({'chat': 8, 'host': 7, 'subscribe': 6, 'ninjet': 5, 'ninjaghini': 4, 'diamond': 3, 'icecream': 2, 'lemon': 1, 'follow': 0 });
const roomRolePermissionLookup = Object.freeze({ 'Owner': 3, 'Moderator': 2, 'Member': 1, 'User': 0 });

function sendMessage(message) {
    messageQueue.push(message);
}

function triggerEvent(event, eventData) {
    events[event].forEach(callback => {
        callback(eventData);
    });
}

function tryRunCommand(commandString, user, messageId) {
    if (commands[commandString].permission > roomRolePermissionLookup[user.roomRole])
        //The user does not have permission to use this command
        return;

    const command = commands[commandString];

    if (command.callback)
        command.callback({ username: user.username, linoname: user.linoname, roomRole: user.roomRole, messageId: messageId });

    if (command.autoResponse)
        sendMessage(command.autoResponse);
}

function tryRunParameterCommand(messageString, user, messageId) {
    const commandParts = messageString.split(' ');

    for (let i = commandParts.length - 1; i > 0; i--) {
        let newCommandString = commandParts[0];
        for (let j = 1; j < i; j++) {
            newCommandString += " " + commandParts[j];
        }

        if (newCommandString in commands) {
            if (commands[newCommandString].permission > roomRolePermissionLookup[user.roomRole])
                //The user does not have permission to use this command
                return;

            const command = commands[newCommandString];
            commandParts.splice(0, i);
            if (command.callback)
                command.callback({username: user.username, linoname: user.linoname, roomRole: user.roomRole, messageId: messageId, parameters: commandParts });

            if (command.autoResponse)
                sendMessage(command.autoResponse);

            return;
        }
    }
}

module.exports = class Chatreader {
    constructor(accountsPath, streamerAccount, botAccount) {
        this.commandLevel = commandLevelEnum;
        this.eventType = eventEnum;
        const config = DAPI.config(accountsPath);

        if (config[botAccount] === undefined)
            console.error("The account '" + botAccount + "' is not defined in your accounts.json");
        if (config[streamerAccount] === undefined)
            console.error("The account '" + streamerAccount + "' is not defined in your accounts.json");

        bot = new DAPI.Bot(config[botAccount]);
        this.api = bot;
        streamer = config[streamerAccount];

        const chatReader = new DAPI.Chatreader(streamer, (data) => {
            const message = chatReader.model(data);

            const user = {}
            user.username = message.user.displayname;
            user.linoname = message.user.username;
            user.roomRole = message.roomRole;

            if (message.messageType === "Message") {
                const messageString = message.content.trim();

                triggerEvent(eventEnum.chat, {username: user.username, linoname: user.linoname, message: message.content});

                if (messageString in commands)
                    tryRunCommand(messageString, user, message.id);
                else
                    tryRunParameterCommand(messageString, user, message.id);

            } else if (message.messageType === "Follow") {
                triggerEvent(eventEnum.follow, {username: user.username, linoname: user.linoname});
            } else if (message.messageType === "Gift") {
                switch (message.gift) {
                    case "LEMON":
                        triggerEvent(eventEnum.lemon, {username: user.username, linoname: user.linoname, linoAmount: message.lino});
                        break;
                    case "ICE_CREAM":
                        triggerEvent(eventEnum.icecream, {username: user.username, linoname: user.linoname, linoAmount: message.lino});
                        break;
                    case "DIAMOND":
                        triggerEvent(eventEnum.diamond, {username: user.username, linoname: user.linoname, linoAmount: message.lino});
                        break;
                    case "NINJAGHINI":
                        triggerEvent(eventEnum.ninjaghini, {username: user.username, linoname: user.linoname, linoAmount: message.lino});
                        break;
                    case "NINJET":
                        triggerEvent(eventEnum.ninjet, {username: user.username, linoname: user.linoname, linoAmount: message.lino});
                        break;
                }
            } else if (message.messageType === "Host") {
                triggerEvent(eventEnum.host, {username: user.username, linoname: user.linoname, hostViewers: message.amount});
                console.log(message);
            } else if (message.messageType === "Subscribe") {
                triggerEvent(eventEnum.subscribe, {username: user.username, linoname: user.linoname, subscribeDuration: message.month});
                console.log(message);
            } else if (DEBUG) {
                console.log(message.messageType);
            }
        });

        setInterval(function () {
            if (messageQueue.length > 0)
                bot.sendMessage(streamer, messageQueue.shift());
        }, 2000);
    }

    registerCommand(commandString, callback, commandLevel = commandLevelEnum.all, chatResponse = undefined) {
        const command = {}
        command.callback = callback;
        command.permission = commandLevel;
        command.autoResponse = chatResponse;

        if (commandString in commands) {
            console.error("The command " + commandString + " is already registered!");
            return;
        }

        commands[commandString] = command;
    }

    registerEvent(event, callback) {
        events[event].push(callback);
    }

    sendMessage(message) {
        sendMessage(message);
    }

    /* OBSOLETE
    getAllCommands() {
        // Use Array.join()

        let commandList = "Current available commands are: ";

        Object.keys(commands).forEach(level => {
            Object.keys(commands[level]).forEach(command => {
                commandList += command + ", ";
            });
        });

        return commandList;
    }

    getCommandsForLevel(level) {
        let commandList = "Current available commands are: ";

        Object.keys(commands[level]).forEach(command => {
            commandList += command + ", ";
        });

        return commandList;
    }
    OBSOLETE */
};