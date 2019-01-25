const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// ####// yess
const fetchVideoInfo = require('youtube-info');
const        YouTube = require('youtube-node');
const        Discord = require('discord.js');
const         search = require('youtube-search');
const         client = new Discord.Client();
const           YTDL = require('ytdl-core');
const             fs = require('fs');

var youTube = new YouTube();
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

var opts = {
    maxResults: 1
};

var server = {queue: [], names: [], now: "", latest: 0, drops: undefined, channels: undefined, drop: false, mine: ranBetween(1, 10), hardmine: ranBetween(1, 100), supermine: ranBetween(1, 1000)};

var d = new Date();
var exectime = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

function ranBetween(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function _play(connection, message, channel) {
    youTube.getById(server.queue[0].split("?v=")[1], function(error, result) {
        if (error) {
            console.log(error);
        }
        else {
            var title = result.items[0].snippet.title;

            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Queue**",
                        value: "Playing ["+title+"]("+server.queue[0]+")"
                    }
                ]
            }});

            server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

            server.now = server.queue[0];
            server.queue.shift();

            server.dispatcher.on("end", function () {
                server.now = "";
                server.names.shift();
                if(message.guild.voiceConnection) {
                    if(server.queue[0]) {
                        _play(connection, message, channel);
                    } else {
                        connection.disconnect();
                    }
                }
            });
        }
    });
}

function isYT(string) {
    if(string.indexOf("https://www.youtube.com/watch?v=") == 0) {
        return true;
    } else {
        return false;
    }
}

function drop() {
    if(server.channels) {
        var possibles = [];
        for (var i = 0; i < server.channels.length; i++) {
            var channel = server.channels[i];
            if( channel.name == "ideas" ||
                channel.name == "staff" ||
                channel.name == "announcements" ||
                channel.name == "game-announcements" ||
                channel.name == "stream" ||
                channel.name == "info" ||
                channel.type != "text"
            ) {
                continue;
            } else {
                possibles.push(channel);
            }
        }
        var targ = possibles[ranBetween(0, possibles.length-1)]
        server.drops = targ;
        var now = Number(((new Date).getTime()/1000)/60);
        var then = Number(server.latest/60);
        if((now-then) <= 5) {
            targ.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Drop**",
                        value: "Drop Event! First person to '$claim' wins!"
                    }
                ]
            }});
            server.drop = true;
            console.log("["+exectime+"] "+"Drop Event! In #"+server.drops.name);
        } else {
            console.log("["+exectime+"] "+"Drop failed! Server not active enough!");
        }
    } else {
        console.log("["+exectime+"] "+"Cannot find drops channel!");
    }
    var next = (ranBetween(10, 30)*1000*60);
    console.log("["+exectime+"] "+"Next Drop in: "+String((next/1000)/60)+" minutes!");
    setTimeout(function () {
        drop();
    }, next);
}

function check() {
    if(!fs.existsSync("./data.json")) {
        fs.writeFileSync("./data.json", "[]");
    }

    if(!fs.existsSync("./lols.json")) {
        fs.writeFileSync("./lols.json", "{\"amount\": 0}");
    }

    if(!fs.existsSync("./ideas.json")) {
        fs.writeFileSync("./ideas.json", "[]");
    }
    drop();
}

// commands

function help(channel, total) {
    var page = fs.readFileSync("./README.md");
    if(total[1]) {
        if(page.indexOf(total[1]) > -1 && total[1].indexOf("$") == -1) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Help**",
                        value: "```markdown\n"+"# $"+total[1]+"\n"+((String(page).split("### $"+total[1])[1]).split("###")[0]).substr(1)+"```"
                    }
                ]
            }});
        } else {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Help**",
                        value: "Cannot find command!\n PS: dont put '$' before the command name!"
                    }
                ]
            }});
        }
    } else {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Help**",
                    value: "```markdown\n"+String(String(page).split("### $play")[0])+"```"
                }
            ]
        }});
        channel.send({embed: {
            color: 2905571,
            description: "```markdown\n"+String(String(page).split("hour per user.\n")[1])+"```"
        }});
    }
}

