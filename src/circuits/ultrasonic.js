import _color from 'colortransition'
import {COLORS} from '../light'
const five = require(`johnny-five`)
const {curry} = require(`f-utility`)
const board = new five.Board()
const _debounce = require(`lodash.debounce`)
// _debounce(fn, amount)
const {MAGENTA, CYAN} = COLORS
const debounce = curry((amount, fn) => _debounce(fn, amount))

const sensorDelay = debounce(200)
const log = console.log.bind(console)

const COLOR_SCALE = 4

const color = curry(_color)
const runFromColorToColor = curry(
  (start, end, intervalInMs, cb) => {
    const changeColorByPercentage = color(start, end)
    let count = 0
    let counter = COLOR_SCALE
    const THE_LIMIT = 100
    return setInterval(() => {
      // lightLog(`counting! ${count} + ${counter}`, count + counter)
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

board.on(`ready`, function boardReady() {
  let killId = -1
  let currentColor = `ff0000`
  const light = new five.Led.RGB({ pins: {
    red: 11,
    green: 10,
    blue: 9
  }})
  const magnetSwitch = new five.Switch(2)
  magnetSwitch.on(`open`, () => {
    log(`magnet open!`)
    clearInterval(killId)
    light.color(`00ff00`)
    light.intensity(20)
    light.strobe(50)
  })
  magnetSwitch.on(`close`, () => {
    log(`magnet closed!`)
    light.stop().off()
    clearInterval(killId)
  })
  const proximity = new five.Proximity({
    controller: `HCSR04`,
    pin: 7
  })
  let distances = {max: -1, min: 1}
  let scale = 1
  proximity.on(`data`, function ultrasonic() {
    // log(`Proximity: `)
    // log(`  in  : `, this.in)
    // log(`-----------------`)
    if (this.cm > distances.max) {
      distances.max = this.cm
    }
    if (this.cm < distances.min) {
      distances.min = this.cm
    }
    // log(`  current  : `, this.cm, distances)
    log(`  current  : `, this.cm, distances, scale, scale * 100)
    scale = this.cm / distances.max
    light.intensity(Math.abs((100 * scale) - 10))
  })
  const animate = () => {
    clearInterval(killId)
    light.stop().off()
    killId = runFromOneToTwoFast((newColor) => light.color(newColor))
  }
  setTimeout(animate, 300)

  // proximity.on(`change`, debounce(1000, function proximityChange() {
  //   console.log(`The obstruction has moved.`)
  //   animate()
  // }))
})
