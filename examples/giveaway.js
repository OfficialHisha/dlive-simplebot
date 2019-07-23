const SB = require("../simpleBot");
const bot = new SB("../accounts.json", "me", "bot");

participants = [];

giveawayInProgress = false;

bot.registerCommand("!startgiveaway", startGiveaway, bot.commandLevel.streamer);
bot.registerCommand("!enter", enterGiveaway, bot.commandLevel.all);
bot.registerCommand("!endgiveaway", endGiveaway, bot.commandLevel.streamer);

function startGiveaway(username) {
    if (giveawayInProgress) {
        bot.sendMessage("A giveaway is already in progress, use !endgiveaway to end the current giveaway before starting a new one");
        return;
    }

    console.log(username + " started a giveaway");
    bot.sendMessage("A giveaway has just started! Use !enter to participate");
    giveawayInProgress = true;
    participants = [];
}

function endGiveaway(username) {
    if (!giveawayInProgress) {
        bot.sendMessage(username + " there is no giveaway active at the moment, use !startgiveaway to start a new one");
        return;
    }
    giveawayInProgress = false;

    console.log(username + " ended the giveaway");

    if (participants.length === 0) {
        bot.sendMessage("The giveaway has ended but noone signed up, so no winner this time");
        return;
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    bot.sendMessage("The giveaway has ended, the winner is " + winner + ". GG");
    participants = [];
}

function enterGiveaway(username) {
    if (!giveawayInProgress) {
        bot.sendMessage(username + " there is no giveaway in progress at the moment");
        return;
    }

    if (participants.includes(username))
        bot.sendMessage(username + " you are already participating in this giveaway");
    else {
        console.log(username + " entered the giveaway");
        bot.sendMessage("Good luck " + username);
        participants.push(username);
        console.log("Current participants are " + participants);
    }
}