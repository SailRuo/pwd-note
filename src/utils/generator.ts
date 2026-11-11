export interface PasswordOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean; // 排除 0, O, I, l, 1 等
}

export function generatePassword(options: PasswordOptions): string {
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let numbers = "0123456789";
  let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (options.excludeAmbiguous) {
    upper = upper.replace(/[IO]/g, "");
    lower = lower.replace(/[l]/g, "");
    numbers = numbers.replace(/[01]/g, "");
  }

  let charset = "";
  if (options.useUpper) charset += upper;
  if (options.useLower) charset += lower;
  if (options.useNumbers) charset += numbers;
  if (options.useSymbols) charset += symbols;

  if (!charset) charset = lower + numbers;

  let result = "";
  const cryptoObj = window.crypto || (window as any).msCrypto;
  const values = new Uint32Array(options.length);
  cryptoObj.getRandomValues(values);

  for (let i = 0; i < options.length; i++) {
    result += charset[values[i] % charset.length];
  }

  return result;
}

export function formatEnvExport(title: string, apiKey: string): string {
  let varName = title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_");
  
  if (!varName.endsWith("_KEY") && !varName.endsWith("_TOKEN") && !varName.endsWith("_SECRET")) {
    varName += "_API_KEY";
  }

  return `export ${varName}="${apiKey}"`;
}

export function formatCurlHeader(apiKey: string, baseUrl?: string): string {
  const url = baseUrl || "https://api.example.com/v1/models";
  return `curl ${url} \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json"`;
}
