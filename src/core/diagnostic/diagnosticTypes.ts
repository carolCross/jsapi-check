export type DiagnosticSeverityLevel = "error" | "warning" | "info" | "hint";

export type DiagnosticRange = {
  start: { line: number; character: number };
  end: { line: number; character: number };
};

export type DiagnosticPayload = {
  range: DiagnosticRange;
  message: string;
  mdnUrl?: string;
  severity: DiagnosticSeverityLevel;
};
