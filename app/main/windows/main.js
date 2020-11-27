/*
 * @Author: yehuozhili
 * @Date: 2020-11-27 00:23:30
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 00:23:31
 * @FilePath: \electroncamp\app\main\windows\main.js
 */
const { BrowserWindow } = require("electron");
const isDev = require("electron-is-dev"); //判断是生产环境还是开发环境
const path = require("path");
let win;
function create() {
	win = new BrowserWindow({
		//创建一个窗口
		width: 600,
		height: 600,
		webPreferences: {
			//可以使用node相关的
			nodeIntegration: true,
		},
	});

	if (isDev) {
		win.loadURL("http://localhost:3000");
	} else {
		win.loadFile(
			path.resolve(__dirname, "../../renderer/pages/main/index.html")
		);
	}
}
function send(channel, ...args) {
	//接收信息
	win.webContents.send(channel, ...args);
}
module.exports = { create, send };
