import { hc } from "hono/client";
import type { AppType } from "$server";

export const client = hc<AppType>("https://api.linku.la/");

export type ApiType = AppType;
