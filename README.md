# FiveM Discord Bot

This branch includes the node_modules which is used to run it. This isn't best practice to include however the code the bot is based off is broken in later versions of the dependencies.
I stress there could be exploits, bugs and inefficiencies by running the bot with this older code.

### Features
- Use !status then copy the message ID and put into config to auto update every minute.
- Tickets put channel IDs for ticket log and transcripts into config to have the bot post in the correct channel.

### Commands
 - ~status | Posts server status to channel (Anyone can use)
 - ~giveaway Role-ID | E.g. !giveaway 112844187807805440 (Needs a specified Discord role)
 - ~tm | Sends ticket embed for members to react to. (Needs a specified Discord role)

## Setup
* Install NodeJS
* Download the source code
* Edit the config.json and js files inside the bot folder
* Open your terminal, go to bot root folder using cd command and install the dependencies using npm install
* To start use the following command in your terminal:
  * `node start init.js`
* If you want to use watch to keep the bot online if it crashes use the following command:
  * `node start init.js --watch --ignore-watch="tickets .node-xmlhttprequest-sync-*"`

# This is a old bot so no support will be provided. Feel free to fork or request merges.