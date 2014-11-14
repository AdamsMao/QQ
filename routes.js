module.exports = function(io) {
	var users = {};
	var sockets = {};

	//WebSocket连接监听
	io.on('connection', function (socket) {
	  	socket.emit('open');	//通知客户端已连接

	  	// 打印握手信息
		//var address = socket.handshake.address

	  	// 构造客户端对象
	  	var client = {
	    		socket:socket,
	    		name:false,
	    		color:getColor()
	  	}
	  
		var obj = {time:getTime(),color:client.color};

	  	// 对message事件的监听
	  	socket.on('message', function(msg){
	    		
	    		// 判断是不是第一次连接，以第一条消息作为用户名
	    		if(!client.name){
					client.name = msg;
					//将新的用户加入用户列表
					users[msg]=msg;
					//将新连接的socket加入用户组
					sockets[msg] = client.socket; 
					//将要发送的数据	
					obj['text']=client.name;
					obj['author']='System';
					obj['type']='welcome';	
					//用户列表
					obj['users']=users;			
	      				//返回欢迎语
					socket.emit('system',obj);
					//广播新用户已登陆
					socket.broadcast.emit('system',obj);
	     		}else{
					//如果不是第一次的连接，正常的聊天消息
					obj['text']=msg;
					obj['author']=client.name;      
					obj['type']='message';
					// 返回消息（可以省略）
					socket.emit('message',obj);
					// 广播向其他用户发消息
					socket.broadcast.emit('message',obj);
	      		}
	    	});
		
		//对私聊事件的监听
		socket.on('private_message', function (from,to,msg) {
		    	obj['text']=msg;
			obj['author']=from; 
			obj['to']=to;     
			obj['type']='private';
			// 向好友发私密消息
			if(to in sockets){
				sockets[to].emit('private',obj);								
			}
		});

	    	//监听出退事件
	    	socket.on('disconnect', function () {  
	      		var obj = {
	       			time:getTime(),
				color:client.color,
				author:'System',
				text:client.name,
				type:'disconnect',
				//用户列表
				users:users
	      		};
			//删除退出的socket
			var temp = client.name;
			delete sockets[temp];
			//删除退出的用户
			delete users[temp];
	      		// 广播用户已退出
	      		socket.broadcast.emit('system',obj);			
	    	});
	  
	});
}

var getTime=function(){
  	var date = new Date();
  	return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor=function(){
  	var colors = ['pink','red','green','blue','blueviolet','burlywood','cadetblue'];
  	return colors[Math.round(Math.random() * 10000 % colors.length)];
}



