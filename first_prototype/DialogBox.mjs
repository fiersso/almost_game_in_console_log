import {Node} from './Node.mjs'

export class DialogBox extends Node {
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