function balance(total, db, message, channel) {
    if(total[1]) {
        var id = String(String(total[1]).substr(2).slice(0, -1));
        if(id[0] == "!") {
            id = id.substr(1);
        } var exists = false;
        for (var i = 0; i < db.length; i++) {
            if(String(db[i].id) == String(id)) {
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Balance**",
                            value: "<@"+db[i].id+">'s balance: $"+db[i].balance
                        }
                    ]
                }});
                exists = true;
            }
        }
        if(!exists) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Balance**",
                        value: "User hasn't sent any messages!"
                    }
                ]
            }});
        }
    } else {
        for (var i = 0; i < db.length; i++) {
            if(db[i].id == message.member.user.id) {
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Balance**",
                            value: "<@"+message.member.user.id+">'s balance: $"+db[i].balance
                        }
                    ]
                }});
            }
        }
    }
}

function leaderboard(db, channel) {
    var bals = {};
    for (var i = 0; i < db.length; i++) {
        bals[db[i].username] = db[i].balance;
    }
    var leaders = Object.keys(bals).sort(function(a,b){return bals[b]-bals[a]});
    var mark = "```markdown\n";
    var leng = leaders.length;
    if(leng > 10) { leng = 10; }
    for (var i = 0; i < leng; i++) {
        mark += (i+1)+". "+leaders[i];
        for (var j = 0; j < db.length; j++) {
            if(db[j].username == leaders[i]) {
                mark += " - $"+db[j].balance+"\n";
            }
        }
    }
    mark += "```";
    channel.send({embed: {
        color: 2905571,
        fields: [
            {
                name: "**Leaderboard**",
                value: mark
            }
        ]
    }});
}

function levelLeaderBoard(db, channel) {
    var bals = {};
    for (var i = 0; i < db.length; i++) {
        bals[db[i].username] = db[i].level;
    }
    var leaders = Object.keys(bals).sort(function(a,b){return bals[b]-bals[a]});
    var mark = "```markdown\n";
    var leng = leaders.length;
    if(leng > 10) { leng = 10; }
    for (var i = 0; i < leng; i++) {
        mark += (i+1)+". "+leaders[i];
        for (var j = 0; j < db.length; j++) {
            if(db[j].username == leaders[i]) {
                mark += " - lvl: "+db[j].level+"\n";
            }
        }
    }
    mark += "```";
    channel.send({embed: {
        color: 2905571,
        fields: [
            {
                name: "**Level Leaderboard**",
                value: mark
            }
        ]
    }});
}

function payme(db, message, channel) {
    for (var i = 0; i < db.length; i++) {
        if(db[i].id == message.member.user.id) {
            if( ( ( ( ( Date.now()/1000 ) - db[i].last ) / 60 ) / 60) >= 1) {
                db[i].last = Date.now()/1000;
                var inc = ranBetween(10, 50);
                db[i].balance += inc;
                fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Balance**",
                            value: "<@"+message.member.user.id+"> you claimed your hourly pay! Heres $"+inc+"!"
                        }
                    ]
                }});
            } else {
                var time = String( ( ( ( ( Date.now()/1000 ) - db[i].last ) / 60 ) / 60)*100);
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Balance**",
                            value: "Sorry, you've already claimed your hourly pay! please wait "+(60 - Math.round( ( ( Date.now()/1000 ) - db[i].last ) / 60 ))+"m."
                        }
                    ]
                }});
            }
        }
    }
}

