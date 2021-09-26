const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const Filter = require('bad-words')
const e = require('express')
const {generateMessages , locMessages} = require("./../public/js/msgs")
const { addUser , removeUser , getUser , getUserInRoom } = require("./../public/js/Users")



const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000



io.on('connection', (socket)=>{
    

    socket.on('join',({username , room }) =>{
        const {error , user} = addUser({id : socket.id , username , room })
        if(error){
            return error;
        }
        socket.join(room)
      //  console.log(username)
        io.to(room).emit('roomdata' , {
            room , users : getUserInRoom(room)
        })
        socket.emit('sent',generateMessages(username , `Welcome ${username}`))
        socket.broadcast.to(room).emit('sent', generateMessages(username , `${username} entered room`))
       
    })



    socket.on('message', (message, callback) =>{
        const filter = new Filter()
        console.log(message)
        if(filter.isProfane(message)){
            return callback("Profanity not allowed")
        }
        const user = getUser(socket.id);
        if(user != undefined){
            io.to(user.room).emit('sent',generateMessages(user.username , message))
        }else{
            callback('Login again with some other name')
        }
        
       callback();
    })
    socket.on('locshare', (coords , callback) =>{
        const str = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        const user = getUser(socket.id);
        if(user != undefined){
            io.to(user.room).emit('sendloc' ,locMessages(user.username , str))
        }
        callback()
    })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id);
        if(user != null){
            io.to(user.room).emit('sent' , generateMessages(user.username, `${user.username} left the chat`))
        }
    })
})



app.use(express.static(path.join(__dirname,'../public')))

server.listen(port , ()=>{
    console.log("Server started at port" , port)
})