/* @flow */

export async function delay(duration: number) {
	return new Promise((resolve) => setTimeout(resolve, duration))
}

export const voidF = () => {}
