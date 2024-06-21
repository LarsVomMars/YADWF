export function getPaths(path: string): string[] {
  if (path.startsWith("/")) path = path.slice(1);
  if (path.endsWith("/")) path = path.slice(0, -1);
  return path.split("/");
}
