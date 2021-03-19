import { extname } from "./deps.ts";

export function getContentType(filename: string): string {
  const extension = extname(filename);
  return extensions[extension] || "application/octet-stream";
}

export const utf8 = "charset=UTF-8";

export const extensions: Record<string, string> = {
  ".html": `text/html;${utf8}`,
  ".css": `text/css;${utf8}`,
  ".js": `text/javascript;${utf8}`,
  ".jsx": `text/javascript;${utf8}`,
  ".jpg": `image/jpeg`,
  ".jpeg": `image/jpeg`,
  ".png": `image/png`,
  ".pdf": `application/pdf;${utf8}`,
  ".svg": `image/svg+xml`,
  ".json": `application/json;${utf8}`,
  ".txt": `text/plain;${utf8}`,
};
