const stdin = process.stdin;
let keyPressed = null
stdin.setRawMode(true)
stdin.setEncoding('utf8')

const ResetColor = "\x1b[0m"
const Dim = "\x1b[2m"
const Underscore = "\x1b[4m"
const Blink = "\x1b[5m"
const Reverse = "\x1b[7m"
const Hidden = "\x1b[8m"

const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"
const FgGray = "\x1b[90m"

const BgBlack = "\x1b[40m"
const BgRed = "\x1b[41m"
const BgGreen = "\x1b[42m"
const BgYellow = "\x1b[43m"
const BgBlue = "\x1b[44m"
const BgMagenta = "\x1b[45m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"
const BgGray = "\x1b[100m"

class Node {
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

class Root extends Node {

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


class Sprite extends Node {
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

class AnimationSprite extends Node {
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

class Camera extends Node {
	constructor(name, position, layer, viewPortSize) {
		super(name, position, layer)
		this.viewPortSize = viewPortSize
	}
	process(GAME) {
		return this
	}
}

class Player extends Node {
	constructor(name, position, layer) {
		super(name, position, layer)
		this.variables = {
			isWalk: false,
			dialog: false,
		}
	}
	ready(GAME) {
		this.getChild('camera').getChild('dialogBox').start([
			`hii   (press "e" key to continue)`,
			`It's the first version! :>`,
		])
		setTimeout(() => {
			this.getChild('camera').getChild('dialogBox').start([
				`I maked it in a short period of time`,
				`and... I think it looks pretty cool :)`,
			])
		}, 10_000)
		setTimeout(() => {
			this.getChild('camera').getChild('dialogBox').start([
				`If something you can change the viewport size. Use arrows`,
			])
		}, 18_000)
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

class Bird extends Node {
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

class DialogBox extends Node {
	constructor(name, position, layer, speed = 1, color=null) {
	  super(name, position, layer)
	  this.currentText = ''
	  this.texts = []
	  this.transparent = false
	  this.speed = speed
	  this.color = color === null ? `\x1b[5m`: color
	  this.variables = {
		isWaiting: false,
		isActive: false,
	  }
	  this.currentTextIndex = 0 
	}
	start(texts, currentTextIndex = 0, clearText = true) {
	  this.texts = texts
	  this.currentText = (this.variables.isActive) ? this.currentText : '';
	  this.variables.isActive = true
	  if (clearText) {this.currentText = ''}
	  this.currentTextIndex = currentTextIndex
	  this.variables.textIterator = this.texts[this.currentTextIndex][Symbol.iterator]()
	  setTimeout(function textAnimation(node) {
		const textIterator = node.variables.textIterator
		const value = textIterator ? textIterator.next().value : false
		if (!value) {
		  node.variables.isWaiting = true
		  return
		}
		node.currentText += value
		setTimeout(textAnimation, 1000/node.speed, node)
	  }, 1000/this.speed, this)
	}
	process(GAME) {
	  if (this.variables.isWaiting && GAME.isActionPressed('interaction')) {
		this.next()
	  } else if (GAME.isActionPressed('interaction')) {
		this.skip()
	  }
	  return this
	}
	next() {
	  this.variables.isWaiting = false
	  if (this.currentTextIndex >= this.texts.length - 1) {
		return this.over()
	  }
	  this.currentTextIndex += 1
	  this.start(this.texts, this.currentTextIndex)
	}
	skip() {
	  this.variables.isWaiting = true
	  this.currentText = this.texts[this.currentTextIndex]
	  this.variables.textIterator = null
	}
	over() {
	  this.variables.isActive = false
	}
	getSprite() {
	  return this.variables.isActive ? this.drawDialogBox(this.currentText) : ['']
	}
	drawDialogBox (text, fixedBorders = false, minTextRowLength = 2) {
	  const textMaxLength = 35
	  const borderWidth = 1
	  const padding = {x: 1, y: 0}
	  const borderFillLines = {horizontal: '═', vertical: '|'}
	  const borderFillAngles = {
		leftUp: '╔',
		rightUp: '╗',
		leftDown: '╝',
		rightDown: '╚',
	  }
	  const backgroundFill = ' '
	  const textRows = text.split(' ').reduce((rows, word) => {
  
		if (word.includes('\n')) {
		  word.split('\n')[0] !== '' && rows.at(-1).push(word.split('\n')[0])
		  word.split('\n').slice(1).forEach((wordSlice) => {
			rows.push(wordSlice !== '' ? [wordSlice] : [])
		  })
		  return rows
		}
  
		if ((rows.at(-1).join(' ').length + word.length + 1) <= (textMaxLength - padding.x * 2)) {
		  rows.at(-1).push(word)
		  return rows
		} 
  
		return [...rows, [word]]
  
	  }, [[]])
	  const minHeigth = textRows.length
	  let maxRowLength = [...textRows].sort((a, b) => a.join(' ').length - b.join(' ').length).at(-1).join(' ').length
	  maxRowLength = minTextRowLength - maxRowLength > 0 ? maxRowLength + (minTextRowLength - maxRowLength) : maxRowLength
	  const innerSize = {x: (fixedBorders ? textMaxLength : maxRowLength) + padding.x * 2, y: minHeigth + padding.y * 2}
  
	  let canvas = []
	  for (let y = 0; y<innerSize.y; y++) {
		canvas.push([])
		for (let x = 0; x<innerSize.x; x++) {
		  canvas[y].push(backgroundFill)
		}
	  }
  
	  textRows.forEach((row, i) => {
		const text = row.join(' ')
		canvas[padding.y + i].splice(padding.x, text.length, ...text)
	  })
  
	  const horizontalBorderLine = Array(innerSize.x).fill(borderFillLines.horizontal)
	  for (let i = 0; i<borderWidth; i++){
		canvas.unshift(horizontalBorderLine)
		canvas.push(horizontalBorderLine)
	  }
  
	  canvas.forEach((row, y) => {
		if (y === 0) {
		  canvas[y] = [...Array(borderWidth).fill(borderFillAngles.leftUp), ...row, ...Array(borderWidth).fill(borderFillAngles.rightUp)]
		  return
		}
		if (y === canvas.length-1) {
		  canvas[y] = [...Array(borderWidth).fill(borderFillAngles.rightDown), ...row, ...Array(borderWidth).fill(borderFillAngles.leftDown)]
		  return
		}
		canvas[y] = [...Array(borderWidth).fill(borderFillLines.vertical), ...row, ...Array(borderWidth).fill(borderFillLines.vertical)]
	  })
  
	  return canvas.map(row => row.join(''))
	}
}

class GameClass {

	constructor(rootNode, voidSymbol) {
		this.root = rootNode
		this.pause = false
		this.voidSymbol = voidSymbol
		this.processFPS = 34
		this.actions = {
		  'a': 'left',
		  'd': 'right',
		  'w': 'up',
		  's': 'down',
		  'e': 'interaction',
		  '\u001b[A': 'windowYUp',
		  '\u001b[B': 'windowYDown',
		  '\u001b[C': 'windowXUp',
		  '\u001b[D': 'windowXDown',
		}
	}

	start() {
		this.root = this.root.applyToEachRecursiveChild((node) => node.ready(this))
		this.process()
	}

	isActionPressed(action) {
		return Number(this.actions[keyPressed] === action)		
	}

	setPause(value) {
		this.pause = value
		!value && this.process()
	}

	process() {
		this.drawFrame()

		this.root = this.root.applyToEachRecursiveChild((node) => node.process(this))
		keyPressed = null
		setTimeout(() => {
			!this.pause && this.process()
		}, (1000/this.processFPS).toFixed(2))
	}

	drawFrame() {
		const CurrentCamera = this.root.getAllRecursiveChild().filter(child => child instanceof Camera)[0]
		const CCGbPos = CurrentCamera.getGlobalPosition()
		let canvas = []
		for (let y = 0; y<CurrentCamera.viewPortSize[1]; y++) {
			canvas.push([])
			for (let x = 0; x<CurrentCamera.viewPortSize[0]; x++) {
				canvas[y].push(this.voidSymbol)
			}
		}

		function renderSprite(canvas, spriteCnvsPos, sprite, color, transparent) {
			sprite.forEach((spriteRow, i) => {
				const RowPosition = spriteCnvsPos[1] + i
				spriteRow.split('').forEach((spritePixel, j) => {
					const pixelPosition = spriteCnvsPos[0] + j
					if (transparent && spritePixel === ' ') {return}
					if (
						RowPosition >= canvas.length || RowPosition < 0
						|| pixelPosition >= CurrentCamera.viewPortSize[0] || pixelPosition < 0
					) {return}
					canvas[RowPosition].splice(pixelPosition, 1, color + spritePixel + ResetColor)
				})
			})
			return canvas
		}

		this.getLayers().forEach((layer, ZIndex) => {
			layer.forEach(child => {
				if (!(child instanceof Sprite) && !(child instanceof AnimationSprite) && !(child instanceof DialogBox)) {return}
				const childGbPos = child.getGlobalPosition()
				const sprite = child.getSprite()
				const cnvsPos = [
					childGbPos[0] - CCGbPos[0] + CurrentCamera.viewPortSize[0]/2,
					childGbPos[1] - CCGbPos[1] + CurrentCamera.viewPortSize[1]/2,
				].map(foaltCoord => Math.floor(foaltCoord))
				canvas = renderSprite(canvas, cnvsPos, sprite, child.color, child.transparent)
			})
		})

		console.clear()
		console.log([Array(CurrentCamera.viewPortSize[0]).fill('▒').join(''), ...canvas.map(row => row.join('')), Array(CurrentCamera.viewPortSize[0] + 1).fill('▒').join('')].join('▒\n'))
		console.log('console:')
	}

	getLayers() { 
		const allChildren = this.root.getAllRecursiveChild()

		allChildren.sort((childA, childB) => {
			return childA.layer - childB.layer
		})

		const layers = allChildren.reduce((accum, child, i) => {
			if (i === 0) {
				return [...accum, [child]]
			}
			if (allChildren[i].layer == allChildren[i-1].layer) {
				accum[accum.length-1].push(child)
				return accum
			}
			return [...accum, [child]]
		}, [])

		return layers
	}

	printTree() {
		this.root.applyToEachRecursiveChild((child, level) => console.log(Array(level).fill(`    `).join('') + child.name))
	}
}

const Game = new GameClass(new Root('root', [0,0], 0), ' ')

const PlayerAnimations = {
	idle: [
		[
			"           ",
			"    ___^.^ ",
			"\\__/`__'^' ",
			"   ||  ||  ",
		],
		[	
			"           ",
			"    ___^.^ ",
			"\\__/`__-^- ",
			"   ||  ||  ",
		],
	],
	walk: [
		[
			"           ",
			"    ___^.^ ",
			"\\__/`__'^' ",
			"   /\\  /\\  ",
		],
		[
			"           ",
			"    ___^.^ ",
			"\\__/`__'^' ",
			"   ||  ||  ",
		],
		[
			"           ",
			"    ___^.^ ",
			"\\__/`__'^' ",
			"   \\/  \\/  ",
		],
		[
			"           ",
			"    ___^.^ ",
			"\\__/`__'^' ",
			"   ||  ||  ",
		],
	],
}

const getFloorSprite = (width, heigth) => {
	const sprite = []

	for (let y = 0; y<heigth; y++) {
		sprite.push([])
		for (let x = 0; x<width; x++) {
			const grassExists = Math.random() > 0.06
			const grass = Math.random() >= 0.5 ? '\\|.' : '|/'
			sprite[y].push(grassExists ? ' ' : grass)
		}
	}

	return sprite.map(row => row.map(pixel => `${pixel}`).join(''))
} 

const BirdAnimations = {
	fly: [
		[
			'  _  _  ',
			' / \\/ \\ ',
		],
		[	
			'___  ___',
			'   \\/   ',
		],
	]
}

Game.root

.addChild(new Sprite('flooe', [-112,-200], -5,
	getFloorSprite(425, 425), "\x1b[90m"
))

.addChild(new Sprite('house_1', [0,0], 3,
	[
		'  ▓▓ ▄▄▄     ',
		' ▄▓▓▓▓▓▓▓▓▄▄ ',
		'▓░░░░░░░░░░░▓',
		'▓░|_+|░░░░░░▓',
		'▓░|__|░▌⠀⠀▌░▓',
		'▓░░░░░░▌⠀⠀▌░▓',
	],
	`${BgGreen}`
))

.addChild(new Sprite('house_2', [27,-10], 1,
	[
		' ▄▄▓▓▓▓▓▓▓▄▄ ',
		'▓▀▀▀▀▀▀▀▀▀▀▀▓',
		'▓░░░░░░░░░░░▓',
		'▓░|__|░▌||▌░▓',
		'▓░░░░░░▌||▌░▓',
	],
	`${BgGreen}`
))

.addChild(new AnimationSprite('house_3', [56, 0], 1,
	{
		live: [
			[	
				'             ',
				'             ',
				'          #  ',
				'          ▄▄  ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'          #  ',
				'        ##  ',
				'          #  ',
				'     ▄▓▄  ▓▓',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'      #  ##  ',
				'        #     ',
				'             ',
				'     ▄▓▄  ▓▓',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'       #      ',
				'     #       ',
				'              ',
				'             ',
				'     ▄▓▄  ▓▓',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'              ',
				'             ',
				'              ',
				'             ',
				'     ▄▓▄  ▓▓',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'              ',
				'             ',
				'              ',
				'             ',
				'     ▄▓▄ ▄▄▄',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|__|░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			]
		],
	}, `${BgGreen}`, 'live', 10,
))

.addChild(new Player('player', [20, 6], 0)
	.addChild(new Camera('camera', [0, 0], 10, [108, 24])
		.addChild(new DialogBox('dialogBox', [-19, -12], 10, 30))
	)
	.addChild(new AnimationSprite('CatSprite', [0, 0], 2, PlayerAnimations, `${Blink}`))
)


for (let i = 0; i<9; i++) {
	Game.root.addChild(new Bird(`bird${i}`, [( i > 4 ? 4 - (i - 4) : i ) * 10 -200, i*2 - 15], 5)
		.addChild(new AnimationSprite('sprite', [0, 0], 5, BirdAnimations ,
		// `${[BgMagenta, BgBlue, BgCyan, BgGreen, BgYellow, BgGreen, BgCyan, BgBlue, BgMagenta][i]}`
		``
		, 'fly', 1, false))
	)
}

Game.start()

stdin.on('data', async (key) => {
	if ( key === '\u0003' ) {
		process.exit();
	}
	if ( key === `\u001b` ) {
		Game.setPause(!Game.pause)
	}
	keyPressed = key
});