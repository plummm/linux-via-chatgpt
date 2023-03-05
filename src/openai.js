import { Configuration, OpenAIApi } from "openai";
import * as vscode from "vscode";
export class ChatGptProvider {
    constructor(context) {
        this.context = context;
    }

    async explainCode(code) {
        message = "Hi ChatGPT, I am trying to understand this code from Linux kernel.\n\
        I want you to explain this code snippet to me with the best of your knowledge.\n\
        You are allowed to skip the lines that you don't understand.\n\
        You cannot guess or make up things that you don't know or do not sure about.\n\
        If you have multiple conflicting answers to the same line of code, please list them all in a bullet points\n\
        If you cannot confirm the answer, please add a comment \"[Guessing]\" before you say anyting about this line.\n\
        All you explainations should be in the code box and appear as comments behind the code.\n\
        Now, please explain this code to me:\n" + code;
        return await this.sendMessage(message);
    }

    async sendMessage(message) {
        var _a, _b;
        const response = await ((_a = this.openaiApi) === null || _a === void 0 ? void 0 : _a.createCompletion({
            prompt: message,
            max_tokens: 1200,
            temperature: 0.5,
            model: "text-davinci-003",
        }));
        return (_b = response === null || response === void 0 ? void 0 : response.data.choices[0].text) !== null && _b !== void 0 ? _b : "";
    }

    async prepareConversation(reset) {
        this.sessionToken = await this.context.secrets.get("apiKey");
        if (this.sessionToken == null) {
            await vscode.window
                .showInputBox({
                title: "OpenAPI ChatpGPT session token",
                prompt: "Please enter your OpenAPI session token (__Secure-next-auth.session-token). See Readme for more details on how to get the session token",
                ignoreFocusOut: true,
                placeHolder: "Enter the JWT Token starting with ey***"
            })
                .then((value) => {
                reset = true;
                this.sessionToken = value;
                this.context.globalState.update("chatgpt-session-token", this.sessionToken);
            });
        }
        if (reset || this.openaiApi == null) {
            try {
                const configuration = new Configuration({
                    apiKey: process.env.OPENAI_API_KEY,
                });
                this.openaiApi = new OpenAIApi(configuration);
                let res = await this.sendMessage('What is OpenAI?');
                vscode.window.showInformationMessage(res);
            }
            catch (error) {
                vscode.window.showErrorMessage("Failed to instantiate the ChatGPT API. Try ChatGPT: Clear session", error === null || error === void 0 ? void 0 : error.message);
                return false;
            }
        }
        return true;
    }
}
