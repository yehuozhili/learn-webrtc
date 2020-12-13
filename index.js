const webSocket = require("ws");
const wss = new webSocket.Server({ port: 8001 });

const code2ws = new Map();
wss.on("connection", function connection(ws, request) {
	//ws端
	//随机码  六位数
	let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
	code2ws.set(code, ws); //形成一个映射
	ws.sendData = (event, data) => {
		//封装数据成字符串格式
		ws.send(JSON.stringify({ event, data }));
	};
	ws.sendError = (msg) => {
		ws.sendData("error", { msg });
	};

	ws.on("message", function incoming(message) {
		console.log("incoming", message); //传过来的数据类型是:{event,data}
		let parsedMessage = {};
		try {
			//通过event判断类型，交换到两端不同的函数里去
			//防止服务器会崩溃
			parsedMessage = JSON.parse(message);
		} catch (e) {
			ws.sendError("message invalid");
			console.log("parse message error", e);
			return;
		}
		let { event, data } = parsedMessage;
		if (event === "login") {
			ws.sendData("logined", { code });
		} else if (event === "control") {
			let remote = +data.remote; //转换成数据类型
			if (code2ws.has(remote)) {
				//相当于把这个客户端的发送方法与另一个客户端发送方法统一起来。
				// 远端发送方法都为sendRemote
				ws.sendData("controlled", { remote });
				ws.sendRemote = code2ws.get(remote).sendData;
				code2ws.get(remote).sendRemote = ws.sendData;
				ws.sendRemote("be-controlled", { remote: code });
			}
		} else if (event === "forward") {
			//实现信令转发需求
			if (ws.sendRemote) {
				ws.sendRemote(data.event, data.data);
			}
		}
	});

	ws.on("close", () => {
		//清理事件
		code2ws.delete(code);
	});
});
