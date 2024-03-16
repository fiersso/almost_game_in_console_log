import {Node} from '../BaseClasses.mjs'


export class Camera extends Node {
	constructor(name, position, viewPortSize, voidSymbol = ' ', windowBordersSymbol = '▒', isColorPicture = true) {
		super(name, position)
		this.viewPortSize = viewPortSize
		this.isColorPicture = isColorPicture
		this.voidSymbol = voidSymbol
		this.windowBordersSymbol = windowBordersSymbol
	}
}
