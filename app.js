//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//设置日志级别
io.set('log level', 1); 

//引入routes
var routes = require('./routes');
routes(io);

//express基本配置
app.configure(function(){
  	app.set('port', process.env.PORT || 3000);
  	app.set('views', __dirname + '/views');
  	app.use(express.favicon());
  	app.use(express.logger('dev'));
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(app.router);
  	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  	app.use(express.errorHandler());
});

// 指定webscoket的客户端的html文件
app.get('/', function(req, res){
  	res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function(){
  	console.log("Express server listening on port " + app.get('port'));
});


