/*
 * @Author: yehuozhili
 * @Date: 2020-11-15 11:00:56
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 16:04:04
 * @FilePath: \electroncamp\app\main\index.js
 */
const { app } = require("electron");
// const {create:createMainWindow}=require('./windows/main')//创建一个主窗口
const handleIPC = require("./ipc"); //处理主进程的事务放在同一个文件
const { create: createControlWindow } = require("./windows/control"); //控制窗口渲染页面
const robot = require("./robot");

app.allowRendererProcessReuse = false;
app.on("ready", () => {
	handleIPC();
	// createMainWindow()//主窗口出现APP.js的页面
	createControlWindow();
	robot();
});
