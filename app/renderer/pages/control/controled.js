/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 15:08:02
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-28 00:40:27
 * @FilePath: \electroncamp\app\renderer\pages\control\controled.js
 */
const { desktopCapturer } = require("electron"); //获取桌面流的信息
const { ipcRenderer } = require("electron");
const EventEmitter = require("events");
const peer = new EventEmitter();
const video = document.getElementById("screen-video");
function play(stream) {
	video.srcObject = stream;
	video.onloadedmetadata = () => video.play();
}
peer.on("add-stream", (stream) => {
	console.log("4444");
	play(stream);
});
// function getScreenStream() {
// 	//获取屏幕的信息
// 	return new Promise((_resolve, _reject) => {
// 		//对视频音频进行约束条件
// 		desktopCapturer
// 			.getSources({ types: ["window", "screen"] })
// 			.then(async (sources) => {
// 				console.log(sources); //获取的对象如图所示在下面
// 				for (const source of sources) {
// 					try {
// 						const stream = await navigator.mediaDevices.getUserMedia(
// 							{
// 								audio: false,
// 								video: {
// 									mandatory: {
// 										chromeMediaSource: "desktop",
// 										chromeMediaSourceId: source.id,
// 										maxWidth: window.screen.width,
// 										maxHeight: window.screen.height,
// 									},
// 								},
// 							}
// 						);
// 						play(stream);
// 					} catch (reject) {
// 						console.error(reject);
// 					}
// 				}
// 			});
// 	});
// }
// getScreenStream(); //调用
window.onkeydown = function (e) {
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

// peer.on("robot", (type, data) => {
// 	if (type === "mouse") {
// 		data.screen = {
// 			width: window.screen.width,
// 			height: window.screen.height,
// 		};
// 	}
// 	setTimeout(() => {
// 		ipcRenderer.send("robot", type, data); //********通信**渲染进程
// 	}, 2000);
// });

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
createOffer();
async function setRemote(answer) {
	//设置远程SDP
	await pc.setRemoteDescription(answer);
}
window.setRemote = setRemote; //为了在控制台的能看看到效果
pc.onaddstream = function (e) {
	//监听媒体流的增加
	console.log("add-stream", e);
	peer.emit("add-stream", e.stream);
};
pc.onicecandidate = function (e) {
	//触发此事件函数
	console.log("candidate", JSON.stringify(e.candidate));
};
let candidates = [];
async function addIceCandidate(candidate) {
	//接收信号
	if (candidate) {
		//可能结果为null
		candidates.push(candidate);
	}
	if (pc.remoteDescription && pc.remoteDescription.type) {
		console.log(pc.remoteDescription, "pcre");
		console.log(candidates);
		//pc.remoteDescription描述了和远程对端之间的会话(包括配置和媒体信息) ，如果还没有被设置过的话，它会是 null.
		for (var i = 0; i < candidates.length; i++) {
			await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
		}
		candidates = []; //清空数据
	}
}
window.addIceCandidate = addIceCandidate; //方便在控制台上操作
