'use strict';

import * as vscode from 'vscode';

import { Socket } from 'net';
var net = require('net');

let mayaportStatusBar: vscode.StatusBarItem;
let socket_mel: Socket;
let socket_py: Socket;
let port_mel: string;
let port_py: string;

function updateStatusBarItem(langID?: string): void {
	let text: string;
	if (langID == 'python') {
		if (socket_py instanceof Socket == true) {
			text = `Maya Python : ${port_py}`;
			mayaportStatusBar.text = text;
			mayaportStatusBar.show();
		}
	} else if (langID == 'mel') {
		if (socket_mel instanceof Socket == true) {
			text = `Maya Mel : ${port_mel}`;
			mayaportStatusBar.text = text;
			mayaportStatusBar.show();
		}
	}

	if (!text) {
		mayaportStatusBar.hide();
	}
}

export class TimeUtils {
	public static getTime(): String {
		return new Date()
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '')
			.split(' ')[1];
	}
}

export class Logger {
	private static _outputPanel;

	public static registerOutputPanel(outputPanel: vscode.OutputChannel) {
		this._outputPanel = outputPanel;
	}

	public static info(log: String) {
		this.typeLog(log, 'INFO');
	}

	public static error(log: String) {
		this.typeLog(log, 'ERROR');
	}

	public static success(log: String) {
		this.typeLog(log, 'SUCCESS');
	}

	public static response(log: String) {
		this.typeLog(log, 'RESPONSE');
	}

	private static typeLog(log: String, type: String) {
		if (!this._outputPanel) {
			return;
		}
		let util = require('util');
		let time = TimeUtils.getTime();
		if (!log || !log.split) return;
		this._outputPanel.appendLine(util.format('MayaCode [%s][%s]\t %s', time, type, log));
	}
}

export function activate(context: vscode.ExtensionContext) {
	let outputPanel = vscode.window.createOutputChannel('Maya');
	Logger.registerOutputPanel(outputPanel);

	var config = vscode.workspace.getConfiguration('mayacode');

	function ensureConnection(type: string) {
		let socket;
		let mayahost: string = config.get('hostname');
		let port: string = config.get(type + '.port');

		if (type == 'mel') {
			socket = socket_mel;
			port_mel = port;
		}
		if (type == 'python') {
			socket = socket_py;
			port_py = port;
		}

		if (socket instanceof Socket == true) {
			Logger.info(`Already active : Port ${port} on Host ${mayahost} for ${type}`);
			updateStatusBarItem(type);
		} else {
			socket = net.createConnection({ port: port, host: mayahost }, () => {
				Logger.info(`Connected : Port ${port} on Host ${mayahost} for ${type}`);
				updateStatusBarItem(type);
			});
			socket.on('error', function(error) {
				let errorMsg = `Unable to connect to port ${port} on Host ${mayahost} in Maya for ${type},\nError Code : ${
					error.code
				}`;
				Logger.error(errorMsg);
				vscode.window.showErrorMessage(errorMsg);
			});

			socket.on('data', function(data) {
				Logger.response(data.toString());
			});

			socket.on('end', () => {
				Logger.info(`Disconnected from server. ${type} | Port ${port} on Host ${mayahost}`);
				updateStatusBarItem(type);
			});
		}
		return socket;
	}

	function send(text: string, type: string) {
		let socket: Socket;
		if (type == 'mel') socket = socket_mel;
		if (type == 'python') socket = socket_py;

		socket.write(text);
		socket.write('\n');

		let successMsg = `Sent ${type} code to Maya`;
		Logger.info(successMsg);
		vscode.window.setStatusBarMessage(successMsg);
	}

	function getText(type: string) {
		let editor = vscode.window.activeTextEditor;
		let selection = editor.selection;
		let text: string;

		if (selection.isEmpty != true) {
			Logger.info(`Sending selected ${type} code to maya`);
			text = editor.document.getText(selection);
		} else {
			Logger.info(`Sending all ${type} code to maya`);
			text = editor.document.getText();
		}
		return text;
	}

	function registerDisposables() {
		return [
			vscode.window.onDidChangeActiveTextEditor(editor => {
				if (mayaportStatusBar !== undefined) {
					if (editor !== undefined) {
						if (['debug', 'output'].some(part => editor.document.uri.scheme === part)) {
							return;
						}
					}
					updateStatusBarItem(editor.document.languageId);
				}
			})
		];
	}

	const command_mel = vscode.commands.registerCommand('mayacode.sendMelToMaya', function() {
		socket_mel = ensureConnection('mel');
		let text = getText('mel');
		send(text, 'mel');
	});

	context.subscriptions.push(command_mel);

	const command_py = vscode.commands.registerCommand('mayacode.sendPythonToMaya', function() {
		socket_py = ensureConnection('python');
		let text = getText('python');
		send(text, 'python');
	});

	context.subscriptions.push(command_py);

	mayaportStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(mayaportStatusBar);

	context.subscriptions.push(...registerDisposables());
}

export function deactivate(context: vscode.ExtensionContext) {}
