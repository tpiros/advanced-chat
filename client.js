$(document).ready(function() {
    var socket = io.connect("192.168.56.101:8000");
    var myRoomID = null;
    $("#chat").hide();
    $("#createRoomForm").hide();
    $("#name").focus();
    $("form").submit(function(event){
        event.preventDefault();
    });

    $("#join").click(function(){
      var name = $("#name").val();
      if (name != "") {
        socket.emit("joinserver", name);
        $("#login").detach();
        $("#chat").show();
        $("#msg").focus();
        var ready = true;
      }
    });

    $("#name").keypress(function(e){
      if(e.which == 13) {
        var name = $("#name").val();
        if (name != "") {
          socket.emit("joinserver", name);
          ready = true;
          $("#login").detach();
          $("#chat").show();
          $("#msg").focus();
        }
      }
    });

    $("#send").click(function() {
      var msg = $("#msg").val();
      socket.emit("send", msg);
      $("#msg").val("");
    });

    $("#msg").keypress(function(e) {
      if(e.which == 13) {
        var msg = $("#msg").val();
        socket.emit("send", msg);
        $("#msg").val("");
      }
    });

    $("#showCreateRoom").click(function() {
      $("#createRoomForm").toggle();
    });

    $("#createRoomBtn").click(function() {
      var roomName = $("#createRoomName").val();
      if (roomName) {
        socket.emit("createRoom", roomName);
      }
    });

    $("#rooms").on('click', '.joinRoomBtn', function() {
      var roomName = $(this).siblings("span").text();
      var roomID = $(this).attr("id");
      socket.emit("joinRoom", roomID);
    });

    $("#rooms").on('click', '.removeRoomBtn', function() {
      var roomName = $(this).siblings("span").text();
      var roomID = $(this).attr("id");
      console.log("Remove ==> " + roomID);
      socket.emit("removeRoom", roomID);
    });    

    $("#leave").click(function() {
      var roomID = myRoomID;
      socket.emit("leaveRoom", roomID);
    });

    socket.on("update", function(msg) {
      if(ready)
        $("#msgs").append("<li>" + msg + "</li>");
    })

    socket.on("update-people", function(people){
      if(ready) {
        $("#people").empty();
        $.each(people, function(clienid, name) {
          $('#people').append("<li>" + name.name + "</li>");
        });
      }
    });

    socket.on("chat", function(person, msg){
      if(ready) {
        $("#msgs").append("<li><strong><span class='text-success'>" + person.name + "</span></strong> says: " + msg + "</li>");
      }
    });

    socket.on("roomList", function(data) {
      $("#rooms").text("");
      //if (data.rooms.length !== 0) {
        if (!jQuery.isEmptyObject(data.rooms)) { 
        $.each(data.rooms, function(id, room) {
          $('#rooms').append("<li id="+id+"><span>" + room.name + "</span> <button id="+id+" class='joinRoomBtn'>Join</button> <button id="+id+" class='removeRoomBtn'>Remove</button></li>");
        });
      } else {
        $("#rooms").append("<li>There are no rooms yet.</li>");
      }
    });

    socket.on("sendRoomID", function(data) {
      console.log("Data ID ==> " + data.id);
      myRoomID = data.id;
    });

    socket.on("disconnect", function(){
      $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
      $("#msg").attr("disabled", "disabled");
      $("#send").attr("disabled", "disabled");
    });



  });