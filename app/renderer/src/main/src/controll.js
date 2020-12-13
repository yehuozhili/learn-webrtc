/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 16:35:51
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 23:42:49
 * @FilePath: \electroncamp\app\renderer\src\main\src\controll.js
 */
//被控制端方面进行的回应，媒体流的监听
const { desktopCapturer, ipcRenderer } = window.require("electron");

function getScreenStream() {
	return new Promise((resolve, reject) => {
		desktopCapturer
			.getSources({ types: ["window", "screen"] })
			.then(async (sources) => {
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
						resolve(stream);
					} catch (reject) {
						console.error(reject);
					}
				}
			});
	});
}

const pc = new window.RTCPeerConnection({});
async function createAnswer(offer) {
	let screenStream = await getScreenStream(); //获取媒体流
	pc.addStream(screenStream); //添加媒体流
	await pc.setRemoteDescription(offer);
	await pc.setLocalDescription(await pc.createAnswer());
	return pc.localDescription;
}

ipcRenderer.on("offer", async (e, offer) => {
	let answer = await createAnswer(offer);
	ipcRenderer.send("forward", "answer", {
		type: answer.type,
		sdp: answer.sdp,
	});
});

pc.onicecandidate = function (e) {
	if (e.candidate) {
		ipcRenderer.send(
			"forward",
			"puppet-candidate",
			JSON.stringify(e.candidate)
		);
	}
};

let candidates = []; //缓存的效果
async function addIceCandidate(candidate) {
	if (candidate) {
		candidates.push(candidate);
	}
	if (pc.remoteDescription && pc.remoteDescription.type) {
		for (var i = 0; i < candidates.length; i++) {
			await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
		}
		candidates = []; //清空数据
	}
}
ipcRenderer.on("candidate", (e, candidate) => {
	addIceCandidate(candidate);
});
// 实测不通
// pc.ondatachannel = (e) => {
// 	//监听datachannel事件跟上文代码相呼应
// 	console.log("datachannel", e);
// 	e.channel.onopen = (e) => {
// 		console.log("onopen", e);
// 	};
// 	e.channel.onmessage = (e) => {
// 		const { type, data } = JSON.parse(e.data); //获取控制端robotjs数据
// 		if (type === "mouse") {
// 			data.screen = {
// 				width: window.screen.width,
// 				height: window.screen.height,
// 			};
// 		}
// 		ipcRenderer.send("robot", type, data);
// 	};
// };
