//相关的通信逻辑
const webSocket = require("ws");
const eventEmitter = require("events");
const signal = new eventEmitter();
const ws = new webSocket("ws://127.0.0.1:8001");

ws.on("open", () => {
	console.log("connect success");
});

ws.on("message", (message) => {
	//响应消息
	let data = {};
	console.log("message", message);
	try {
		data = JSON.parse(message);
	} catch (e) {
		console.log("parse error", e);
	}
	signal.emit(data.event, data.data);
});

function send(event, data) {
	ws.send(JSON.stringify({ event, data }));
}

function invoke(event, data, answerEvent) {
	return new Promise((resolve, reject) => {
		send(event, data);
		signal.once(answerEvent, resolve); //监听接收的事件继续执行
		setTimeout(() => {
			reject("timeout");
		}, 50000);
	});
}
signal.send = send;
signal.invoke = invoke;
module.exports = signal;
