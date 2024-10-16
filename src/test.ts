import * as vscode from 'vscode';

let chromeVersion = 80; // 默认的 Chrome 版本

export function activate(context: vscode.ExtensionContext) {
  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = `Chrome Version: ${chromeVersion}`;
  statusBarItem.tooltip = 'Click to change Chrome version';
  statusBarItem.command = 'extension.changeChromeVersion';
  statusBarItem.show();


  vscode.commands.registerCommand('extension.changeChromeVersion', async (data) => {
	chromeVersion = data
    // 命令的实现逻辑
  })

  // 将状态栏项加入到扩展的订阅中
  context.subscriptions.push(statusBarItem);

  // 注册命令来更改 Chrome 版本
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.changeChromeVersion', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter the target Chrome version',
        value: chromeVersion.toString(),
        validateInput: (value) => isNaN(Number(value)) ? 'Please enter a valid number' : null
      });

      if (input) {
        chromeVersion = parseInt(input, 10);
        statusBarItem.text = `Chrome Version: ${chromeVersion}`;
        vscode.window.showInformationMessage(`Chrome version set to ${chromeVersion}`);
      }
    })
  );
}

export function deactivate() {}
