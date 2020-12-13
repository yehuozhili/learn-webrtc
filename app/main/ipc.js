const { ipcMain } = require("electron"); //主进程
const { send: sendMainWindow } = require("./windows/main"); //向主窗口发送信息
const {
	create: createControlWindow,
	send: sendControlWindow,
} = require("./windows/control"); //创建新的窗口
const signal = require("./signal");
const robot = require("./robot");

module.exports = function () {
	ipcMain.handle("login", async () => {
		let { code } = await signal.invoke("login", null, "logined");
		console.log("login--data", code);
		return code;
	});
	ipcMain.on("control", async (e, remote) => {
		signal.send("control", { remote });
	});
	signal.on("controlled", (data) => {
		createControlWindow();
		sendMainWindow("control-state-change", data.remote, 1);
	});
	signal.on("be-controlled", (data) => {
		sendMainWindow("control-state-change", data.remote, 2);
	});
	ipcMain.on("forward", (e, event, data) => {
		signal.send("forward", { event, data });
	});
	signal.on("offer", (data) => {
		sendMainWindow("offer", data);
	});
	signal.on("answer", (data) => {
		sendControlWindow("answer", data);
	});
	signal.on("puppet-candidate", (data) => {
		sendControlWindow("candidate", data);
	});
	signal.on("control-candidate", (data) => {
		sendMainWindow("candidate", data);
	});
	robot();
};