function play(channel, message, total) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Please provide youtube link/search!"
                }
            ]
        }});
        return;
    }

    if(!message.member.voiceChannel) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Please join a voice channel!"
                }
            ]
        }});
        return;
    }

    if(isYT(String(message.content.split("$play ")[1]))) {
        server.queue.push(String(message.content.split("$play ")[1]));
        youTube.getById(server.queue[0].split("?v=")[1], function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                var title = result.items[0].snippet.title;
                server.names.push(title);

                if(!message.guild.voiceConnection) {
                    message.member.voiceChannel.join().then(function (connection) {
                        _play(connection, message, channel);
                    });
                } else {
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Queue**",
                                value: "Added ["+title+"]("+String(message.content.split("$play ")[1])+") to queue!"
                            }
                        ]
                    }});
                }
            }
        });
        return;
    } else if(String(message.content.split("$play ")[1]).indexOf("playlist?") != -1) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Cannot play playlists!"
                }
            ]
        }});
        return;
    }

    search(String(message.content.split("$play ")[1]), opts, function(err, results) {
        if(err) return channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Could not find song!"
                }
            ]
        }});

        if(String(results[0].link).indexOf("playlist?") != -1) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Queue**",
                        value: "Cannnot play playlists!"
                    }
                ]
            }});
            return;
        } else {
            server.queue.push(results[0].link);
            server.names.push(results[0].title);

            if(!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then(function (connection) {
                    _play(connection, message, channel);
                });
            } else {
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Queue**",
                            value: "Added ["+results[0].title+"]("+results[0].link+") to queue!"
                        }
                    ]
                }});
            }
        }
    });
}

function skip(channel) {
    if(server.dispatcher) {
        server.dispatcher.end();
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Skipped Song!"
                }
            ]
        }});
    } else {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "No song to skip!"
                }
            ]
        }});
    }
}

function stop(message, channel) {
    if(message.guild.voiceConnection) {
        server.queue = [];
        server.names = [];
        message.guild.voiceConnection.disconnect();
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Stopped Playing Songs!"
                }
            ]
        }});
    } else {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Not Playing Anthing!"
                }
            ]
        }});
    }
}

function add(message, channel, total) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Please provide youtube link/search!"
                }
            ]
        }});
        return;
    }

    if(!message.member.voiceChannel) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Please join a voice channel!"
                }
            ]
        }});
        return;
    }

    if(!message.guild.voiceConnection) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Please start playing to add to the queue!"
                }
            ]
        }});
        return;
    }

    if(isYT(String(message.content.split("$add ")[1]))) {
        server.queue.push(String(message.content.split("$add ")[1]));
        youTube.getById(server.queue[0].split("?v=")[1], function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                var title = result.items[0].snippet.title;
                server.names.push(title);

                if(!message.guild.voiceConnection) {
                    message.member.voiceChannel.join().then(function (connection) {
                        _play(connection, message, channel);
                    });
                } else {
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Queue**",
                                value: "Added ["+title+"]("+String(message.content.split("$play ")[1])+") to queue!"
                            }
                        ]
                    }});
                }
            }
        });
        return;
    } else if(String(message.content.split("$add ")[1]).indexOf("playlist?") != -1) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Cannot play playlists!"
                }
            ]
        }});
        return;
    }

    search(String(message.content.split("$add ")[1]), opts, function(err, results) {
        if(err) return channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "Could not find song!"
                }
            ]
        }});

        if(String(results[0].link).indexOf("playlist?") != -1) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Queue**",
                        value: "Cannnot play playlists!"
                    }
                ]
            }});
            return;
        } else {
            server.queue.push(results[0].link);
            server.names.push(results[0].title);

            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Queue**",
                        value: "Added ["+results[0].title+"]("+results[0].link+") to queue!"
                    }
                ]
            }});
        }
    });
}

function queue(channel) {
    if(server.now == "" || server.queue == []) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: "No songs in queue!"
                }
            ]
        }});
    } else {
        var todisp = "1. ["+server.names[0]+"]("+server.now+")\n";
        for (var i = 0; i < server.queue.length; i++) {
            todisp += String((i+2)+". ["+server.names[i+1]+"]("+server.queue[i]+")\n");
        }
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Queue**",
                    value: todisp
                }
            ]
        }});
    }
}

