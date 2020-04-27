'use strict';

import * as vscode from 'vscode';
import * as data from './completions.json';

import { Socket } from 'net';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

var net = require('net');
import TelemetryReporter from 'vscode-extension-telemetry';

let mayaportStatusBar: vscode.StatusBarItem;
let socket_mel: Socket;
let port_mel: string;
let reporter: TelemetryReporter; // telemetry reporter 

// all events will be prefixed with this event name
// extension version will be reported as a property with each event 
const extensionId = 'saviof.mayacode';
const extensionVersion = vscode.extensions.getExtension(extensionId).packageJSON.version;

// the application insights key (also known as instrumentation key)
const key = '9f14526e-33c3-420b-a5ff-2bdab837dc10';

function updateStatusBarItem(langID?: string): void {
	let text: string;
	if (langID == 'python' || langID == 'mel') {
		if (socket_mel instanceof Socket == true && socket_mel.destroyed == false) {
			text = `Maya Port : ${port_mel}`;
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

	public static info(log: string) {
		this.typeLog(log, 'INFO');
	}

	public static error(log: string) {
		this.typeLog(log, 'ERROR');
		vscode.window.showErrorMessage(log);
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
		this._outputPanel.appendLine(util.format('MayaCode-%s [%s][%s]\t %s', extensionVersion, time, type, log));
	}
}

export function activate(context: vscode.ExtensionContext) {
	let outputPanel = vscode.window.createOutputChannel('Maya');
	Logger.registerOutputPanel(outputPanel);

	let cmds: Array<string> = [];
	let words: Array<string> = [];
	let seen_splits: Array<string> = [];
	let completions: Array<vscode.CompletionItem> = [];
	let word_completions: Array<vscode.CompletionItem> = [];
	let var_completions: Array<vscode.CompletionItem> = [];
	let lastStackTrace: string;
	const timeOpened = Date.now()

	var config = vscode.workspace.getConfiguration('mayacode');

	// create telemetry reporter on extension activation
	// ensure it gets property disposed
	reporter = new TelemetryReporter(extensionId, extensionVersion, key);
	context.subscriptions.push(reporter);
	reporter.sendTelemetryEvent('start', {})

	function sendError(error: Error, code: number=0, category='typescript'){
		if(config.get('telemetry')){
			if(error.stack == lastStackTrace) return
			Logger.info(`Sending error event`);
			reporter.sendTelemetryException(error, {
                code: code.toString(),
                category,
			})
			lastStackTrace = error.stack
		}
	}

	function sendEvent(event: string, execTime: number=0, fileType:string){
		if(config.get('telemetry')){
			const measurements: {[key: string]: number} = {}
			measurements['timeSpent'] = (Date.now() - timeOpened)/1000
			measurements['execTime'] = execTime

			const properties: {[key: string]: string} = {}
			properties['fileType'] = fileType

			Logger.info(`Sending event`);
			reporter.sendTelemetryEvent(event, properties, measurements)
		}
	}

	function ensureConnection(type: string) {
		let socket;
		let mayahost: string = config.get('hostname');
		let port: string = config.get('mel.port');

		socket = socket_mel;
		port_mel = port;

		if (socket instanceof Socket == true && socket.destroyed == false) {
			Logger.info(`Already active : Port ${port} on Host ${mayahost} for ${type}`);
			updateStatusBarItem(type);
		} else {
			socket = net.createConnection({ port: port, host: mayahost }, () => {
				Logger.info(`Connected : Port ${port} on Host ${mayahost} for ${type}`);
				updateStatusBarItem(type);
			});
			socket.on('error', function(error) {
				let errorMsg = `Unable to connect using port ${port} on Host ${mayahost}   \nPlease run the below mel command in Maya\`s script editor 

				commandPort -n "${mayahost}:${port}" -stp "mel" -echoOutput;

				Error Code : ${error.code}`;
				Logger.error(errorMsg);
				sendError(error, error.code, 'socket')
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

	function send_tmp_file(text: string, type: string) {
		let cmd:string, nativePath:string, posixPath:string;
		var start = new Date().getTime();

		if (type == 'python') {
			//add encoding http://python.org/dev/peps/pep-0263/
			text = "# -*- coding: utf-8 -*-\n" + text;
			nativePath = path.join(os.tmpdir(), "MayaCode.py");
			posixPath = nativePath.replace(/\\/g, "/");
			cmd = `python("execfile('${posixPath}')")`;
		}

		if (type == 'mel') {
			nativePath = path.join(os.tmpdir(), "MayaCode.mel");
			posixPath = nativePath.replace(/\\/g, "/");
			cmd = `source \"${posixPath}\";`;
		}

		Logger.info(`Writing text to ${posixPath}...`);
		fs.writeFile(nativePath, text, function (err) {
			if (err) {
				Logger.error(`Failed to write ${type} to temp file ${posixPath}`);
				sendError(err, 1, 'filewrite')
			} else {
				Logger.info(`Executing ${cmd}...`);
				send(cmd, type);
				var end = new Date().getTime();
				var time = end - start;
				sendEvent("send_tmp_file", time, type)
			}
		});
	}

	function send(text: string, type: string) {
		let success: boolean = socket_mel.write(text + '\n');
		Logger.info(text);
		if (success){
			let successMsg = `Sent ${type} code to Maya...`;
			Logger.info(successMsg);
			vscode.window.setStatusBarMessage(successMsg);
		}
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

	function isNumeric(value) {
		return /^-{0,1}\d+$/.test(value);
	}

	function process_completions(documentText:string) {
		var start = new Date().getTime();

		if (completions.length == 0) {
			Logger.info(`Building command completions`);

			data['completions'].forEach(this_item => {
				words.push(this_item['trigger']);
				let item = new vscode.CompletionItem(this_item['trigger'], vscode.CompletionItemKind.Function);
				item.detail = this_item['trigger'];
				item.documentation = this_item['comment'];
				completions.push(item);
			});
			var end = new Date().getTime();
			var time = end - start;
			sendEvent("build-completions", time, "mel")
		}

		const _splitTexts = documentText.split(/[^A-Za-z\$1-9]+/);
		_splitTexts.forEach(_word => {
			if (seen_splits.indexOf(_word) == -1) {
				seen_splits.push(_word);
				let isVariable = false;
				_word = _word.trim();
				if (_word.startsWith('$')) {
					isVariable = true;
					_word = _word.replace('$', '');
				}

				//negate all numbers and aready added items
				if (!isNumeric(_word) && words.indexOf(_word) == -1) {
					words.push(_word);
					if (isVariable) {
						var_completions.push(new vscode.CompletionItem(_word, vscode.CompletionItemKind.Variable));
					} else {
						word_completions.push(new vscode.CompletionItem(_word, vscode.CompletionItemKind.Text));
					}
				}
			}
		});

		var end = new Date().getTime();
		var time = end - start;
		Logger.info(`Completion execution time: ${time}`);
	}

	function getHoverText(url: string, documentation:string): vscode.MarkdownString {
		const text = `${documentation}\n\n[Read Online Help](${url})`;
		return new vscode.MarkdownString(text);
	}

	let hoverProviderMELdisposable = vscode.languages.registerHoverProvider("mel", {
			provideHover(document: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

				if (cmds.length == 0) {
					Logger.info(`Building cmds`);

					data['completions'].forEach(this_item => {
						cmds.push(this_item['trigger']);
					});
				}

				const range = document.getWordRangeAtPosition(pos);

				if (range === undefined) {
					return;
				}

				const word = document.getText(range);

				if (cmds.indexOf(word) > -1){
					const helpUrl = `http://help.autodesk.com/cloudhelp/2017/ENU/Maya-Tech-Docs/Commands/${word}.html`;
					let documentation = '';
					data['completions'].forEach(this_item => {
						if (this_item['trigger'] == word) {
							documentation = this_item['comment'].replace(/\n/g, "  \n");
						}
					});
					return new vscode.Hover(getHoverText(helpUrl, documentation));
				}

				return;
			}
		}
	);

	context.subscriptions.push(hoverProviderMELdisposable);

	const provider_all = vscode.languages.registerCompletionItemProvider('mel', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token, context) {

			process_completions(document.getText());
			return [...word_completions, ...completions];
		}
	});

	const provider_vars = vscode.languages.registerCompletionItemProvider('mel', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token, context) {

			process_completions(document.getText());
			return [...var_completions];
		}
	}, '$');

	context.subscriptions.push(provider_all);
	context.subscriptions.push(provider_vars);

	const command_mel = vscode.commands.registerCommand('mayacode.sendMelToMaya', function() {
		socket_mel = ensureConnection('mel');
		if (!socket_mel.destroyed) {
			let text = getText('mel');
			send_tmp_file(text, 'mel');
		}
	});

	context.subscriptions.push(command_mel);

	const command_py = vscode.commands.registerCommand('mayacode.sendPythonToMaya', function() {
		socket_mel = ensureConnection('python');
		if (!socket_mel.destroyed) {
			let text = getText('python');
			send_tmp_file(text, 'python');
		}
	});

	context.subscriptions.push(command_py);

	mayaportStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(mayaportStatusBar);

	context.subscriptions.push(...registerDisposables());
}

export function deactivate(context: vscode.ExtensionContext) {
	// This will ensure all pending events get flushed
	reporter.dispose();
}
