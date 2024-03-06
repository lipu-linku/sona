import { hc } from "hono/client";
import type { AppType } from "$server";

export const client = ({
	baseUrl = "https://api.linku.la/",
	fetchFunc = fetch,
}: {
	baseUrl: string;
	fetchFunc: typeof fetch;
}) =>
	hc<AppType>(baseUrl, {
		fetch: fetchFunc,
	});

export type ApiType = AppType;
