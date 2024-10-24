import * as vscode from "vscode";
const packageJson = require("../package.json");

/** 注册通用命令 */
export const registerCommand = (
  context: vscode.ExtensionContext,
  callback: (document: vscode.TextDocument) => void
) => {
  const commandTitle = checkCommandValiate("checkCompatibility");
  if (!commandTitle) {
    throw new Error("无效注册");
  }
  let disposable = vscode.commands.registerCommand(commandTitle, () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      callback(document);
    }
  });
  context.subscriptions.push(disposable);
};

/** 检验命令合法性 */
const checkCommandValiate = (command: string): string => {
  const commandObj: PackageCommandType = packageJson.contributes.commands.find(
    (item: PackageCommandType) => item.title === command
  );
  return commandObj?.command;
};
