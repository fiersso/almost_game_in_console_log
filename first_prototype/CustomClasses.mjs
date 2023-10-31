import {Node} from './Node.mjs'


export class Player extends Node {
	constructor(name, position, layer) {
		super(name, position, layer)
		this.variables = {
			isWalk: false,
			dialog: false,
		}
	}
	ready(GAME) {
		this.getChild('camera').getChild('dialogBox').start([
			'hello vsdjsdv sdvjsdvnj sdvjsdvnsv sdjvs jdvsdj sjdvns dnvjsdnv sdjv sjdv sjd jsd sd vjsj vdnsv sjnsd v',
			'u buswfewe wefffwe  fw eftar',
			'wefwe wef w, wefwfe efwfwef, wefwf wefwf... :<'
		])
		setTimeout(() => {
			this.getChild('camera').getChild('dialogBox').start([
				'Wow...',
				'You`ve been here a long time.',
			])
			setTimeout(() => {
				this.getChild('camera').getChild('dialogBox').start([
					'Well, for a VERY long time.',
				])
			}, 15_000)
		}, 25_000)
		return this
	}
	process(GAME) {
		const isWalking = this.variables.isWalk && this.isPressedMoveAction(GAME)
		if (isWalking) {
			this.getChild('CatSprite').play('walk', 20)
		} else {
			this.getChild('CatSprite').play('idle')
		}
		this.move(GAME)

		const Wdir = [GAME.isActionPressed('windowXUp') - GAME.isActionPressed('windowXDown'), GAME.isActionPressed('windowYDown') - GAME.isActionPressed('windowYUp')]
		this.getChild('camera').viewPortSize = this.getChild('camera').viewPortSize.map((coord, i) => coord + Wdir[i])
		
		this.variables.isWalk = this.isPressedMoveAction(GAME)
		return this
	}
	isPressedMoveAction(GAME) {
		return (GAME.isActionPressed('right') || GAME.isActionPressed('left') || GAME.isActionPressed('down') || GAME.isActionPressed('up'))
	}
	move(GAME) {
		if (GAME.isActionPressed('left')) {
			this.getChild('CatSprite').flippedX = true
		} else if (GAME.isActionPressed('right')) {
			this.getChild('CatSprite').flippedX = false
		}
		const dir = [GAME.isActionPressed('right') - GAME.isActionPressed('left'), GAME.isActionPressed('down') - GAME.isActionPressed('up')]
		this.position = this.position.map((coord, i) => coord + dir[i])
	}
}

export class Bird extends Node {
	constructor(name, position, layer) {
		super(name, position, layer)
		this.variables = {
			dir: [1, 0],
		}
	}
	ready (GAME) {
		this.getChild('sprite').play('fly', 2)
		return this
	}
	process(GAME) {
		if (this.position[0] >= 200 && this.variables.dir[0] > 0) {
			this.variables.dir[0] = -1
		}
		if (this.position[0] <= -150 && this.variables.dir[0] < 0) {
			this.variables.dir[0] = 1
		}
		this.position = this.position.map((coord, i) => coord + this.variables.dir[i])
		return this
	}
}

