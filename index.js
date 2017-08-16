const mongoose = require('mongoose')
const Discord = require('discord.js');

const client = new Discord.Client()
const config = require('./config.json')
const addme  = require("./addme.js")

client.on('ready',()=> console.log("Bot started"))

client.on('message',message=>{
	if(message.content.startsWith("!addme")) addme(message.content,message.author.id,true,message)
	if(message.content.startsWith("!updateme")) addme(message.content,message.author.id,false,message)
	
})

client.login(config.botId)