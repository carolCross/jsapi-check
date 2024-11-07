# JSAPI-Check for VS Code

JSAPI-Check 是一个为 Visual Studio Code 开发的插件，它帮助开发者识别并解决 JavaScript 代码中可能存在的浏览器兼容性问题。

## 功能

- **浏览器兼容性检查**：自动分析你的 JavaScript 代码，标识出可能不被所有目标浏览器支持的 API。
- - **支持不同chrome浏览器切换**：在 VS Code 问题窗口中直接显示不兼容的 API 以及相关的 MDN 文档链接。
- **详细问题报告**：在 VS Code 问题窗口中直接显示不兼容的 API 以及相关的 MDN 文档链接。

## 界面

![alt text](image-1.png)

![alt text](image.png)

![alt text](image-2.png)

## 安装

你可以通过以下方式安装 JSAPI-Check 插件：

### 通过 Visual Studio Code Marketplace

1. 打开 VS Code。
2. 转到 Extensions 视图（视图 -> 扩展或使用 `Ctrl+Shift+X` 快捷键）。
3. 在搜索框中输入 "JSAPI-Check"。
4. 找到 JSAPI-Check 插件，点击安装。

### 通过 VSIX 文件

如果你有 JSAPI-Check 的 `.vsix` 文件：
1. 打开 VS Code。
2. 转到 Extensions 视图。
3. 点击 `...` 更多操作菜单，选择 "Install from VSIX..."。
4. 选择你的 `.vsix` 文件并安装。

## 使用方法

安装插件后，JSAPI-Check 将自动在你打开的 JavaScript 文件中运行。如果发现任何兼容性问题，它们将显示在“问题”面板中。

你可以点击问题描述旁边的链接，查看更多关于不兼容 API 的详细信息和可能的解决方案。


## 设置

你可以通过修改 VS Code 设置来调整 JSAPI-Check 的行为：

```
"jsapiCheck.enable": true,
"jsapiCheck.targetBrowsers": ["last 2 versions", "not IE 11"]
```


## Changelog

[CHANGELOG](./CHANGELOG.md)

## License

[LICENSE](./LICENSE.txt)