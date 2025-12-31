import { parentPort } from "worker_threads";
import { analyzeCode } from "../astParse";
import { setBrowserTarget, setBrowserVersion } from "../versionControl";
import { DiagnosticPayload } from "./diagnosticTypes";
import type { BrowserTarget } from "../../utils/constant";

type WorkerRequest = {
  id: number;
  code: string;
  url: string;
  startLine?: number;
  browserVersion: number;
  browserTarget: BrowserTarget;
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
    setBrowserTarget(message.browserTarget);
    setBrowserVersion(message.browserVersion);
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
