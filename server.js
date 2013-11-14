var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app)
var io = require("socket.io").listen(server);
var uuid = require('node-uuid');
var Room = require('./room.js');
var _ = require('underscore')._;

app.configure(function() {
	app.locals.pretty = true;
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.static(__dirname + '/public'));
	  app.use('/components', express.static(__dirname + '/components'));
	  app.use('/js', express.static(__dirname + '/js'));
	  app.set('views', __dirname + '/views');
	  app.engine('html', require('ejs').renderFile);
});

app.get('/', function(req, res) {
  res.render('index.html');
});

server.listen(3000, "192.168.56.101",  function(){
  console.log("Express server up and running.");
});

io.set("log level", 1);
var people = {};
var rooms = {};
var sockets = [];

Array.prototype.contains = function(k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i+1));
    }(0));
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

io.sockets.on("connection", function (socket) {

	socket.on("joinserver", function(name) {
		ownerRoomID = inRoomID = null;
		people[socket.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID};
		socket.emit("update", "You have connected to the server.");
		io.sockets.emit("update", people[socket.id].name + " is online.")
		sizePeople = Object.size(people);
		sizeRooms = Object.size(rooms);
		io.sockets.emit("update-people", {people: people, count: sizePeople});
		socket.emit("roomList", {rooms: rooms, count: sizeRooms});
		sockets.push(socket);
	});

	socket.on("send", function(msg) {
		var re = /^[w]:.*:/;
		var whisper = re.test(msg);
		var whisperStr = msg.split(":");
		var found = false;
		if (whisper) {
			var whisperTo = whisperStr[1];
			var keys = Object.keys(people);
			if (keys.length != 0) {
				for (var i = 0; i<keys.length; i++) {
					if (people[keys[i]].name === whisperTo) {
						var whisperId = keys[i];
						found = true;
						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "You can't whisper to yourself.");
						}
						break;
					} 
				}
			}
			if (found && socket.id !== whisperId) {
				var whisperTo = whisperStr[1];
				var whisperMsg = whisperStr[2];
				socket.emit("whisper", {name: "You"}, whisperMsg);
				io.sockets.socket(whisperId).emit("whisper", people[socket.id], whisperMsg);
			} else {
				socket.emit("update", "Can't find " + whisperTo);
			}
		} else {
			if (io.sockets.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
				io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
		    	} else {
				socket.emit("update", "Please connect to a room.");
		    	}
		}
	});

	socket.on("disconnect", function() {
<<<<<<< HEAD
		if (typeof people[socket.id] !== "undefined") {
			if (people[socket.id].inroom === null) {
				//io.sockets.emit("update", people[socket.id].name + " has left the server.");
=======
		//console.log(people);
		//console.log(rooms);
		if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
			if (people[socket.id].inroom === null) { //person disconnecting is not in a room, can safely remove
				io.sockets.emit("update", people[socket.id].name + " has left the server.");
>>>>>>> devel
				delete people[socket.id];
				sizePeople = Object.size(people);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
			} else { //person is in a room
				var room = rooms[people[socket.id].inroom];
				if (people[socket.id].owns !== null) { //person owns a room
					//var room = rooms[people[socket.id].owns];
					if (socket.id === room.owner) { // if person leaving matches the room owner
						io.sockets.in(socket.room).emit("update", "The owner (" +people[socket.id].name + ") has left the server. The room is removed and you have been disconnected from it as well.");
						delete rooms[people[socket.id].owns]; //deleting the room.
						io.sockets.emit("update", people[socket.id].name + " has left the server.");
						//remove everyone from the room.
						delete rooms[people[socket.id].owns];
						var i= 0;
						while(i < sockets.length) {
							if (_.contains(room.people), socket.id) {
								people[sockets[i].id].inroom = null;
								sockets[i].leave(room.name);
								console.log(room.people);
								room.people = _.without(room.people, socket.id)
							}
						++i;
						}
					}
					room.people = _.without(room.people, socket.id)
				}
				//remove person from room list
				room.people = _.without(room.people, socket.id)
				if (room.owner !== socket.id)
					io.sockets.emit("update", people[socket.id].name + " has left the server.");
				delete people[socket.id];
				sizePeople = Object.size(people);
				sizeRooms = Object.size(rooms);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
				io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			}
			//remove sockets
			var o = _.findWhere(sockets, {'id': socket.id});
			//console.log("~~~ slicing this out")
			//console.log("socket size before: "+ sockets.length)
			//console.log("~~~")
			sockets = _.without(sockets, o);
			//console.log("socket size after: "+ sockets.length)
			//var personIndex = room.people.indexOf(socket.id)
			//console.log(personIndex);
			//room.people.splice(personIndex, 1);
			console.log(people);
			console.log();
			console.log(rooms);
		}
		p = sockets.indexOf(socket.id);
		sockets.splice(p, 1);
	});

	//Room functions
	socket.on("createRoom", function(name) {
		if (people[socket.id].owns === null) {
			var id = uuid.v4();
			var room = new Room(name, id, socket.id);
			rooms[id] = room;
			sizeRooms = Object.size(rooms);
			io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			//add room to socket, and auto join the creator of the room
			socket.room = name;
			socket.join(socket.room);
			people[socket.id].owns = id;
			people[socket.id].inroom = id;
			room.addPerson(socket.id);
			socket.emit("update", "Welcome to " + room.name + ".");
			socket.emit("sendRoomID", {id: id});
		} else {
			io.sockets.emit("update", "You have already created a room.");
		}
	});

	socket.on("check", function(name, fn) {
		var keys = Object.keys(rooms);
		var match = false;
		if (keys.length != 0) {
			for (var i = 0; i<keys.length; i++) {
				if (rooms[keys[i]].name === name) {
					match = true;
					break;
				} 
			}
		}
		fn({result: match});
	});

	socket.on("removeRoom", function(id) {
		var room = rooms[id];
		if (room) {
			if (socket.id === room.owner) { //only the owner can remove the room
				var personCount = room.people.length;
				if (personCount > 2) {
					console.log('There are still people in the room warning');
				}  else {
					if (socket.id === room.owner) {
						io.sockets.in(socket.room).emit("update", "The owner (" +people[socket.id].name + ") removed the room. and you have also been removed from it.");
						var i = 0;
						while(i < sockets.length) {
							if(sockets[i].id === room.people[i]) {
								people[sockets[i].id].inroom = null;
								sockets[i].leave(room.name);
							}
						    ++i;
						}
			    			delete rooms[id];
			    			people[room.owner].owns = null;
			    			sizeRooms = Object.size(rooms);
						io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
					}
				}
			} else {
				socket.emit("update", "Only the owner can remove a room.");
			}
		}
	});

	socket.on("joinRoom", function(id) {
		if (typeof people[socket.id] !== "undefined") {
			var room = rooms[id];
			if (socket.id === room.owner) {
				socket.emit("update", "You are the owner of this room and you have already been joined.");
			} else {
				room.people.contains(socket.id, function(found) {
				    if (found) {
				        socket.emit("update", "You have already joined this room.");
				    } else {
				    	if (people[socket.id].inroom !== null) {
				    		socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
				    	} else {
						room.addPerson(socket.id);
						people[socket.id].inroom = id;
						socket.room = room.name;
						socket.join(socket.room);
						user = people[socket.id];
						io.sockets.in(socket.room).emit("update", user.name + " has connected to " + room.name + " room.");
						socket.emit("update", "Welcome to " + room.name + ".");
						socket.emit("sendRoomID", {id: id});
					}
				    }
				});
			}
		} else {
			socket.emit("update", "Please enter a valid name first.");
		}
	});

	socket.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room) {
			if (socket.id === room.owner) {
				io.sockets.in(socket.room).emit("update", "The owner (" +people[socket.id].name + ") is leaving the room. The room is removed and you have been disconnected from it as well.");
				var i = 0;
				while(i < sockets.length) {
					if(sockets[i].id === room.people[i]) {
						people[sockets[i].id].inroom = null;
						sockets[i].leave(room.name);
					}
				    ++i;
				}
	    			delete rooms[id];
	    			people[room.owner].owns = null;
	    			sizeRooms = Object.size(rooms);
				io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			} else {
				//make sure that the socket is in fact part of this room
				room.people.contains(socket.id, function(found) {
				    if (found) {
				       var personIndex = room.people.indexOf(socket.id);
					room.people.splice(personIndex, 1);
					people[socket.id].inroom = null;
					io.sockets.emit("update", people[socket.id].name + " has left the room.");
					socket.leave(room.name);
				    }
				 });
			}
		}
	});
});
