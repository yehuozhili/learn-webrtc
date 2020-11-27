/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 15:08:02
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 16:17:41
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
function getScreenStream() {
	//获取屏幕的信息
	return new Promise((_resolve, _reject) => {
		//对视频音频进行约束条件
		desktopCapturer
			.getSources({ types: ["window", "screen"] })
			.then(async (sources) => {
				console.log(sources); //获取的对象如图所示在下面
				for (const source of sources) {
					try {
						const stream = await navigator.mediaDevices.getUserMedia(
							{
								audio: false,
								video: {
									mandatory: {
										chromeMediaSource: "desktop",
										chromeMediaSourceId: source.id,
										maxWidth: window.screen.width,
										maxHeight: window.screen.height,
									},
								},
							}
						);
						play(stream);
					} catch (reject) {
						console.error(reject);
					}
				}
			});
	});
}
getScreenStream(); //调用
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
