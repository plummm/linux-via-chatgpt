// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ChatGptProvider } from './openai';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context) {
    const provider = new ChatGptProvider(context);
    const setup = vscode.commands.registerCommand('linux-via-chatgpt.setup', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: "GhatGPT API Key",
        });
        //vscode.window.showInformationMessage('Hello World from Linux-via-ChatGPT!');
        if (apiKey) {
            vscode.window.showInformationMessage(apiKey);
            const config = vscode.workspace.getConfiguration("linux-via-chatgpt");
            config.update("apiKey", apiKey, false);
            provider.prepareConversation(false);
        }
    });
    context.subscriptions.push(setup);
}
// This method is called when your extension is deactivated
export function deactivate() { }
