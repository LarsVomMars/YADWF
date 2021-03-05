import { join } from "./deps.ts";

export async function getNestedDirectories(dirname: string): Promise<string[]> {
  let items: string[] = [];
  for await (const item of Deno.readDir(dirname)) {
    if (item.isDirectory) {
      items.push(item.name);
      const jp = join(dirname, item.name);
      let dirs = await getNestedDirectories(jp);
      dirs = dirs.map((subdir) => join(item.name, subdir));
      items = items.concat(dirs);
    }
  }
  return items;
}
