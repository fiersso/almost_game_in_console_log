import {VisualNode} from '../BaseClasses.mjs'


export class AnimatedSprite extends VisualNode {
	constructor(
			name,
			position,
			layer,
			animations,
			playImmediately = null,
			transparentSymbol = null,
			invertedAxes = [false, false]
	) {
		super(name, position, layer, transparentSymbol, invertedAxes)
		this.isPlaying = false
		this.animations = animations
		this.lifetime = 0
		this.currentAnimation = playImmediately
		this.animationSpeed = this.animations?.[this.currentAnimation].speed || 1.0
		this.currentFrame = 0
	}
	play(animationName, speed = null) {
		if (this.isPlaying && animationName === this.currentAnimation) {return}
		this.isPlaying = true
		this.currentFrame = 0
		this.currentAnimation = animationName
		this.animationSpeed = speed || (this.animations?.[animationName].speed || 1.0)
	}
	stop() {
		this.isPlaying = false
		this.currentFrame = 0
	}
	ready(Game) {
		if (this.currentAnimation in this.animations) {
			this.play(this.currentAnimation, this.animationSpeed)
		}
		return this
	}
	process(Game, delta) {
		if (this.isPlaying) {
			this.lifetime += delta * this.animationSpeed 
			this.lifetime = (this.lifetime/1_000 >= (this.animations[this.currentAnimation].frames.length)) ? 0 : this.lifetime
			this.currentFrame = Math.floor(this.lifetime/1_000)
		}
		return this
	}
	getSprite() {
		let sprite = this.animations[this.currentAnimation].frames[this.currentFrame]
		if (this.isInvertedOnX) { sprite = this._flipX(sprite) }
		if (this.isInvertedOnY) { sprite = this._flipY(sprite) }
		return sprite
	}
}