function pause(message, channel) {
    if(!message.member.voiceChannel) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Music**",
                    value: "Please join a voice channel!"
                }
            ]
        }});
        return;
    }

    if(!message.guild.voiceConnection) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Music**",
                    value: "Please start playing to add to the queue!"
                }
            ]
        }});
        return;
    }
    server.dispatcher.pause();
    channel.send({embed: {
        color: 2905571,
        fields: [
            {
                name: "**Music**",
                value: "Paused!"
            }
        ]
    }});
}

function resume(message, channel) {
    if(!message.member.voiceChannel) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Music**",
                    value: "Please join a voice channel!"
                }
            ]
        }});
        return;
    }

    if(!message.guild.voiceConnection) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Music**",
                    value: "Please start playing to add to the queue!"
                }
            ]
        }});
        return;
    }
    server.dispatcher.resume();
    channel.send({embed: {
        color: 2905571,
        fields: [
            {
                name: "**Music**",
                value: "Resumed!"
            }
        ]
    }});
}

function pay(channel, total, db, message) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Pay**",
                    value: "Please provide a user to pay!"
                }
            ]
        }});
    } else {
        if(!total[2] || total[2].indexOf("-") == 0) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Pay**",
                        value: "Please provide an amount to pay!"
                    }
                ]
            }});
        } else {
            var target = total[1];
            var amount = Number(total[2]);
            for (var i = 0; i < db.length; i++) {
                if(String(db[i].id) == String(message.member.user.id)) {
                    if(db[i].balance >= amount) {
                        for (var j = 0; j < db.length; j++) {
                            if(String(db[j].id) == String(target).substr(3).split(">")[0] || String(db[j].id) == String(target).substr(2).split(">")[0]) {
                                db[j].balance += amount;
                                db[i].balance -= amount;
                                fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                                channel.send({embed: {
                                    color: 2905571,
                                    fields: [
                                        {
                                            name: "**Pay**",
                                            value: "Sent "+amount+" -> <@"+db[j].id+">!"
                                        }
                                    ]
                                }});
                                return;
                            }
                        }
                    } else {
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Pay**",
                                    value: "You down have enough money in your balance!"
                                }
                            ]
                        }});
                        return;
                    }
                }
            }
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Pay**",
                        value: "Couldn't find user!"
                    }
                ]
            }});
        }
    }
}

function idea(message, channel) {
    var tag = message.member.user.tag;
    if(!message.content.split("$idea ")[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Ideas**",
                    value: "Please provide a message explaining your idea!"
                }
            ]
        }});
    } else {
        var message = message.content.split("$idea ")[1];
        var cideas = JSON.parse(String(fs.readFileSync("./ideas.json")));
        cideas.push({author: String(tag), message: message});
        fs.writeFileSync("./ideas.json", JSON.stringify(cideas, null, 4));
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Ideas**",
                    value: "Your idea has been submitted! Thank you :heart:"
                }
            ]
        }});
    }
}

function mine(channel, db, message, total) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Mining**",
                    value: "<@"+message.member.user.id+"> Please provide a guess to mine!"
                }
            ]
        }});
    } else {
        if(Number(total[1]) == Number(server.mine)) {
            for (var i = 0; i < db.length; i++) {
                if(db[i].id == message.member.user.id) {
                    db[i].balance += 1;
                    fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Mining**",
                                value: "<@"+message.member.user.id+"> You guessed right! Heres $1!"
                            }
                        ]
                    }});
                    console.log("["+exectime+"] "+message.member.user.tag+" : "+"+1 for $mine");
                }
            }
            server.mine = ranBetween(1, 10);
        } else {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Mining**",
                        value: "<@"+message.member.user.id+"> You guessed wrong!"
                    }
                ]
            }});
        }
    }
}

function hardmine(channel, db, message, total) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Mining**",
                    value: "<@"+message.member.user.id+"> Please provide a guess to mine!"
                }
            ]
        }});
    } else {
        if(Number(total[1]) == Number(server.hardmine)) {
            for (var i = 0; i < db.length; i++) {
                if(db[i].id == message.member.user.id) {
                    db[i].balance += 10;
                    fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Mining**",
                                value: "<@"+message.member.user.id+"> You guessed right! Heres $10!"
                            }
                        ]
                    }});
                    console.log("["+exectime+"] "+message.member.user.tag+" : "+"+10 for $hardmine");
                }
            }
            server.hardmine = ranBetween(1, 100);
        } else {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Mining**",
                        value: "<@"+message.member.user.id+"> You guessed wrong!"
                    }
                ]
            }});
        }
    }
}

