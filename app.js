var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
var People = require('./people.js');
var peoples = [];
server.listen(process.env.PORT || 3000);

var FLAG_INVITE = "invite";
var FLAG_ACCEPT = "accept";
var FLAG_DECLINE = "decline";
var FLAG_MOVE = "move";
var FLAG_READY = "ready";
var FLAG_QUIT = "quit";

//CONNECT
io.sockets.on('connection', function (client) {

    console.log("1 Connected " + client.id);

//JOIN
    client.on('join', function(name) {
     console.log("join "+ name);
    var roomID = null;
    var info = new People(name,client.id,roomID,false);
    peoples.push(info);
    client.emit('info',{info:info});
    io.sockets.emit('update-peoples',{peoples:peoples});
  });


//GET LIST PEOPPLE
    client.on('update-peoples', function(){
       client.emit('update-peoples',{peoples:peoples});
    });


//EVENT

//p1: pp who send data
//p2: the other pp
//Event invite : data -> flag, p1, p2
//Event accept: data -> flag, p1, p2

   client.on('event',function(data){
       var obj = JSON.parse(data);
       console.log("event "+ data.flag);

       switch(data.flag){
         case FLAG_INVITE:
                        //Player who invite will join room first and save info
                        //join room
                        client.join(client.id+"");

                        //update info list
                        peoples[indexofpeople(client.id)].Joined(client.id+"");

                        //update myinfo data
                        obj.p1.roomID = client.id;

                        //send info to people want to invite
                        client.broadcast.to(obj.p2.id).emit('event', JSON.stringify(obj));
                        break;
         case FLAG_ACCEPT:
                        //Player who will accept the invitation of some one

                        //join room
                        client.join(obj.p2.roomID+"");

                        //update info list
                        peoples[indexofpeople(client.id)].Joined(obj.p2.roomID+"");

                        //update p2 data
                        obj.p1.roomID = obj.p2.roomID;

                        //send info to 2 people in room
                        io.to(obj.p1.roomID).emit('event', JSON.stringify(obj));
                        break;
         case FLAG_DECLINE:
                        //Cancel invitation
                        //emit to people who invite it
                        client.broadcast.to(obj.p1.id).emit('event',JSON.stringify(obj));

                        break;


         case FLAG_READY:
                        //Both of 2 pp press ready and play
                        //update list info
                        peoples[indexofpeople(client.id)].SS();

                        //update info data
                        obj.p1.ready = true;

                        //send info to all room
                        io.to(obj.p1.roomID).emit('event', JSON.stringify(obj));
                        break;

         case FLAG_MOVE:  //data will be -> flag, p1, x,y
                        //Some one move (p1)
                        io.to(obj.p1.roomID).emit('event',data);
                        break;
         case QUIT:
                        //quit game
                        //leave room
                        client.leave(client.id+"");

                        //emit to other pp
                        io.to(obj.p1.roomID).emit('event',data);

                        //update list info
                        peoples[indexofpeople(client.id)].Leave();

                        break;

         default: break;
       }

   });


//DC
  client.on('disconnect',function(){
        var people = peoples[indexofpeople(client.id)];
        if(people!=null)
            if(people.roomID != null){
              client.leave(people.roomID);
              peoples[indexofpeople(client.id)].Leave();
            }
        var i = indexofpeople(people.id);
        if(i>-1){
            peoples.splice(i,1);
            io.sockets.emit('update-peoples',{peoples:peoples});
        }

   });





  });

function indexofpeople(id){
    for (var i = 0; i < peoples.length; i++) {
        if (peoples[i].id == id) {
        return i;
     }
    }
    return -1;

};



