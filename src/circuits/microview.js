import five from 'johnny-five'
import Oled from 'oled-js'
import pingu from 'png-to-lcd'
const board = five.Board()

board.on(`ready`, function boardRead() {
  console.log(`connected to microview!`)
  const oled = new Oled(board, five, {
    width: 64,
    height: 48,
    microview: true
  })
  oled.clearDisplay()
  pingu(`./human-bird.png`, true, (x, bitmap) => {
    if (x) {
      throw x
    }
    oled.buffer = bitmap
    oled.update()
  })
})
