#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 获取当前版本
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));
  return packageJson.version;
}

// 分析提交类型，自动确定版本更新类型
function analyzeCommits() {
  try {
    // 获取上次发布后的所有提交
    const lastTag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --oneline --format="%s"`, { encoding: "utf8" });
    
    let hasBreaking = false;
    let hasFeature = false;
    let hasFix = false;
    
    commits.split("").forEach(commit => {
      if (commit.includes("BREAKING CHANGE") || commit.includes("!:")) {
        hasBreaking = true;
      } else if (commit.startsWith("feat:")) {
        hasFeature = true;
      } else if (commit.startsWith("fix:")) {
        hasFix = true;
      }
    });
    
    if (hasBreaking) return "major";
    if (hasFeature) return "minor";
    if (hasFix) return "patch";
    return "patch"; // 默认
  } catch (error) {
    console.log("无法分析提交历史，使用默认patch版本");
    return "patch";
  }
}

// 主函数
function main() {
  const currentVersion = getCurrentVersion();
  console.log(`当前版本: ${currentVersion}`);
  
  const versionType = analyzeCommits();
  console.log(`建议版本类型: ${versionType}`);
  
  // 执行版本更新
  try {
    execSync(`yarn standard-version --release-as ${versionType}`, { stdio: "inherit" });
    console.log(`✅ 版本已更新为 ${versionType}`);
  } catch (error) {
    console.error("❌ 版本更新失败:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
