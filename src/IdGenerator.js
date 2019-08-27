/* @flow */

export opaque type Id: number = number

export class IdGenerator {
	id = 0

	next(): Id {
		return this.id++
	}
}
