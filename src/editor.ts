import * as vscode from "vscode";

export interface IEditor {
    getHightlightedText(): string;
    replaceSelection(text: string, selectionCache?: vscode.Selection): void;
    isElement(): boolean;
}

export class Editor implements IEditor {
    private readonly context: vscode.ExtensionContext;
    private readonly outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext) { 
        this.outputChannel = vscode.window.createOutputChannel("Linux via ChatGPT");
        this.context = context;
    }

    writeToConsole(text: string): void {
        this.outputChannel.appendLine(text);
        this.outputChannel.show();
    }

    insertSelection(text: string, selectionCache?: vscode.Selection): void {
        const editor = vscode.window.activeTextEditor;
        if (editor != null) {
            const selection = selectionCache ?? editor.selection;
            editor.edit((editBuilder) => {
                editBuilder.insert(selection.start, text+"\n");
            });
        }
    }

    replaceSelection(text: string, selectionCache?: vscode.Selection): void {
        const editor = vscode.window.activeTextEditor;
        if (editor != null) {
          const selection = selectionCache ?? editor.selection;
          if (!selection.isEmpty) {
            editor.edit((editBuilder) => {
              editBuilder.replace(selection, text);
            });
          }
        }
    }

    isElement(): boolean {
        const text = this.getHightlightedText();
        let regexp = new RegExp('^[a-zA-Z0-9_\\->\\.\\*]+$');
        return regexp.test(text);
    }

    getHightlightedText(): string {
        const editor = vscode.window.activeTextEditor;
        if (editor != null) {
            const selection = editor.selection;
            if (!selection.isEmpty) {
                const selectionRange = new vscode.Range(
                    selection.start.line,
                    selection.start.character,
                    selection.end.line,
                    selection.end.character
                );
                return editor.document.getText(selectionRange);
            }
        }
        return "";
    }
}