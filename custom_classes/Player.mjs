import {CharacterBody} from '../BaseClasses.mjs'


export class Player extends CharacterBody {
	constructor(name, position) {
		super(name, position)
	}
	ready(Game) {

		return this
	}
	process(Game, delta) {
		console.log(this.getGlobalPosition())
		
		const dir = [+Game.input.isActionPressed('right') - +Game.input.isActionPressed('left'), +Game.input.isActionPressed('down') - +Game.input.isActionPressed('up')]
		const speed = 1

		if (dir.some(value => value !== 0.0)) {
			this.getChild('anim_sprite').play('walk')
		} else {
			this.getChild('anim_sprite').play('idle')
		}

		if (dir[0]<0) {this.getChild('anim_sprite').isInvertedOnX = true}
		else if (dir[0]>0) {this.getChild('anim_sprite').isInvertedOnX = false}

		this.position = this.position.map((value, i) => value + (dir[i] * speed))

		return this
	}
}