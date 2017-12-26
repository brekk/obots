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

// _debounce(fn, amount)
const debounce = curry((amount, fn) => _debounce(fn, amount))

const board = five.Board()
const SENSOR_DEBOUNCE_INTERVAL = 50
const BLINK_SPEED = 100
const COLOR_SCALE = 4
const LOW_INTENSITY = 100
const COLORS = freeze({
  RED: `#ff0000`,
  TURQUOISE: `#00ccff`,
  MAGENTA: `#ff0088`
})
const runFromColorToColor = curry((start, end, intervalInMs, cb) => {
  const changeColorByPercentage = color(start, end)
  let count = 0
  let counter = COLOR_SCALE
  const THE_LIMIT = 100
  return setInterval(() => {
    lightLog(`counting! ${count} + ${counter}`, count + counter)
    count += counter
    if (count > THE_LIMIT || count <= 0) {
      counter *= -1
    }
    if (count <= 0) {
      count = 0
    }
    if (count >= THE_LIMIT) {
      count = THE_LIMIT
    }
    // count %= THE_LIMIT
    cb(changeColorByPercentage(count))
  }, intervalInMs)
})
const runFromOneToTwo = runFromColorToColor(COLORS.MAGENTA, COLORS.TURQUOISE)
const runFromOneToTwoFast = runFromOneToTwo(300)

const callbackWhenBoardReady = () => {
  // if off
  //   up turns on and sets color
  //   down does nothing
  //   hold does nothing
  // if on
  //   up changes color
  //   down does nothing
  //   hold turns off
  let isOn = false
  let willDie = false
  let killId = null
  let isStrobing = false

  const startLightLoop = () => {
    if (!isOn) {
      led.color(`#ff0088`)
      led.intensity(LOW_INTENSITY)
      isOn = true
      killId = runFromOneToTwoFast((newColor) => {
        led.color(newColor)
        led.intensity(LOW_INTENSITY)
      })
    }
  }
  const killTheLight = () => {
    if (willDie) {
      led.off()
      clearInterval(killId)
      willDie = false
      isOn = false
    }
  }
  const photoCell = new five.Light(`A0`)

  // doesn't seem to work?
  // photoCell.within([0.00, 0.30], function photoCellWithin() {
  //   // console.log(`specifically, 0 - 0.3`)
  // })
  function photoCellChange() {
    // const level = 0.5
    // const this = {level}
    // const level = this.level
    const {level} = this
    if (level > 0.75) {
      photoCellLog(`NO LIGHT!`, Date.now())
      if (!isOn) {
        startLightLoop()
      } else {
        if (!isStrobing) {
          led.strobe(300)
          isStrobing = true
        } else {
          led.stop()
          isStrobing = false
        }
      }
    }
  }
  const delaySensor = debounce(SENSOR_DEBOUNCE_INTERVAL)
  photoCell.on(`change`, delaySensor(photoCellChange))
  const button = new five.Button(2)

  // Initialize the RGB LED
  const led = new five.Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3
    }
  })

  // Turn it on and set the initial color
  // led.on()
  // 00 - FF
  // 9abcdef
  // #RRGGBB
  // #F0F
  // #FF00FF

  const log = console.log.bind(console)
  const returnRandomColor = () => {
    const MAX_COLOR_CONSTANT = 16777215
    return '#'+Math.floor(
      Math.random() * MAX_COLOR_CONSTANT
    ).toString(16)
  }

  button.on(`down`, startLightLoop)

  button.on(`hold`, () => {
    if (!willDie) {
      willDie = true
    }
  })

  button.on(`up`, killTheLight)

  // Add led to REPL (optional)
  board.repl.inject({
    led,
    button,
    photoCell
  })
}

board.on(`ready`, callbackWhenBoardReady)
