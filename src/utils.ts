
  /** 文件类型 */
  export function getFileType(fileName: string): string {
    if (fileName.endsWith(".js")) {
      return "js";
    }
    if (fileName.endsWith(".ts")) {
      return "ts";
    }
    if (fileName.endsWith(".vue")) {
      return "vue";
    }
    if (fileName.endsWith(".tsx")) {
      return "tsx";
    }
    if (fileName.endsWith(".jsx")) {
      return "jsx";
    }
    return "unknown";
  }