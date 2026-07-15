export function resolvePath(currentDir: string, raw: string): string {
  if (raw.startsWith("/")) return raw;
  const base = currentDir.endsWith("/") ? currentDir : `${currentDir}/`;
  return `${base}${raw}`;
}

export function normalizeDir(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function basename(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

export function dirnameOf(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
}
