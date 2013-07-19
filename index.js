var express = require('express');
var app = module.exports = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/'));
  app.set('views', __dirname + '/');
  app.engine('html', require('ejs').renderFile);
});

app.get('/', function(req, res) {
  res.render('index.html');
});

app.listen(8001, function(){
  console.log("Express server up and running.");
});