function supermine(channel, db, message, total) {
    if(!total[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Mining**",
                    value: "<@"+message.member.user.id+"> Please provide a guess to mine!"
                }
            ]
        }});
    } else {
        if(Number(total[1]) == Number(server.supermine)) {
            for (var i = 0; i < db.length; i++) {
                if(db[i].id == message.member.user.id) {
                    db[i].balance += 100;
                    fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Mining**",
                                value: "<@"+message.member.user.id+"> You guessed right! Heres $100!"
                            }
                        ]
                    }});
                    console.log("["+exectime+"] "+message.member.user.tag+" : "+"+100 for $hardmine");
                }
            }
            server.hardmine = ranBetween(1, 1000);
        } else {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Mining**",
                        value: "<@"+message.member.user.id+"> You guessed wrong!"
                    }
                ]
            }});
        }
    }
}

function coin(total, message, db, channel) {
    if(!total[1] || !total[2]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Coin Flip**",
                    value: "Please provide 'heads' or 'tails' and an amount to gamble!"
                }
            ]
        }});
    } else if(!(total[1] == "heads" || total[1] == "tails" || Number(total[2]) == Number)) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Coin Flip**",
                    value: "Please pick heads or tails and provide and amount!"
                }
            ]
        }});
    } else {
        var win = ranBetween(0, 1);
        if(win == 0) {
            for (var i = 0; i < db.length; i++) {
                if(db[i].id == message.member.user.id) {
                    if(Number(db[i].balance) >= Number(total[2]) && 50 >= Number(total[2])) {
                        db[i].balance -= Number(total[2]);
                        fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Coin Flip**",
                                    value: "<@"+db[i].id+"> You lost $"+Number(total[2])+"!"
                                }
                            ]
                        }});
                        console.log("["+exectime+"] "+message.member.user.tag+" : -"+Number(total[2])+" for $coin");
                    } else {
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Coin Flip**",
                                    value: "<@"+db[i].id+"> You do not have enough money to gamble!"
                                }
                            ]
                        }});
                    }
                }
            }
        } else {
            for (var i = 0; i < db.length; i++) {
                if(db[i].id == message.member.user.id) {
                    if(Number(db[i].balance) >= Number(total[2]) && 50 >= Number(total[2])) {
                        db[i].balance += Number(total[2]);
                        fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Coin Flip**",
                                    value: "<@"+db[i].id+"> You won $"+Number(total[2])+"!"
                                }
                            ]
                        }});
                        console.log("["+exectime+"] "+message.member.user.tag+" : +"+Number(total[2])+" for $coin");
                    } else {
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Coin Flip**",
                                    value: "<@"+db[i].id+"> You do not have enough money to gamble!"
                                }
                            ]
                        }});
                    }
                }
            }
        }
    }
}

function report(message, channel) {
    var tag = message.member.user.tag;
    if(!message.content.split("$report ")[1]) {
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Reports**",
                    value: "Please provide a message explaining your report!"
                }
            ]
        }});
    } else {
        var message = message.content.split("$idea ")[1];
        var cideas = JSON.parse(String(fs.readFileSync("./ideas.json")));
        cideas.push({author: String(tag), message: message, type: "report"});
        fs.writeFileSync("./ideas.json", JSON.stringify(cideas, null, 4));
        channel.send({embed: {
            color: 2905571,
            fields: [
                {
                    name: "**Reports**",
                    value: "Your report has been submitted! Thank you :heart:"
                }
            ]
        }});
    }
}

function level(db, message, channel) {
    for (var i = 0; i < db.length; i++) {
        if(db[i].id == message.member.user.id) {
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**Levels**",
                        value: "<@"+message.member.user.id+"> your level is **"+db[i].level+"**! With **"+db[i].xp+"** xp out of **"+String(db[i].level*100 || 50)+"**!"
                    }
                ]
            }});
        }
    }
}

