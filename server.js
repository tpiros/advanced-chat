var io = require("socket.io");
var socket = io.listen(8000, "192.168.56.101");
var Room = require('./room.js');
var uuid = require('node-uuid');

socket.set("log level", 1);
var people = {};
var rooms = {};
var clients = [];

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

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

socket.on("connection", function (client) {

	client.on("joinserver", function(name) {
		ownerRoomID = inRoomID = null;
		people[client.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID};
		client.emit("update", "You have connected to the server.");
		socket.sockets.emit("update", people[client.id].name + " is online.")
		socket.sockets.emit("update-people", people);
		client.emit("roomList", {rooms: rooms});
		clients.push(client);
	});

	client.on("send", function(msg) {
		if (socket.sockets.manager.roomClients[client.id]['/'+client.room] !== undefined ) {
			socket.sockets.in(client.room).emit("chat", people[client.id], msg);
	    	} else {
			client.emit("update", "Please connect to a room.");
	    }
	});

	client.on("disconnect", function() {
		if (people[client.id]) {
			if (people[client.id].inroom === null) {
				socket.sockets.emit("update", people[client.id].name + " has left the server.");
				delete people[client.id];
				socket.sockets.emit("update-people", people);
			} else {
				if (people[client.id].owns !== null) {
					var room= rooms[people[client.id].owns];
					if (client.id === room.owner) {
						var i = 0;
						while(i < clients.length) {
							if (clients[i].id === room.people[i]) {
								people[clients[i].id].inroom = null;
								clients[i].leave(room.name);
							}
					    		++i;
						}
						delete rooms[people[client.id].owns];
					}
				}
				socket.sockets.emit("update", people[client.id].name + " has left the server.");
				delete people[client.id];
				socket.sockets.emit("update-people", people);
				socket.sockets.emit("roomList", {rooms: rooms});
			}
		}
	});

	//Room functions
	client.on("createRoom", function(name) {
		if (people[client.id].owns === null) {
			var id = uuid.v4();
			var room = new Room(name, id, client.id);
			rooms[id] = room;
			socket.sockets.emit("roomList", {rooms: rooms});
			//add room to socket, and auto join the creator of the room
			client.room = name;
			client.join(client.room);
			people[client.id].owns = id;
			people[client.id].inroom = id;
			room.addPerson(client.id);
			client.emit("update", "Welcome to " + room.name + ".");
			client.emit("sendRoomID", {id: id});
		} else {
			socket.sockets.emit("update", "You have already created a room.");
		}
	});

	client.on("removeRoom", function(id) {
		var room = rooms[id];
		if (room) {
			if (client.id === room.owner) { //only the owner can remove the room
				var personCount = room.people.length;
				if (personCount > 2) {
					console.log('there are still people in the room warning');
				}  else {
					if (client.id === room.owner) {
						socket.sockets.in(client.room).emit("update", "The owner (" +people[client.id].name + ") removed the room.");
						var i = 0;
						while(i < clients.length) {
							if(clients[i].id === room.people[i]) {
								people[clients[i].id].inroom = null;
								clients[i].leave(room.name);
							}
						    ++i;
						}
			    			delete rooms[id];
			    			people[room.owner].owns = null;
						socket.sockets.emit("roomList", {rooms: rooms});
					}
				}
			} else {
				client.emit("update", "Only the owner can remove a room.");
			}
		}
	});

	client.on("joinRoom", function(id) {
		var room = rooms[id];
		if (client.id === room.owner) {
			client.emit("update", "You are the owner of this room and you have already been joined.");
		} else {
			room.people.contains(client.id, function(found) {
			    if (found) {
			        client.emit("update", "You have already joined this room.");
			    } else {
			    	if (people[client.id].inroom !== null) {
			    		client.emit("update", "You are already in a room ("+rooms[people[client.id].inroom].name+"), please leave it first to join another room.");
			    	} else {
					room.addPerson(client.id);
					people[client.id].inroom = id;
					client.room = room.name;
					client.join(client.room);
					user = people[client.id];
					socket.sockets.in(client.room).emit("update", user.name + " has connected to " + room.name + " room.");
					client.emit("update", "Welcome to " + room.name + ".");
					client.emit("sendRoomID", {id: id});
				}
			    }
			});
		}
	});

	client.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room) {
			if (client.id === room.owner) {
				var i = 0;
				while(i < clients.length) {
					if(clients[i].id === room.people[i]) {
						people[clients[i].id].inroom = null;
						clients[i].leave(room.name);
					}
				    ++i;
				}
	    			delete rooms[id];
	    			people[room.owner].owns = null;
				socket.sockets.emit("roomList", {rooms: rooms});
				socket.sockets.in(client.room).emit("update", "The owner (" +people[client.id].name + ") is leaving the room. The room is removed.");
			} else {
				//make sure that the client is in fact part of this room
				room.people.contains(client.id, function(found) {
				    if (found) {
				       var personIndex = room.people.indexOf(client.id);
					room.people.splice(personIndex, 1);
					socket.sockets.emit("update", people[client.id].name + " has left the room.");
					client.leave(room.name);
				    }
				 });
			}
		}
	});
});