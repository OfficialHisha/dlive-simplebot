const SB = require("../simpleBot");
const bot = new SB("../accounts.json", "me", "bot");

participants = [];

giveawayInProgress = false;

let giveawayAnnouncement;

bot.registerCommand("!startgiveaway", startGiveaway, bot.commandLevel.streamer);
bot.registerCommand("!enter", enterGiveaway, bot.commandLevel.follower);
bot.registerCommand("!giveaway", showGiveaway, bot.commandLevel.all);
bot.registerCommand("!endgiveaway", endGiveaway, bot.commandLevel.streamer);
bot.registerCommand("!stopgiveaway", endGiveaway, bot.commandLevel.streamer);
bot.registerCommand("!reroll", reroll, bot.commandLevel.streamer);

function startGiveaway(parameters) {
    if (giveawayInProgress) {
        bot.sendMessage("A giveaway is already in progress, use !endgiveaway to end the current giveaway before starting a new one");
        return;
    }

    console.log(parameters.username + " started a giveaway");
    bot.sendMessage("A giveaway has just started! Use !enter to participate");
    giveawayInProgress = true;
    participants = [];

    giveawayAnnouncement = setInterval(() => {
        bot.sendMessage("There is currently a giveaway in progress, type !enter to enter the giveaway!");
    }, 600000);
}

function showGiveaway() {
    if (giveawayInProgress) {
        bot.sendMessage("There is currently a giveaway in progress, type !enter to enter the giveaway!");
    }
    else {
        bot.sendMessage("There is not a giveaway in progress currently");
    }
}

function endGiveaway(parameters) {
    if (!giveawayInProgress) {
        bot.sendMessage(parameters.username + " there is no giveaway active at the moment, use !startgiveaway to start a new one");
        return;
    }
    clearInterval(giveawayAnnouncement);
    giveawayInProgress = false;

    console.log(parameters.username + " ended the giveaway");

    if (participants.length === 0) {
        bot.sendMessage("The giveaway has ended but noone signed up, so no winner this time");
        return;
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    bot.sendMessage("The giveaway has ended, the winner is " + winner + ". GG");

    var index = participants.indexOf(winner);
    if (index > -1)
        participants.splice(index, 1);
}

function reroll() {
    if (participants.length === 0) {
        bot.sendMessage(parameters.username + " There are no more participants, cannot reroll");
        return;
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    bot.sendMessage("The new winner is " + winner + ". GG");

    var index = participants.indexOf(winner);
    if (index > -1)
        participants.splice(index, 1);
}

function enterGiveaway(parameters) {
    if (!giveawayInProgress) {
        bot.sendMessage(parameters.username + " there is no giveaway in progress at the moment");
        return;
    }

    if (participants.includes(parameters.username))
        bot.sendMessage(parameters.username + " you are already participating in this giveaway");
    else {
        console.log(parameters.username + " entered the giveaway");
        bot.sendMessage("Good luck " + parameters.username);
        participants.push(parameters.username);
        console.log("Current participants are " + participants);
    }
}