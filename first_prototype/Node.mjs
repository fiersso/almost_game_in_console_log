export class Node {
	constructor(name, position, layer) {
		this.name = name
		this.position = position
		this.children = []
		this.parent = null
		this.layer = layer
		this.variables = {}
	}
	process(GAME) {
		return this
	}
	ready(GAME) {
		return this
	}
	addChild(...childs) {
		childs.forEach((child) => {
			child.parent = this
			this.children.push(child)
		})
		return this
	}
	getParents() {
		const parents = [];

		(function recursive(child) {
			if (!child) return
			parents.push(child)
			recursive(child.parent)
		})(this.parent)

		return parents
	}
	getChild(childName) {
		return this.children.filter(child => child.name === childName)[0]
	}
	getGlobalPosition() {
		return this.getParents().reduce((global_pos, parent) => {
			return [global_pos[0]+parent.position[0], global_pos[1]+parent.position[1]]
		}, this.position)
	}
}

export class Root extends Node {

	constructor(name, position, layer) {
		super(name, position, layer)
	}

	applyToEachRecursiveChild(cb) {
		function recursive(node, cb) {
			node = cb(node)
			if(Array.isArray(node.children)) { 
				node.children = node.children.map(child => recursive(child, cb)) 
			}
			return node
		}
		this.children = recursive(this, cb).children
		return this
	}

	getAllRecursiveChild() {
		const allChildren = []
		function recursive(node) {
			allChildren.push(node)
			if(Array.isArray(node.children)) { 
				node.children.map(child => recursive(child)) 
			}
		}
		recursive(this)
		return allChildren
	}
}


export class Sprite extends Node {
	constructor(name, position, layer, sprite=[], color = "\x1b[5m", transparent = true) {
		super(name, position, layer)
		this.originalSprite = sprite
		this.flippedX = false
		this.transparent = transparent
		this.color = color
		this.flippedY = false
	}

	#flipX(sprite) {
		return sprite.map(row => row.split('').reverse().join(''))
	}

	#flipY(sprite) {
		
		return sprite.slice().reverse()
	}

	getSprite() {
		let sprite = this.originalSprite
		sprite = this.flippedX ? this.#flipX(sprite) : sprite
		sprite = this.flippedY ? this.#flipY(sprite) : sprite
		return sprite
	}
}

export class AnimationSprite extends Node {
	constructor(name, position, layer, animations, color, currentAnimationName, speed = 1, transparent = true) {
		super(name, position, layer)
		this.color = color === null ? `\x1b[5m`: color
		this.flippedX = false
		this.flippedY = false
		this.transparent = transparent
		this.isPlaying = false
		this.currentFrame = 0
		this.currentAnimationName = currentAnimationName
		this.animations = animations
		this.speed = speed
	}

	ready(GAME) {
		this.play(this.currentAnimationName, this.speed)
		return this
	}

	#flipX(sprite) {
		return sprite.map(row => row.split('').reverse().join(''))
	}

	#flipY(sprite) {
		return sprite.slice().reverse()
	}
	play(animationName, speed = 1) {
		this.speed = speed
		this.currentFrame = animationName === this.currentAnimationName ? this.currentFrame : 0;
		this.currentAnimationName = animationName
		!this.isPlaying && setTimeout(function NextFrame (node) {
			node.currentFrame = node.currentFrame < node.animations[node.currentAnimationName].length - 1 ? node.currentFrame + 1 : 0
			node.isPlaying && setTimeout(NextFrame, 1000/node.speed, node)
		}, 1000/this.speed, this)
		this.isPlaying = true
	}
	stop() {
		this.isPlaying = false
	}
	getSprite() {
		if (!this.currentAnimationName) {
			return []
		}
		let sprite = this.animations[this.currentAnimationName][this.currentFrame]
		sprite = this.flippedX ? this.#flipX(sprite) : sprite
		sprite = this.flippedY ? this.#flipY(sprite) : sprite
		return sprite
	}
}


export class Camera extends Node {
	constructor(name, position, layer, viewPortSize) {
		super(name, position, layer)
		this.viewPortSize = viewPortSize
	}
	process(GAME) {
		return this
	}
}
