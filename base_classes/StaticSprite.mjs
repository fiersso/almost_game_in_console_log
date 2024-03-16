import {VisualNode} from '../BaseClasses.mjs'


export class StaticSprite extends VisualNode {
	constructor(
		name,
		position,
		layer,
		sprite = [],
		transparentSymbol = null,
		invertedAxes = [false, false]
	) {
		super(name, position, layer, transparentSymbol, invertedAxes)
		this.originalSprite = sprite
	}
	
	getSprite() {
		let sprite = this.originalSprite
		if (this.isInvertedOnX) { sprite = this._flipX(sprite) }
		if (this.isInvertedOnY) { sprite = this._flipY(sprite) }
		return sprite
	}
}