const fetch = require('isomorphic-fetch')
const mongoose = require('mongoose')
const request  = require('request')
const roles    = require('./roles.js')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/typists')
let db = mongoose.connection

//Check connection
db.once('open',()=>console.log('connectod to DB'))

//Check for db errors
db.on('error',()=>console.log('error'))

const typistSchema = mongoose.Schema({
	typistId: String,
	roleId: String,
	typeracer: String
})

const Typist = mongoose.model("Typist",typistSchema)

module.exports = (addme,author,add,message)=>{
  
  const member = message.guild.members.get(author)
  let arrOfAddMe = addme.split(" ")
  let username = arrOfAddMe[1]
  
  if(Typist.find({typistId: author}).length !==0) return message.reply("You already made an account")
  if(Typist.find({typeracer: username}).length !==0) return message.reply("That useranme is already used")

  if(arrOfAddMe.length === 2){
   
   request.get(`http://data.typeracer.com/users?id=tr:${username}`,(error,response,body)=>{

   		if(error || response.statusCode !== 200 || !body){
           console.log("the account didn't exist")
           console.log(error)
           console.log(response.statusCode)
           console.log(body)
   		}

   		else{
   			fetch(`http://data.typeracer.com/users?id=tr:${username}`)
   			.then(res=>  res.json())
   			.then(data=>{ 
   					if(data.tstats.recentScores.length>9){

                       request.get(`http://www.typeracerdata.com/import?username=${username}`)
                       fetch(`http://typeracerdata.com/api?username=${username}`)
                       .then(res => res.json())
                       .then(data=>{

                       		let speed = 0
                       		if(data.account.wpm_bestlast10!=0) speed = Math.floor(data.account.wpm_bestlast10)
                       			else speed = Math.floor(data.account.wpm_last10)
                       			let rol =	roles.filter(rolespd=> rolespd.spdMin<=speed&&rolespd.spdMx>=speed)
                       			if(rol.length>0){

                       			console.log(rol[0].name)
                       			let typist = new Typist
                       			typist.typeracer = username
                       			typist.typistId = author
                       			typist.roleId = rol[0].id

                       			member.addRole(typist.roleId)


                       			if(add){
                       			typist.save(function (err, data) {
									  if (err) return console.error(err);
									  message.channel.send("it worked")
									})
                       		}

                       			else{
                       				if(Typist.findOne({typistId:typist.typistId}).roleId != typist.roleId){
                                removeRole(Typist.findOne({typistId:typist.typistId}).roleId)
                       					message.reply("you improved")
                       				}
                       				else{
                       					message.reply("you didn't improve")
                       				}

                       				Typist.update({typeracer:author},typist,function (err, data) {
									  if (err) return console.error(err);
									  message.channel.send("it is update")
									})
                       			}
                       		}
                       		else message.reply("there was a probelem please contact an administrotr")
                            }
                       	)

   					}

   					else{
   						message.reply("you need more than 10 races")
   					}
   				}
   				)
   			.catch(error=>console.log(error))
   		}

   })

  }

  else{
  	message.reply("You didn't include your username from typeracer")
  }
}
