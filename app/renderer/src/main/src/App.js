/*
 * @Author: yehuozhili
 * @Date: 2020-11-14 22:42:53
 * @LastEditors: yehuozhili
 * @LastEditTime: 2020-11-27 23:36:37
 * @FilePath: \electroncamp\app\renderer\src\main\src\App.js
 */
import React, { useState, useEffect } from "react"; //使用hooks
import "./controll";
const { ipcRenderer } = window.require("electron"); //引入渲染进程

function App() {
	const [remoteCode, setRemoteCode] = useState(""); //控制的控制码
	const [localCode, setLocalCode] = useState(""); //本身的控制码
	const [controlText, setControlText] = useState(""); //控制码的文案
	const login = async () => {
		let code = await ipcRenderer.invoke("login");
		setLocalCode(code);
	};
	useEffect(() => {
		login(); //加载完成发送登录获取随机码
		ipcRenderer.on("control-state-change", handleControlState);
		return () => {
			ipcRenderer.removeListener(
				"control-state-change",
				handleControlState
			);
		};
	}, []);
	const startControl = (remoteCode) => {
		ipcRenderer.send("control", remoteCode);
	};
	const handleControlState = (e, name, type) => {
		let text = "";
		if (type === 1) {
			//控制别人
			text = `正在远程控制${name}`;
		} else if (type === 2) {
			//被别人控制
			text = `被${name}控制`;
		}
		setControlText(text); //当前页面的文本
	};
	return (
		<div className="App">
			{controlText === "" ? (
				<>
					<div>你的控制码{localCode}</div>
					<input
						type="text"
						value={remoteCode}
						onChange={(e) => setRemoteCode(e.target.value)}
					/>
					<button onClick={() => startControl(remoteCode)}>
						确认
					</button>
				</>
			) : (
				<div>{controlText}</div>
			)}
		</div>
	);
}

export default App;
