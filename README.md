# YADWF

> **Y**et **a**nother **D**eno **w**eb-**f**ramework

## Initial setup

```ts
import { YADWF } from "https://deno.land/x/yadwf@v0.2/mod.ts";

const app = new YADWF();

app.get("/", (ctx) => ctx.text("Hello World!"));

app.start({ port: 1337 });
```
