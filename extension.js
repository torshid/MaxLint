const vscode = require('vscode');
const path = require("path");
const fs = require('fs');
const { exec } = require('child_process');

function activate(context) {
	let sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	
	let lintFileCommand = vscode.commands.registerCommand('extension.lintFile', () => {
		
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

		const errorMsg = text => {
			vscode.window.showErrorMessage('Linting error: ' + text);
			sbItem.hide();
		};

		const execCmd = (cmd, text, callback, condition) => {
			if (condition != null && !condition) {
				callback();
				return;
			}
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
		};

		// run commands
		execCmd('lebab --replace ' + fileName + ' ' + getConfig('maxlint.lebab'), 'Linting (lebab)...', () => {
			execCmd('prettier ' + getConfig('maxlint.prettier') + ' --write \"' + fileName + '"', 'Linting (prettier)...', () => {
				execCmd('eslint --quiet --fix ' + getConfig('maxlint.eslint') + ' \"' + fileName + '\"', 'Linting (eslint)...', () => {
					vscode.window.showInformationMessage('Linting completed!');
					sbItem.hide();
				}, getConfig('maxlint.eslint_'));
			}, getConfig('maxlint.prettier_'));
		}, getConfig('maxlint.lebab_'));
	});

	let disableLintCommand = vscode.commands.registerCommand('extension.disableLint', () => {
		const editor = vscode.window.activeTextEditor;
		const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
		const selection = editor.selection;

		// filter eslint errors
		let errors = [];
		for (var idx in diagnostics) {
			console.log(diagnostics[idx].source)
			if (diagnostics[idx].source === "eslint"
				&& diagnostics[idx].range.start.line >= selection.start.line
			&& diagnostics[idx].range.end.line <= selection.end.line)
			{
				errors.push(diagnostics[idx].code);
			}
		}
		errors = errors.length > 0 ? ' ' + errors.join(', ') : '';

		const text = editor.document.getText(selection);

		let spaces = text.match(/^([\s]+)/g);
		spaces = spaces == null ? '' : spaces[0];

		// single line comment
		if (selection.isSingleLine || (selection.end.line - selection.start.line === 1 && selection.end.character === 0)) {
			editor.edit(builder => builder.replace(selection, spaces + '// eslint-disable-next-line' + errors + '\n' + text));
		}
		// multiline comment
		else {
			const comment = spaces + '/* eslint-disable' + errors + ' */';
			editor.edit(builder => builder.replace(selection, comment + '\n' + text + '\n' + comment));
		}
	});

	context.subscriptions.push(sbItem);
	context.subscriptions.push(lintFileCommand);
	context.subscriptions.push(disableLintCommand);
}

exports.activate = activate;

function deactivate() {
	sbItem.hide();
}
exports.deactivate = deactivate;