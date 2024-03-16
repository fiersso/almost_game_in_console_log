import {GameEngine, Node, Camera, StaticSprite, AnimatedSprite} from './BaseClasses.mjs'
import {Player} from './custom_classes/Player.mjs'


const Game = new GameEngine(new Node('root', [0, 0]), 30)

const CatAnimations = {
	idle: {
		speed: 2,
		frames: [
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
			[
				"           ",
				"    ___^.^ ",
				"\\__/`__'^' ",
				"   ||  ||  ",
			],
		]
	},
	walk: {
		speed: 15,
		frames: [
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
		]
	}
}

const superDuperHouseAnimations = {
	living: {
		speed: 10,
		frames: [
			[	
				'             ',
				'             ',
				'          #  ',
				'          ▄▄ ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'          #  ',
				'        ##   ',
				'          #  ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'      #  ##  ',
				'        #    ',
				'             ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'       #     ',
				'     #       ',
				'             ',
				'             ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'             ',
				'             ',
				'             ',
				'     ▄▓▄  ▓▓ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			],
			[
				'             ',
				'             ',
				'             ',
				'             ',
				'     ▄▓▄ ▄▄▄ ',
				' ▄▄▓▓▓▓▓▓▓▓▓ ',
				'▓▀▀▀▀▀▀▀▀▀▀▀▓',
				'▓░░░░░░░░░░░▓',
				'▓░|  |░▌  ▌░▓',
				'▓░░░░░░▌  ▌░▓',
			]
		],
	}
}

Game.root

.addChild(new StaticSprite('ground', [-125, -125], -1, ((width, heigth) => {
	const sprite = []
	for (let y = 0; y<heigth; y++) {
		sprite.push([])
		for (let x = 0; x<width; x++) {
			const grassExists = Math.random() > 0.05
			const grass = Math.random() >= 0.5 ? '\\|.' : '|/'
			sprite[y].push(grassExists ? ' ' : grass)
		}
	}
	return sprite.map(row => row.map(pixel => `${pixel}`).join(''))
})(250, 250)))

.addChild(new Player('cat', [0, 0])

	.addChild(new Camera('camera', [0, 0], [109, 25], ' ', '▒'))

	.addChild(new AnimatedSprite('anim_sprite', [0, 0], 0, CatAnimations, 'idle', ' ', [false, false]))
)

.addChild(new AnimatedSprite('super_duper_house', [-14, -7], 0, superDuperHouseAnimations, 'living', ' ', [false, false]))


Game.start()