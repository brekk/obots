// import and name a constant called five
const {map, freeze, curry} = require('f-utility')
const five = require(`johnny-five`)
const color = curry(require('colortransition'))
const _debounce = require('lodash.debounce')
const bug = require('debug')
const {debug} = require('xtrace')

const [photoCellLog, lightLog, buttonLog] = map(bug, [
  `obots:photocell`,
  `obots:led`,
  `obots:button`
])

const board = five.Board()

const callbackWhenBoardReady = () => {
  const servo = new five.Servo(11)

  servo.sweep()

  // Add led to REPL (optional)
  board.repl.inject({
    servo
  })
}

board.on(`ready`, callbackWhenBoardReady)
