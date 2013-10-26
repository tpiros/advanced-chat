A more advanced chat application. Make sure that you update <strong>server.js</strong>:

<pre>server.listen(3000, "192.168.56.101",  function(){
  console.log("Express server up and running.");
});</pre>

and add your own IP address/hostname.


Please also update <strong>public/js/client.js</strong>:

<pre>var socket = io.connect("192.168.56.101:3000");</pre>

with the right IP address/hostname.


New up to date post: <coming>

A follow up to http://tamaspiros.co.uk/2013/05/19/simple-chat-application-using-node-js-and-socket-io/

More info:
http://tamaspiros.co.uk/2013/07/15/advanced-chat-using-node-js-and-socket-io-episode-1/
