// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ChatGptProvider } from './openai';
import { Editor } from './editor';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new ChatGptProvider(context);
	const editor = new Editor(context);
	
	const setup = vscode.commands.registerCommand('linux-via-chatgpt.setup', async () => {
		const apiKey = await vscode.window.showInputBox({
			prompt: "GhatGPT API Key",
		});
		//vscode.window.showInformationMessage('Hello World from Linux-via-ChatGPT!');
		if (apiKey) {
			const workspaceConfig = vscode.workspace.getConfiguration("linux-via-chatgpt");
			workspaceConfig.update("apiKey", apiKey, false);
			context.secrets.store("apiKey", apiKey);
			provider.prepareConversation(false);
		}
	});

	const explain = vscode.commands.registerCommand('linux-via-chatgpt.explain', async () => {
		if (provider.isChatGptReady()) {
			const e = vscode.window.activeTextEditor;
			if (e == null) {
				return;
			}
			const selection = e.selection;
			const codeSnippet = editor.getHightlightedText();
			if (codeSnippet) {
				vscode.window.showInformationMessage("ChatGPT is thinking");
				if (editor.isElement()) {
					const response = await provider.explainElement(codeSnippet, false);
					if (response != null) {
						editor.insertSelection(response, selection);
					}
				} else {
					const response = await provider.explainCode(codeSnippet);
					if (response != null) {
						editor.replaceSelection(response, selection);
					}
				}
				vscode.window.showInformationMessage("ChatGPT is done");
			}
		} else {
			vscode.window.showInformationMessage("ChatGPT is not ready. Try ChatGPT: Setup");
		}
	});

	context.subscriptions.push(setup, explain);
}

// This method is called when your extension is deactivated
export function deactivate() {}
