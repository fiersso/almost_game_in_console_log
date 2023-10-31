import {Node, Camera, Root, Sprite, AnimationSprite} from './Node.mjs';
import {DialogBox} from './DialogBox.mjs';
import {Player, Bird} from './CustomClasses.mjs';

const stdin = process.stdin;
let keyPressed = null
let nowPressed = false
stdin.setRawMode(true)
stdin.setEncoding('utf8')

const Reset = "\x1b[0m"
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


class GameClass {

	constructor(rootNode, voidSymbol) {
		this.root = rootNode
		this.pause = false
		this.voidSymbol = voidSymbol
		this.processFPS = 20
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
					// console.log(color, 'color', `\x1b[0m`)
					canvas[RowPosition].splice(pixelPosition, 1, color + spritePixel + `\x1b[0m`)
				})
			})
			return canvas
		}

		this.getLayers().forEach((layer, ZIndex) => {
			layer.forEach(child => {
				if (!(child instanceof Sprite) && !(child instanceof AnimationSprite) && !(child instanceof DialogBox)) {return}
				const childGbPos = child.getGlobalPosition()
				const sprite = child.getSprite()

				// const spriteSize = []

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

//█▓▒░

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
	]
))

.addChild(new Sprite('house_2', [27,-10], 1,
	[
		' ▄▄▓▓▓▓▓▓▓▄▄ ',
		'▓▀▀▀▀▀▀▀▀▀▀▀▓',
		'▓░░░░░░░░░░░▓',
		'▓░|__|░▌||▌░▓',
		'▓░░░░░░▌||▌░▓',
	]
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
	}, null, 'live', 10,
))

.addChild(new Player('player', [20, 6], 0)
	.addChild(new Camera('camera', [0, 0], 10, [108, 24])
		.addChild(new DialogBox('dialogBox', [-19, -12], 10, 30))
	)
	.addChild(new AnimationSprite('CatSprite', [0, 0], 2, PlayerAnimations, `${BgRed}`))
)


for (let i = 0; i<9; i++) {
	Game.root.addChild(new Bird(`bird${i}`, [( i > 4 ? 4 - (i - 4) : i ) * 10 -200, i*2 - 15], 5)
		.addChild(new AnimationSprite('sprite', [0, 0], 5, BirdAnimations , null, 'fly', 1, false))
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