// client handlers

client.on('ready', () => {
    console.log("["+exectime+"] "+'bot ready!');
    check();
});

client.on("guildMemberAdd", function (member) {
    var role = member.guild.roles.find('name', "Peasant");
    member.addRole(role);
});

client.on('message', message => {
    var total = fs.readFileSync("./data.json");
    var db = JSON.parse(total);

    d = new Date();
    exectime = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
    if(message.member) {
        var channel = message.channel;
        server.channels = message.guild.channels.array();
        if(message.content == "$claim") {
            if(server.drops && channel.name == server.drops.name) {
                if(server.drop) {
                    server.drop = false;
                    for (var i = 0; i < db.length; i++) {
                        if(db[i].id == message.member.user.id) {
                            var inc = ranBetween(10, 50);
                            db[i].balance += inc;
                            fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                            channel.send({embed: {
                                color: 2905571,
                                fields: [
                                    {
                                        name: "**Drop**",
                                        value: "<@"+message.member.user.id+"> you claimed the drop! Heres $"+inc+"!"
                                    }
                                ]
                            }});
                            console.log("["+exectime+"] "+message.member.user.tag+" : "+"$claim");
                        }
                    }
                } else {
                    channel.send({embed: {
                        color: 2905571,
                        fields: [
                            {
                                name: "**Drop**",
                                value: "<@"+message.member.user.id+"> there is nothing to claim!"
                            }
                        ]
                    }});
                    console.log("["+exectime+"] "+message.member.user.tag+" : "+"$claim");
                }
            } else {
                channel.send({embed: {
                    color: 2905571,
                    fields: [
                        {
                            name: "**Drop**",
                            value: "<@"+message.member.user.id+"> claim has timed out!"
                        }
                    ]
                }});
            }
        }

        server.latest = (new Date).getTime()/1000;

        if(message.member.user.username && message.content.toLowerCase().indexOf("lol") > -1) {
            var lols = JSON.parse(String(fs.readFileSync("./lols.json")));
            if(!lols[message.member.user.username]) {
                lols[message.member.user.username] = 0;
            }
            lols[message.member.user.username] += occurrences(message.content.toLowerCase(), "lol");
            fs.writeFileSync("./lols.json", JSON.stringify(lols, null, 4));
            channel.send({embed: {
                color: 2905571,
                fields: [
                    {
                        name: "**lols**",
                        value: "<@"+message.member.user.id+"> said 'lol', +"+occurrences(message.content.toLowerCase(), "lol")+" lols. Total: "+(lols[message.member.user.username])
                    }
                ]
            }});
        } else if(message.member.user.username == "alsooop" && message.content.toLowerCase() == "h") {
            channel.send("https://cdn.discordapp.com/attachments/329921522711920652/438299682054209538/image.jpg");
        }

        if(total.indexOf(message.member.user.id) == -1 && message.member.user.bot == false) {
            db.push({username: message.member.user.username, id: message.member.user.id, balance: 0, last: 0, latest: 0, level: 0, xp: 0});
            fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
        }

        for (var i = 0; i < db.length; i++) {
            if(db[i].id == message.member.user.id) {
                if(((new Date).getTime()/1000)-db[i].latest >= 60) {
                    db[i].latest = ((new Date).getTime()/1000);
                    db[i].balance += ranBetween(1, 10);
                    db[i].xp += ranBetween(1, 10);
                    if(db[i].level == 0 && db[i].xp >= 50) {
                        db[i].level += 1;
                        db[i].xp -= 50;
                        var role = message.member.guild.roles.find('name', "Squire");
                        message.member.addRole(role);
                        var role = message.member.guild.roles.find('name', "Peasant");
                        message.member.removeRole(role);
                        console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to Squire");
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Levels**",
                                    value: "<@"+message.member.user.id+"> you leveled up to "+db[i].level+"!"
                                }
                            ]
                        }});
                        console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to "+db[i].level+"!");
                    } else if(db[i].level != 0 && db[i].xp >= (db[i].level*100)) {
                        db[i].xp = db[i].xp - (db[i].level*100);
                        db[i].level += 1;
                        if(db[i].level == 2) {
                            var role = message.member.guild.roles.find('name', "Knight");
                            message.member.addRole(role);
                            var role = message.member.guild.roles.find('name', "Squire");
                            message.member.removeRole(role);
                            console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to Knight");
                        } else if(db[i].level == 5) {
                            var role = message.member.guild.roles.find('name', "Baron");
                            message.member.addRole(role);
                            var role = message.member.guild.roles.find('name', "Knight");
                            message.member.removeRole(role);
                            console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to Baron");
                        } else if(db[i].level == 10) {
                            var role = message.member.guild.roles.find('name', "Duke");
                            message.member.addRole(role);
                            var role = message.member.guild.roles.find('name', "Baron");
                            message.member.removeRole(role);
                            console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to Duke");
                        } else if(db[i].level == 15) {
                            var role = message.member.guild.roles.find('name', "King/Queen");
                            message.member.addRole(role);
                            var role = message.member.guild.roles.find('name', "Duke");
                            message.member.removeRole(role);
                            console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to King/Queen");
                        } else if(db[i].level == 20) {
                            var role = message.member.guild.roles.find('name', "Emperor/Empress");
                            message.member.addRole(role);
                            var role = message.member.guild.roles.find('name', "King/Queen");
                            message.member.removeRole(role);
                            console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to Emperor/Empress");
                        }
                        channel.send({embed: {
                            color: 2905571,
                            fields: [
                                {
                                    name: "**Levels**",
                                    value: "<@"+message.member.user.id+"> you leveled up to "+db[i].level+"!"
                                }
                            ]
                        }});
                        console.log("["+exectime+"] "+message.member.user.tag+" : leveled up to "+db[i].level+"!");
                    }
                    fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
                }
            }
        }

        // command handlers

        if(message.content[0] == "$") {
            var total   = message.content.substr(1).split(" ");

            var command = message.content.substr(1);
                command = command.split(" ")[0];
                command = command.toLowerCase();

            if(command == "ping") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $ping");
                channel.send("Pong!");
            } else if(command == "help") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $help");
                help(channel, total);
            } else if(command == "balance" || command == "bal") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $balance");
                balance(total, db, message, channel);
            } else if(command == "leaderboard" || command == "lboard") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $leaderboard");
                leaderboard(db, channel);
            } else if(command == "payme") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $payme");
                payme(db, message, channel);
            /*} else if(command == "play") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $play");
                play(channel, message, total);
            } else if(command == "skip") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $skip");
                skip(channel);
            } else if(command == "stop") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $stop");
                stop(message, channel);
            } else if(command == "add") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $add");
                add(message, channel, total);
            } else if(command == "queue") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $queue");
                queue(channel);
            } else if(command == "pause") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $pause");
                pause(message, channel);
            } else if(command == "resume") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $resume");
                resume(message, channel);*/
            } else if(command == "pay") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $pay");
                pay(channel, total, db, message);
            } else if(command == "idea") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $idea");
                idea(message, channel);
            } else if(command == "mine") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $mine");
                mine(channel, db, message, total);
            } else if(command == "hardmine") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $hardmine");
                hardmine(channel, db, message, total);
            } else if(command == "supermine") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $supermine");
                supermine(channel, db, message, total);
            } else if(command == "coin") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $coin");
                coin(total, message, db, channel);
            } else if(command == "report") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $report");
                report(message, channel)
            } else if(command == "level") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $level");
                level(db, message, channel);
            } else if(command == "levels") {
                console.log("["+exectime+"] "+message.member.user.tag+" : $levels");
                levelLeaderBoard(db, channel);
            }
        }
        fs.writeFileSync("./data.json", JSON.stringify(db, null, 4));
    }
});

client.login(String(process.env.TOKEN)); // no looky looky
