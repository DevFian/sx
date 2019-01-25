# Ecio-Discord-Bot
Economy based discord bot.
## Commands
### $ping
Arguments: None
Aliases: None

Description: Responds with "Pong!", used to check whether the bot is online.
### $help
Arguments: [command]
Aliases: None

Description: Shows all commands and bot info. Optionally you can parse a certain command to get a detailed description.
### $balance
Arguments: [user]
Aliases: bal

Description: Shows balance of target user (by default the sender). Can also be called with "bal".
### $leaderboard
Arguments: None
Aliases: lboard

Description: Shows a numbered list of the top 10 people with the highest balances. Can also be called with "lboard"
### $payme
Arguments: None
Aliases: None

Description: Pays user random amount of money between 10-50. Command can only be called once every hour per user.
### $play
Arguments: <youtube url/search>
Aliases: None

Description: Plays youtube url/search in voice chat. User must be connected to voice chat to execute.
### $skip
Arguments: None
Aliases: None

Description: Skips current playing song in voicechat.
### $stop
Arguments: None
Aliases: None

Description: Stops playing music in voicechat and disconnects bot.
### $add
Arguments: <youtube url/search>
Aliases: None

Description: Adds song to queue.
### $queue
Arguments: None
Aliases: None

Description: Shows list of songs in queue.
### $pause
Arguments: None
Aliases: None

Description: Pauses the current playing song.
### $resume
Arguments: None
Aliases: None

Description: Resumes paused currently playing song.
### $pay
Arguments: <user> <amount>
Aliases: None

Description: Sends <amount> of $ to target user. Takes money out of your account.
### $idea
Arguments: <message>
Aliases: None

Description: Sends <message> as an idea to the bots admin.
### $mine
Arguments: <guess>
Aliases: None

Description: Allows you to guess the current mining number. Guesses range are 1 to 10, winning will give you $1. Losing will just feel bad.
### $hardmine
Arguments: <guess>
Aliases: None

Description: Same as mine but guesses are out of 100 and winning will give $10.
### $supermine
Arguments: <guess>
Aliases: None

Description: Same as mine but guesses are out of 1000 and winning will give $100.
### $coin
Arguments: <heads/tails> <amount>
Aliases: None

Description: 50/50 chance of winning/losing. You will gain the amount you gambled if you win but loose it if you loose.
### $report
Arguments: <message>
Aliases: None

Description: Report a message to an admin.
### $level
Arguments: None
Aliases: None

Description: Displays current level and xp.
