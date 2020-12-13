/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 15:08:02
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-28 00:40:27
 * @FilePath: \electroncamp\app\renderer\pages\control\controled.js
 */
const { ipcRenderer } = require("electron");
const EventEmitter = require("events");
const peer = new EventEmitter();
const video = document.getElementById("screen-video");
function play(stream) {
	video.srcObject = stream;
	video.onloadedmetadata = () => video.play();
}
peer.on("add-stream", (stream) => {
	play(stream);
});

window.onkeydown = function (e) {
	console.log(e);
	var data = {
		keyCode: e.keyCode,
		shift: e.shiftKey,
		meta: e.metaKey,
		control: e.controlKey,
		alt: e.altKey,
	};
	peer.emit("robot", "key", data); //返回一个键盘类型的事件的结果
};

window.onmouseup = function (e) {
	console.log(e);
	var data = {
		clientX: e.clientX,
		clientY: e.clientY,
		video: {
			width: video.getBoundingClientRect().width,
			height: video.getBoundingClientRect().height,
		},
	};
	peer.emit("robot", "mouse", data); ////返回一个鼠标类型的事件的结果
};

peer.on("robot", (type, data) => {
	if (type === "mouse") {
		data.screen = {
			width: window.screen.width,
			height: window.screen.height,
		};
	}
	setTimeout(() => {
		ipcRenderer.send("robot", type, data); //********通信**渲染进程
	}, 2000);
});

//创建一个远程连接
const pc = new window.RTCPeerConnection({});
async function createOffer() {
	//创造一个远程端点
	const offer = await pc.createOffer({
		//只需要视频
		offerToReceiveAudio: false,
		offerToReceiveVideo: true,
	});
	await pc.setLocalDescription(offer);
	console.log("pc offer", JSON.stringify(offer));
	return pc.localDescription;
}
createOffer().then((offer) => {
	ipcRenderer.send("forward", "offer", { type: offer.type, sdp: offer.sdp });
});
async function setRemote(answer) {
	await pc.setRemoteDescription(answer);
}
ipcRenderer.on("answer", (e, answer) => {
	setRemote(answer);
});

pc.onaddstream = function (e) {
	peer.emit("add-stream", e.stream);
};
pc.onicecandidate = function (e) {
	if (e.candidate) {
		ipcRenderer.send(
			"forward",
			"control-candidate",
			JSON.stringify(e.candidate)
		);
	}
};
let candidates = [];
ipcRenderer.on("candidate", (e, candidate) => {
	addIceCandidate(candidate);
});
async function addIceCandidate(candidate) {
	if (candidate) {
		candidates.push(candidate);
	}
	if (pc.remoteDescription && pc.remoteDescription.type) {
		for (var i = 0; i < candidates.length; i++) {
			await pc.addIceCandidate(
				new RTCIceCandidate(JSON.parse(candidates[i]))
			);
		}
		candidates = []; //清空数据
	}
}
// 实测不通
// const dc = pc.createDataChannel("robotchannel");
// console.log("dc", dc);
// dc.onopen = function () {
// 	console.log("onopen datachanel");
// 	peer.on("robot", function (type, data) {
// 		//监听robot事件发送数据
// 		console.log("xx");
// 		dc.send(JSON.stringify({ type, data }));
// 	});
// };
// dc.onmessage = function (e) {
// 	//接收到控制端的消息
// 	console.log("message", e);
// };
// dc.onerror = function (e) {
// 	//防止收到报错的消息
// 	console.log("error", e);
// };
