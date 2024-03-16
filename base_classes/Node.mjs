export class Node {
	_children = []
	_parent = null

	getParent() {
		return this._parent
	}

	constructor(name, position) {
		this.name = name
		this.position = position
	}

	ready(Game) {
		return this
	}

	process(Game, delta) {
		return this
	}

	getChildren() {
		return this._children
	}

	addChild(...childs) {
		childs.forEach((child) => {
			child._parent = this
			this._children.push(child)
		})
		return this
	}

	getParents() {
		return (function addNextParent(node, array) {
			if (!node) return array
			array = [...array, node]
			return addNextParent(node.getParent(), array)
		})(this.getParent(), [])
	}

	setChildren(newChildren) {
		this._children = newChildren
	}

	getChild(childName) {
		return this._children.find(child => child.name === childName)
	}

	getGlobalPosition() {
		return this.getParents().reduce((global_pos, parent) => {
			return global_pos.map((value, i) => value + parent.position[i])
		}, this.position)
	}
}