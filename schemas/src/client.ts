import { hc } from "hono/client";
import type { AppType } from "../../api/src/index";

export const client = hc<AppType>("https://api.linku.la/");
type a = Awaited<ReturnType<Awaited<ReturnType<(typeof client)["v1"]["fonts"][":font"]["$get"]>>["json"]>>;
//   ^?
export type ApiType = AppType;
