import { hc } from "hono/client";
import type { AppType } from "../server";

export const client = (args?: { baseUrl?: string; fetch?: (typeof globalThis)["fetch"] }) => {
	const { baseUrl = "https://api.linku.la", fetch = globalThis.fetch } = args ?? {};
	return hc<AppType>(baseUrl, {
		fetch,
	});
};

export type ApiType = AppType;
