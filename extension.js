const vscode = require('vscode');
const path = require("path");
const fs = require('fs');
const { exec } = require('child_process');

function activate(context) {
	let sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	let disposable = vscode.commands.registerCommand('extension.lintFile', function () {
		
		let editor = vscode.window.activeTextEditor;
		// if no file opened or is not .js, stop
		if (!editor || path.extname(editor.document.fileName) != '.js') {
			vscode.window.showInformationMessage('Please open a .js file in order to run linting');
			return;
		}

		const fileName = editor.document.fileName;

		// find path where package.json is in
		var jsonFolder = path.dirname(fileName);
		while (!fs.existsSync(path.join(jsonFolder, 'package.json'))) {
			var newPath = path.join(jsonFolder, '../');
			if (newPath == jsonFolder) {
				// vscode.window.showInformationMessage('Could not find package.json file');
				// return;
				// if package.json not found, just use current directory
				jsonFolder = path.join(path.dirname(fileName), '../');
				break;
			}
			jsonFolder = newPath;
		}

		sbItem.color = 'white';
		sbItem.text = 'Linting...';
		sbItem.show();

		vscode.window.showInformationMessage('Linting file...');

		const errorMsg = function(text) {
			vscode.window.showInformationMessage('Linting error: ' + text);
			sbItem.hide();
		}

		const execCmd = function (cmd, text, callback) {
			if (text != null) {
				sbItem.text = text;
			}
			exec(cmd, { cwd: jsonFolder }, (err, stdout, stderr) => {
				if (err) {
					// ignore the angular service name 'error'
					if (stderr != 'The rule `angular/service-name` will be split up to different rules in the next version. Please read the docs for more information\n') {
						errorMsg(stderr);
						return;
					}
				}
				callback(stdout);
			});
		}

		const getConfig = function getConfig(name) {
			return vscode.workspace.getConfiguration().get(name);
		}

		// run commands
			execCmd('lebab --replace ' + fileName + ' ' + getConfig('maxlint.lebab'), 'Linting (lebab)...', function () {
				execCmd('prettier ' + getConfig('maxlint.prettier') + ' --write \"' + fileName + '"', 'Linting (prettier)...', function () {
					execCmd('eslint --quiet --fix ' + getConfig('maxlint.eslint') + ' \"' + fileName + '\"', 'Linting (eslint)...', function () {
						vscode.window.showInformationMessage('Linting completed!');
						sbItem.hide();
					});
				})
			});
		});
	//});

	context.subscriptions.push(sbItem);
	context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {
	sbItem.hide();
}
exports.deactivate = deactivate;