import {
  fromPairs,
  toPairs,
  map,
  curry
} from 'f-utility'
import five from 'johnny-five'
import _color from 'colortransition'
import _debounce from 'lodash.debounce'
import F from 'fluture'
import bug from 'debug'
import {COLORS} from '../light'
const {MAGENTA, CYAN} = COLORS

const of = curry((C, x) => new C(x))
const 𝓯 = of(F)
const bind = curry((scope, x) => x.bind(scope))
const log = bind(console, console.log)

/*
import five from 'johnny-five'
const board = five.Board()
// what you'll tend to see:
board.on(`event`, someCallbackFunction)
// what this does:
eventF(`event`, someCallbackFunction, board)
eventF(`event`, someCallbackFunction)(board)
eventF(`event`)(someCallbackFunction)(board)
eventF(`event`)(someCallbackFunction, board)
 */
// const eventF = curry((eventName, handler, entity) => 𝓯(
//   function eventAsFuture(reject, resolve) {
//     entity.on(eventName, handler(reject, resolve))
//   }
// ))
// const eventKeysF = curry((entity, rules) => pipe(
//   toPairs,
//   map(([k, v]) => eventF(k, v, entity)),
//   fromPairs
// )(rules))

const color = curry(_color)
const debounce = curry((amount, fn) => _debounce(fn, amount))

const [
  photoCellLog,
  lightLog
  // buttonLog
] = map(bug, [
  `obots:photocell`,
  `obots:led`,
  `obots:button`
])

const board = five.Board()
const SENSOR_DEBOUNCE_INTERVAL = 50
// const BLINK_SPEED = 100
const COLOR_SCALE = 4
const LOW_INTENSITY = 30

const runFromColorToColor = curry(
  (start, end, intervalInMs, cb) => {
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
  }
)

const runFromOneToTwo = runFromColorToColor(MAGENTA, CYAN)
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
      led.color(COLORS.MAGENTA)
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
  // const servo = new five.Servo.Continuous(11)

  // doesn't seem to work?
  // photoCell.within([0.00, 0.30], function photoCellWithin() {
  //   // console.log(`specifically, 0 - 0.3`)
  // })
  function photoCellChange() {
    const {level} = this
    if (level > 0.85) {
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
  // const buttonEvents = eventKeysF()

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
