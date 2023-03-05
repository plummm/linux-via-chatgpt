import * as vscode from "vscode";
export class Editor {
    constructor(context) {
        this.outputChannel = vscode.window.createOutputChannel("Linux via ChatGPT");
        this.context = context;
    }
    writeToConsole(text) {
        this.outputChannel.appendLine(text);
        this.outputChannel.show();
    }
    getHightlightedText() {
        const editor = vscode.window.activeTextEditor;
        if (editor != null) {
            const selection = editor.selection;
            if (!selection.isEmpty) {
                const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
                return editor.document.getText(selectionRange);
            }
        }
        return "";
    }
}
