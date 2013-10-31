$(document).ready(function() {
    var socket = io.connect("192.168.56.101:3000");
    var myRoomID = null;
    $("#chat").hide();
    $("#errors").hide();
    $("#name").focus();
    $("#createRoom").hide();
    $("#createRoomForm").hide();
    if ($("#name").val() == "") {
      $("#join").attr('disabled', 'disabled');
    }

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
        $("#createRoom").show();
        $("#errors").hide();
      } else {
        $("#errors").empty();
        $("#errors").show();
        $("#errors").append("Please enter a name");
      }
    });



  $("#name").typeahead({
    name: 'example',
    local: [
        'Salt Lake City',
        'Provo',
        'Ogden',
        'Bountiful',
        'Orem',
        'Centerville',
        'St. George',
        'Cedar City',
        'Hurricane', ]
}).each(function() {
   if ($(this).hasClass('input-lg'))
        $(this).prev('.tt-hint').addClass('hint-lg');
});

    $("#name").keypress(function(e){
      var name = $("#name").val();
      if(name.length < 3) {
        $("#join").attr('disabled', 'disabled'); 
      } else {
        $("#errors").hide();
        $("#join").removeAttr('disabled');
      }
      if(e.which == 13) {
        if (name != "") {
          socket.emit("joinserver", name);
          $("#login").detach();
          $("#chat").show();
          $("#msg").focus();
          $("#createRoom").show();
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
      var roomExists = false;
      var roomName = $("#createRoomName").val();
      socket.emit("check", roomName, function(data) {
        roomExists = data.result;
         if (roomExists) {
          } else {      
          if (roomName.length > 0) { //also check for roomname
            socket.emit("createRoom", roomName);
            $("#createRoom").hide();
            $("#createRoomForm").hide();
            }
          }
      });
    });

    $("#rooms").on('click', '.joinRoomBtn', function() {
      var roomName = $(this).siblings("span").text();
      var roomID = $(this).attr("id");
      socket.emit("joinRoom", roomID);
    });

    $("#rooms").on('click', '.removeRoomBtn', function() {
      var roomName = $(this).siblings("span").text();
      var roomID = $(this).attr("id");
      socket.emit("removeRoom", roomID);
      $("#createRoom").show();
    });    

    $("#leave").click(function() {
      var roomID = myRoomID;
      socket.emit("leaveRoom", roomID);
      $("#createRoom").show();
    });

//socket-y stuff
    socket.on("update", function(msg) {
      $("#msgs").append("<li>" + msg + "</li>");
    });

    socket.on("update-people", function(data){
      $("#people").empty();
      $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");
      $.each(data.people, function(clienid, obj) {
        $('#people').append("<li class=\"list-group-item\">" + obj.name + "</li>");
      });
    });

    socket.on("chat", function(person, msg) {
      $("#msgs").append("<li><strong><span class='text-success'>" + person.name + "</span></strong> says: " + msg + "</li>");
    });
    socket.on("whisper", function(person, msg) {
      if (person.name === "You") {
        s = "whisper"
      } else {
        s = "whispers"
      }
      $("#msgs").append("<li><strong><span class='text-muted'>" + person.name + "</span></strong> "+s+": " + msg + "</li>");
    });

    socket.on("roomList", function(data) {
      $("#rooms").text("");
      $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+data.count+"</span></li>");
       if (!jQuery.isEmptyObject(data.rooms)) { 
        $.each(data.rooms, function(id, room) {
          $('#rooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span> <button id="+id+" class='joinRoomBtn btn btn-default btn-xs' >Join</button> <button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button></li>");
        });
      } else {
        $("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
      }
    });

    socket.on("sendRoomID", function(data) {
      myRoomID = data.id;
    });

    socket.on("disconnect", function(){
      $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
      $("#msg").attr("disabled", "disabled");
      $("#send").attr("disabled", "disabled");
    });



  });
