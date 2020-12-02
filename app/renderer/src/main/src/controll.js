/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 16:35:51
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 23:42:49
 * @FilePath: \electroncamp\app\renderer\src\main\src\controll.js
 */
//被控制端方面进行的回应，媒体流的监听
const { desktopCapturer } = window.require("electron");

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
	//回应函数
	let screenStream = await getScreenStream(); //获取媒体流
	pc.addStream(screenStream); //添加媒体流
	await pc.setRemoteDescription(offer);
	await pc.setLocalDescription(await pc.createAnswer());
	console.log("answer", JSON.stringify(pc.localDescription));
	return pc.localDescription;
}
window.createAnswer = createAnswer; //方便在控制台上操作
pc.onicecandidate = function (e) {
	//触发此事件函数
	console.log("candidate", JSON.stringify(e.candidate));
};
let candidates = []; //缓存的效果
async function addIceCandidate(candidate) {
	if (candidate) {
		//可能结果为null
		candidates.push(candidate);
	}
	if (pc.remoteDescription && pc.remoteDescription.type) {
		for (var i = 0; i < candidates.length; i++) {
			await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
		}
		candidates = []; //清空数据
	}
}
window.addIceCandidate = addIceCandidate;
