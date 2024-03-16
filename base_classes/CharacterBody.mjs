import {Node} from '../BaseClasses.mjs'


export class CharacterBody extends Node {
	constructor(name, position) {
		super(name, position)
		this.velocity = [0, 0]
	}
	ready(Game) {
		return this
	}
	process(Game, delta) {
		return this
	}
}