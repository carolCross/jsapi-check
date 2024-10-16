import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { checkChromeCompatibility } from './compatibilityChecker';
import * as compiler from '@vue/compiler-sfc';

function processVueFile(filePath: string) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // 使用 Vue 编译器解析 SFC
    const { descriptor } = compiler.parse(data);

    if (descriptor.script || descriptor.scriptSetup) {
      const scriptContent = (descriptor.script?.content || '') + (descriptor.scriptSetup?.content || '');
      const scriptOffset = descriptor.script?.loc.start.line || 0; // 获取脚本部分的起始行号

      // 执行兼容性检查
      const diagnostics = checkChromeCompatibility(scriptContent, currentChromeVersion);

      // 调整诊断信息的行号偏移
      diagnostics.forEach(diagnostic => {
        diagnostic.range = new vscode.Range(
          new vscode.Position(diagnostic.range.start.line + scriptOffset, diagnostic.range.start.character),
          new vscode.Position(diagnostic.range.end.line + scriptOffset, diagnostic.range.end.character)
        );
      });

      // 在这里处理 diagnostics，例如显示在输出面板或问题面板中
    }
  });
}

const currentChromeVersion = 80; // 你可以根据需要动态获取或设置

// 示例用法
processVueFile(path.join(__dirname, 'example.vue'));
