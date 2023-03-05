import { Configuration, OpenAIApi } from "openai";
import * as vscode from "vscode";

export interface IChatGptProvider {
    prepareConversation(reset?: boolean): Promise<boolean>
}

export class ChatGptProvider implements IChatGptProvider {
    private openaiApi?: OpenAIApi;
    private sessionToken?: string;
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) { 
        this.context = context;
    }

	isApiReady(): boolean {
		return this.openaiApi != null;
	}

	isChatGptReady(): boolean {
		if (this.openaiApi == null) {
			const workspaceConfig = vscode.workspace.getConfiguration("linux-via-chatgpt");
			const key = workspaceConfig.get("apiKey", "");
			this.context.secrets.store("apiKey", key);
			try {
				const configuration = new Configuration({
					apiKey: key,
				  });
				this.openaiApi = new OpenAIApi(configuration);
                vscode.window.showInformationMessage("linux-via-ChatGPT is ready to use");
				this.sendMessage("Hi");
				return true;
			} catch (error: any) {
				vscode.window.showErrorMessage("Failed to instantiate the ChatGPT API.", error?.message);
				return false;
			}
		}
		return true;
	}

	async explainCode(code: string) {
        let message = "Hi ChatGPT, I want you to explain code from Linux kernel with the best of your knowledge but you have to the following rules:\n\
        The following 3 rules, you try your best to follow them:\n\
		a. If a comment is longer than 15 words, use multi-line comments instead.\n\
		b. You do not need to explain simple if conditions, for loops, while loops or simple assignment operations.\n\
		c. If you encounter an unfamiliar variable or function call, try to explain it by starting with the name of that variable or function followed by a colon.\n\
		The following 10 rules are the rules that you must follow under any circumstances:\n\
		1. You are allowed to skip lines you don't understand.\n\
		2. You cannot guess or make up things you're not sure about.\n\
		3. If you have conflicting answers to the same line of code, list them all as bullet points.\n\
		4. If you cannot confirm the answer, add a comment \"[Guessing]\" before commenting.\n\
		5. Each of your comments should appear as code comments, following the original lines of code you're explaining.\n\
		6. Each of your comments should start with \"//[linux-via-chatgpt]\".\n\
		7. Each of your comments should appear as a new line.\n\
		8. Each of your comments should appear on top of the original line of code you're explaining.\n\
		9. You can insert comments between lines of code, but the original code must not be changed.\n\
		Now, please explain this code to me:\n" + code;
        return await this.sendMessage(message);
    }

	async explainElement(element: string, detail: boolean) {
		let message = "Hi ChatGPT, I want you to explain variable or function from Linux kernel with the best of your knowledge but you have to the following rules:\n\
		1. You are allowed to say you don't know the answer.\n\
		2. If you cannot confirm the answer, start with \"[Guessing]\" in your answer.\n\
		3. Your answer must start with \"//[linux-via-chatgpt]\".\n\
		4. If your answer is longer than 15 words, split the answer to multiple lines, each line should also start with \"//\"";
		if (detail) {
			message += "Now, please explain this variable or function from Linux kernel source code to me:\n" + element;
		} else {
			message += "Now, please explain this variable or function from Linux kernel source code to me in a paragraph(Also obey rule 4):\n" + element;
		}
		return await this.sendMessage(message);
	}
	
	async sendMessage(message: string): Promise<string> {
		try {
			const response = await this.openaiApi!.createChatCompletion({
				messages: [{"role": "system", "content": message}],
				model: "gpt-3.5-turbo"
			});
			return response!.data.choices[0]['message']!['content'] ?? "";
		} catch (error: any) {
			this.openaiApi = undefined;
			vscode.window.showErrorMessage("Failed to send the query, check the internet connection and API key.", error?.message);
			return "";
		}
	}

    async prepareConversation(reset?: boolean): Promise<boolean> {
        this.sessionToken = await this.context.secrets.get("apiKey");

		if (this.sessionToken == null) {
			const apiKey = await vscode.window.showInputBox({
				prompt: "GhatGPT API Key",
			});
		}

		if (reset || this.openaiApi == null) {
			try {
				const configuration = new Configuration({
					apiKey: this.sessionToken,
				  });
				this.openaiApi = new OpenAIApi(configuration);
                vscode.window.showInformationMessage("linux-via-ChatGPT is ready to use");
				this.sendMessage("Hi");
			} catch (error: any) {
				vscode.window.showErrorMessage("Failed to instantiate the ChatGPT API.", error?.message);
				return false;
			}
		}

		return true;
    }
} 