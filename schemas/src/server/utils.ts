import { Taplo } from "@taplo/lib";
import { MiddlewareHandler } from "hono";

export const tomlMiddleware: MiddlewareHandler<{
	Variables: {
		toml: Taplo;
	};
}> = async (c, next) => {
	c.set("toml", await Taplo.initialize());
	await next();
};
