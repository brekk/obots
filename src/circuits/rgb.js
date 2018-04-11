import {
  // fromPairs,
  // toPairs,
  map,
  curry,
  K
} from 'f-utility'
import five from 'johnny-five'
// import F from 'fluture'
import bug from 'debug'
import {Button, Led, COLORS, colorSequence} from '../light'
import {debounce} from '../util/debounce'
const {MAGENTA, CYAN} = COLORS

// const of = curry((C, x) => new C(x))
// const 𝓯 = of(F)
// const bind = curry((scope, x) => x.bind(scope))
// const log = bind(console, console.log)

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
const LOW_INTENSITY = 20

// colorSequence(({scale, colors, interval, cb, limit = 100}) => {})

const magentaCyanSequence = colorSequence({
  scale: COLOR_SCALE,
  interval: 300,
  colors: [MAGENTA, CYAN]
})

const callbackWhenBoardReady = () => {
  let isOn = false
  let willDie = false
  let killId = null
  let isStrobing = false

  const startLightLoop = () => {
    if (!isOn) {
      led.color(COLORS.MAGENTA)
      led.intensity(LOW_INTENSITY)
      isOn = true
      killId = magentaCyanSequence({
        cb: (newColor) => {
          led.color(newColor)
          led.intensity(LOW_INTENSITY)
        }
      })
    }
  }
  const startDying = () => {
    if (!willDie) {
      willDie = true
    }
  }
  const die = () => {
    if (willDie) {
      led.stop().off()
      clearInterval(killId)
      willDie = false
      isOn = false
    }
  }
  const photoCell = new five.Light(`A0`)

  // doesn't seem to work?
  // photoCell.within([0.00, 0.30], function photoCellWithin() {
  //   console.log(`specifically, 0 - 0.3`)
  // })
  function photoCellChange() {
    const {level} = this
    if (level >= 0.80) {
      photoCellLog(`NO LIGHT!`, Date.now())
      if (!isOn) {
        startLightLoop()
      } else {
        // if (!isStrobing) {
        // led.strobe(300)
        // isStrobing = true
        // } else {
        if (isStrobing) {
          led.stop()
          clearInterval(killId)
          isStrobing = false
        }
      }
    }
  }
  const delaySensor = debounce(SENSOR_DEBOUNCE_INTERVAL)
  photoCell.on(`change`, delaySensor(photoCellChange))

  // Initialize the RGB LED
  const led = Led.of({
    r: 6,
    g: 5,
    b: 3
  })

  const button = Button.of(2)

  button.on(`down`, startLightLoop)

  button.on(`hold`, startDying)

  button.on(`up`, die)

  // Add led to REPL (optional)
  board.repl.inject({
    led,
    button,
    photoCell
  })
}
board.on(`ready`, callbackWhenBoardReady)
