const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMessage = require('./main/js/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./main/js/users');


const app=express();
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,'main')));


io.on('connection',socket=>{
    console.log('New Connection');
    socket.on('joinRoom',({username,room}) =>{
        const user=userJoin(socket.id,username,room);

        socket.join(user.room)
        
        socket.emit('message',formatMessage('Admin','Welcome to Chat App!!'));

        //Notify when user connects   
        socket.broadcast.to(user.room).emit('message',formatMessage('Admin',`${user.username} has joined the chat`));


        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(user.room)
        });
    });

   

    socket.on('chatMessage',(msg)=>{

        const user=getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

     //Notify when user disconnects

     socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage('Admin',`${user.username} has left the chat`));
        

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users: getRoomUsers(user.room)
            });
        }
    })


})

server.listen(3000, ()=>console.log('Listening to requests'));

