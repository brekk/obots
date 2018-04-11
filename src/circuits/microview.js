const five = require(`johnny-five`)
const board = new five.Board()
const Oled = require(`oled-js`)

board.on(`ready`, function ready() {
  console.log(`Connected to Arduino, ready.`)

  let opts = {
    width: 64,
    height: 48,
    microview: true
  }

  const oled = new Oled(board, five, opts)
  // do cool oled things here
  this.repl.inject({ oled })
})
