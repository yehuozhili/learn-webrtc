/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 00:23:46
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 00:23:47
 * @FilePath: \electroncamp\app\main\windows\control.js
 */
//子窗口
const { BrowserWindow } = require("electron");
const path = require("path");
let win;
function create() {
	win = new BrowserWindow({
		width: 800,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.loadFile(
		path.resolve(__dirname, "../../renderer/pages/control/index.html")
	);
}
function send(channel, ...args) {
	win.webContents.send(channel, ...args);
}
module.exports = { create, send };
