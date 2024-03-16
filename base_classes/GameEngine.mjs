import {Camera, VisualNode} from '../BaseClasses.mjs'


export class GameEngine {
	_onPause = false
	_listeningToInput = false

	setListeningToInput(value) {
		this._listeningToInput = value
	}

	_startListeningToInput() {
		this._listeningToInput = true
		const stdin = process.stdin
		stdin.setRawMode(true)
		stdin.setEncoding('utf8')
		stdin.on('data', (key) => {
			if (!this._listeningToInput) return
			this.input.keyPressed = key
			if (this.input.isActionPressed('break_game_cycle')) this.close()
			if (this.input.isActionPressed('switch_pause')) this.setPause(!this.getPauseState())
		})
	}

	setPause(value) {
		this._onPause = value
		// !value && this._process(Date.now())
	}

	getPauseState() {
		return this._onPause
	}

	_recursivelyApplyToEachChild(cb) {
		function recursion(node, cb) {
			node = cb(node)
			if(Array.isArray(node.getChildren())) { 
				node.setChildren(node.getChildren().map(child => recursion(child, cb)))
			}
			return node
		}
		this.root.setChildren(recursion(this.root, cb).getChildren())
		return this.root
	}

	_getAllChildrenRecursively() {
		const allChildren = []
		function recursion(node) {
			allChildren.push(node)
			if(Array.isArray(node.getChildren())) { 
				node.getChildren().forEach(child => recursion(child)) 
			}
		}
		recursion(this.root)
		return allChildren
	}

	close() {
		process.exit()
	}

	_getLayers() { 
		const allChildren = this._getAllChildrenRecursively()

		allChildren.sort((childA, childB) => {
			return childA.layer - childB.layer
		})

		return allChildren.reduce((layers, child, i) => {
			if (i === 0) {
				return [...layers, [child]]
			}
			if (allChildren[i].layer == allChildren[i-1].layer) {
				layers[layers.length-1].push(child)
				return layers
			}
			return [...layers, [child]]
		}, [])
	}

	constructor(root_node, fps) {
		this.root = root_node
		this.fps = fps
		this.input = {
			actions: {
				'\u0003': 'break_game_cycle',
				'0': 'switch_pause',
				'w': 'up',
				's': 'down',
				'd': 'right',
				'a': 'left',
				'e': 'interaction',
			},
			keyPressed: null,
			getActionPressed: () => this.input.actions?.[this.input.keyPressed] || null,
			isActionPressed: (action) => (action === this.input.actions?.[this.input.keyPressed]),
			isKeyPressed: (key) => (key === this.input.keyPressed),
		}
	}

	start() {
		this.root = this._recursivelyApplyToEachChild((child) => child.ready(this))

		this._startListeningToInput()
		this._process(Date.now())
	}

	_process(timeLastProcess) {
		const callTime = Date.now()
		const delta = (callTime - timeLastProcess)

		this._drawFrame()
		console.log(`pause: ${this.getPauseState()}`)
		console.log('console:')

		if (!this.getPauseState()) {
			this.root = this._recursivelyApplyToEachChild((child) => child.process(this, delta))
		}

		setTimeout((callTime) => {
			this._process(callTime)
		}, 1_000/this.fps, callTime)
		this.input.keyPressed = null
	}

	_drawFrame() {
		const CurrentCamera = this._getAllChildrenRecursively().find(child => child instanceof Camera)
		if (!CurrentCamera) {
			console.clear()
			console.log('Сamera is missing.')
			return
		}
		let canvas = JSON.parse(JSON.stringify(Array(CurrentCamera.viewPortSize[1]).fill(Array(CurrentCamera.viewPortSize[0]).fill(CurrentCamera.voidSymbol))))

		function renderSprite(canvas, positionOnCanvas, sprite, transparentSymbol) {
			sprite.forEach((row, i) => {
				const spriteRowPositionOnCanvas = positionOnCanvas[1] + i
				row.split('').forEach((pixel, j) => {
					const spritePixelPositionOnCanvas = positionOnCanvas[0] + j
					if (pixel === transparentSymbol) {return}
					if (
						spriteRowPositionOnCanvas >= canvas.length || spriteRowPositionOnCanvas < 0
						|| spritePixelPositionOnCanvas >= CurrentCamera.viewPortSize[0] || spritePixelPositionOnCanvas < 0
					) {return}
					canvas[spriteRowPositionOnCanvas].splice(spritePixelPositionOnCanvas, 1, pixel)
				})
			})
			return canvas
		}

		this._getLayers().forEach((layer, zIndex) => {
			layer
			.filter(child => child instanceof VisualNode)
			.forEach(child => {
				const positionOnCanvas = child.getGlobalPosition()
				.map((value, i) => value - CurrentCamera.getGlobalPosition()[i] + CurrentCamera.viewPortSize[i]/2)
				.map(foaltCoord => Math.floor(foaltCoord))
				canvas = renderSprite(canvas, positionOnCanvas, child.getSprite(), child.transparentSymbol)
			})
		})

		console.clear()
		console.log(
			[
			Array(CurrentCamera.viewPortSize[0]).fill(CurrentCamera.windowBordersSymbol),
			...canvas,
			Array(CurrentCamera.viewPortSize[0]).fill(CurrentCamera.windowBordersSymbol)
			]
			.map(row => `${CurrentCamera.windowBordersSymbol}${row.join('')}${CurrentCamera.windowBordersSymbol}` )
			.join('\n')
		)
	}
}