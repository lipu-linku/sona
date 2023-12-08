import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { BASE_URL, branches } from "../versioning";
import { Data } from "@linku/sona";
import { fromZodError } from "zod-validation-error";

const branch = branches.v1;

const app = new Hono();

app.get("/data", async (c) => {
	const data = await fetch(`${BASE_URL}/${branch}/raw/data.json`).then((r) => r.json());

	const parseRes = await Data.safeParseAsync(data);

	if (parseRes.success) return c.json(parseRes.data);
	else
		throw new HTTPException(500, {
			message: `Internal server error: ${fromZodError(parseRes.error)}`,
		});
});

app.get("/word/:word", async (c) => {
	const word = c.req.param("word");
	const languages = c.req.query("lang")?.split(",") ?? ["en"];
	// const data = 	
});

export default app;
