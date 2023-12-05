export const branches = {
	v1: "main",
} as const satisfies Record<`v${number}`, string>;
