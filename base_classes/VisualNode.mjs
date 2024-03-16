import {Node} from '../BaseClasses.mjs'


export class VisualNode extends Node {
	constructor(name, position, layer, transparentSymbol, invertedAxes = [false, false]) {
		super(name, position)
		this.layer = layer
		this.transparentSymbol = transparentSymbol
		this.isInvertedOnX = invertedAxes[0]
		this.isInvertedOnY = invertedAxes[1]
	}

	_flipX(sprite) {
		return sprite.map(row => [...row].reverse().join(''))
	}

	_flipY(sprite) {
		return [...sprite].reverse()
	}

	getSprite() {
		return []
	}
}