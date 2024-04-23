import { hc } from "hono/client";
import type { AppType } from "$server";

export const client = (args?: { baseUrl?: string; fetch?: (typeof global)["fetch"] }) => {
	const { baseUrl = "https://api.linku.la", fetch = global.fetch } = args;
	return hc<AppType>(baseUrl, {
		fetch,
	});
};

export type ApiType = AppType;
