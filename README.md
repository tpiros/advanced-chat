A more advanced chat application. Make sure that you update <strong>server.js</strong>:

<pre>server.listen(3000, "192.168.56.101",  function(){
  console.log("Express server up and running.");
});</pre>

and add your own IP address/hostname.


Please also update <strong>public/js/client.js</strong>:

<pre>var socket = io.connect("192.168.56.101:3000");</pre>

with the right IP address/hostname.

To install <code>npm install && bower install</code> and to launch run <code>npm start</code>.

New up to date post: http://tamaspiros.co.uk/2013/10/26/chat-2-0-supercharged-chat-written-in-node-js-and-socket-io/

Previous articles related to this topic:
-http://tamaspiros.co.uk/2013/05/19/simple-chat-application-using-node-js-and-socket-io/
-http://tamaspiros.co.uk/2013/07/15/advanced-chat-using-node-js-and-socket-io-episode-1/
