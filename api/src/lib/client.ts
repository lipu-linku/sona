import { hc } from "hono/client";
import type { AppType } from "$server";

export const client = (args?: {
	baseUrl?: string;
	fetch?: typeof fetch;
}) => {
	const { baseUrl, fetch } = args;
	return hc<AppType>(baseUrl, {
		fetch
	});
};

export type ApiType = AppType;
