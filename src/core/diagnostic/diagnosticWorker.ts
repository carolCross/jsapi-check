import { parentPort } from "worker_threads";
import { analyzeCode } from "../astParse";
import { setChromeVersion } from "../versionControl";
import { DiagnosticPayload } from "./diagnosticTypes";

type WorkerRequest = {
  id: number;
  code: string;
  url: string;
  startLine?: number;
  chromeVersion: number;
};

type WorkerResponse = {
  id: number;
  diagnostics?: DiagnosticPayload[];
  error?: string;
};

if (!parentPort) {
  throw new Error("diagnostic worker needs parentPort");
}

parentPort.on("message", (message: WorkerRequest) => {
  try {
    setChromeVersion(message.chromeVersion);
    const diagnostics = analyzeCode(message.code, message.url, message.startLine);
    const response: WorkerResponse = { id: message.id, diagnostics };
    parentPort?.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id: message.id,
      error: error instanceof Error ? error.message : String(error),
    };
    parentPort?.postMessage(response);
  }
});
