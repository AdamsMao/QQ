$(document).ready(function () {
	var content = $("#ChatContent");
	var enter_send = $('#ChatValue');
	var enter_username = $('#username');
	var myName = false;
	var current_user = '';
	var to = '';
		
	//建立websocket连接
	socket = io.connect('http://maobijiang.me:3000');

	//收到server的连接确认
	socket.on('open', function() {

	});

	//监听system事件，判断welcome或者disconnect，打印系统消息信息
	socket.on('system', function(json) {
		var p = '';
		if (json.type === 'welcome') {
			if(myName === json.text) status.text(myName + ':').css('color',json.color);
			p = '<p>system  @ '+ json.time+ ' : Welcome ' + json.text +'</p>';
			//将用户名写到用户管理面板上
			if ($('#user_panel_head_me').html().trim() == 'me') {				
				//当前用户名 
				current_user = json.text;		
				$('#user_panel_head_me').html(json.text);		
			}					   		
			//更新用户列表	
			update_user_list(json);	
		} else if (json.type == 'disconnect') {
			p = '<p>system  @ '+ json.time+ ' : Bye ' + json.text +'</p>';
			//更新用户列表	
			update_user_list(json);	
		}		
		content.prepend(p);
	});
	
	//更新用户列表
	function update_user_list(json) {			
		$('.user_panel').empty();
		for (var user in json.users) {				
			var iDiv = '<div class="user_tab"><a class="user_tab_content" value="' + user + '"><img class="user_icon" src="img/user_icon.png">' + user + '</a></div>';
			$('.user_panel').append(iDiv);
		}	
	}
	//监听私聊事件，打印消息信息	
	socket.on('private', function (json) {
		if (json.to == current_user)	 {
			var p = '<p><span style="color:'+json.color+';">' + json.author+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
			content.prepend(p);
		}
	});

	//监听message事件，打印消息信息
	socket.on('message', function(json) {
		var p = '<p><span style="color:'+json.color+';">' + json.author+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
		content.prepend(p);		
	});
	
	//通过回车输入用户名
	enter_username.keypress(function(event) {
		if (event.which == 13) {
			var username_str = enter_username.val();
			if (!username_str) return;
			socket.send(username_str);
			$('#username_div').css('display','none');
			//显示用户管理窗口
			$('#main_panel').css('display','inline');
		}
	});

	//静态绑定 点击用户名弹出聊天窗口
	//$(".user_tab_content").click(function(e) { } );

	// ## 动态绑定 ## 点击用户名弹出聊天窗口	
	$(".user_tab_content").live('click',function(e) {
			to = $(this).attr("value");
			//指定聊天窗口的位置
			var iTop = $("#main_panel").offset().top;
			var iLeft = $("#main_panel").offset().left;
			$("#main").css({"left":iLeft+401,"top":iTop});	
			//显示聊天窗口
			$('#main').css('display','inline'); 	
			//将聊天对象显示到聊天窗口标题栏
			$('#head_user').html(to);
	});

	//通过“回车”提交聊天信息
	enter_send.keypress(function(e) {
		if (e.ctrlKey && e.which == 13 || e.which == 10) {
			send_content();
		}
	});
	//通过点击提交聊天信息
	$("#btn_send").click(send_content);

	//发送消息函数
	function send_content(){
			//发起私聊消息事件
			var msg = $("#ChatValue").val();
			if (!msg) return;
		    	if (msg.length>0){
				socket.emit('private_message',current_user,to,msg);
				//将消息显示到自己的窗口	
				var date = new Date();
  				var iTime = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
				var p = '<p><span>' + current_user +'</span> @ '+ iTime + ' : '+ msg +'</p>';
				content.prepend(p);
				//清空		
				$("#ChatValue").val('');
				msg = '';
				if(myName === false) {
					myName = msg;
				}				
		  	}
	}

	// ***** 窗口拖动 *****
	function gs2(d,a){
	    	if (d.currentStyle) { 
	      		var curVal=d.currentStyle[a]
	    	}else{ 
	      		var curVal=document.defaultView.getComputedStyle(d, null)[a]
	    	} 
	    	return curVal;
	}
	$("#ChatHidden").click(function(){
		$("#ChatBody").css("display","none");
	});
	$("#ChatShow").click(function(){
		$("#ChatBody").css("display","");
	});
	$("#ChatClose").click(function(){
		$("#main").css("display","none");
	});	
	if (window.opera){ 
		document.write("<input type='hidden' id='Q' value=' '>"); 
	}		      
	var n = 500;
	var dragok = false;
	var y,x,d,dy,dx;		
	function move(e)
	{
		if (!e) e = window.event;
		if (dragok){
			d.style.left = dx + e.clientX - x + "px";
			d.style.top  = dy + e.clientY - y + "px";
			return false;
		}
	}		
	function down(e){
		if (!e) e = window.event;
		var temp = (typeof e.target != "undefined")?e.target:e.srcElement;
		if (temp.tagName != "HTML"|"BODY" && temp.className != "dragclass"|"main_panel"){
			temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
			if (temp.className != "dragclass" | "main_panel") {
				temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
			}
		}
		if('TR'==temp.tagName){
			temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
			temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
			temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
		}		
		if (temp.className == "dragclass" | temp.className == "main_panel"){
			if (window.opera){ 
				document.getElementById("Q").focus(); 
			}
			dragok = true;
			temp.style.zIndex = n++;
			d = temp;
			dx = parseInt(gs2(temp,"left"))|0;
			dy = parseInt(gs2(temp,"top"))|0;
			x = e.clientX;
			y = e.clientY;
			document.onmousemove = move;
			return false;
		}
	}
	function up(){
		dragok = false;
		document.onmousemove = null;
	}		
	document.onmousedown = down;
	document.onmouseup = up;
	//指定窗口在屏幕中的位置
	var iWidth = document.body.clientWidth;
	var iHeight = document.body.clientHeight;	
	$("#main_panel").css({"left":iWidth/2-270,"top":iHeight/2+150});

});

