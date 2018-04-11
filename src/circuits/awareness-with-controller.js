import five from 'johnny-five'
import chalk from 'chalk'
import {
  curry,
  map,
  K
} from 'f-utility'
import ds from 'dualshock-controller'
import * as chromatism from 'chromatism'
import {Led} from '../light/led'
import {random as randomColor} from '../light/color'
import {debounce} from '../util/debounce'

const controller = ds({
  config: `dualShock4-alternate-driver`,
  accelerometerSmoothing: true
  // analogStickSmoothing: true
})

const circuitConfig = {
  proximity: {
    controller: `HCSR04`,
    pin: 12
  },
  light: {
    r: 9,
    g: 10,
    b: 11
  },
  photocell: {
    pin: `A5`,
    freq: 250
  }
}

const board = five.Board()
const semilog = debounce(200, function log() { console.log.apply(console, arguments) })

// this is a stateful closure
const waterMark = (ref, compare) => {
  return (a) => {
    if (compare(a, ref)) {
      ref = a // eslint-disable-line
    }
    return ref
  }
}
const highMark = waterMark(-Infinity, (a, b) => a > b)
const lowMark = waterMark(Infinity, (a, b) => a < b)
const asPercentage = (high, low, current) => {
  const sum = high() + low()
  return Math.round((current / sum) * 100)
}

const boundaries = curry((high, low, x) => (
  x >= high ?
    high :
    x < low ?
      low :
      x
))
const octet = boundaries(0, 255)
const percentage = boundaries(0, 100)
const adjustableColor = (increment = 5) => {
  const light = {
    red: 255,
    green: 255,
    blue: 255
  }
  const upAndDown = (color) => ({
    up: () => {
      light[color] = octet(light[color] + increment)
      return light[color]
    },
    down: () => {
      light[color] = octet(light[color] - increment)
      return light[color]
    }
  })
  return {
    red: upAndDown(`red`),
    green: upAndDown(`green`),
    blue: upAndDown(`blue`),
    raw: () => light
  }
}

const waterMarks = {
  photoCell: {
    high: highMark,
    low: lowMark
  },
  proximity: {
    high: highMark,
    low: lowMark
  }
}

board.on(`ready`, () => {
  const light = Led.of(circuitConfig.light)
  const prox = new five.Proximity(circuitConfig.proximity)
  const cell = new five.Sensor(circuitConfig.photocell)
  let brightness = 0
  let rotation = 0
  let color = `#ffffff`
  light.color(color)
  controller.on(`error`, console.error)
  const setColor = (x) => {
    console.log(`color set to ${x}`)
    light.color(x)
    color = x
  }
  const getRando = () => setColor(randomColor())
  controller.on(`square:release`, () => setColor(`#ff0000`))
  controller.on(`circle:release`, () => setColor(`#0000ff`))
  controller.on(`triangle:release`, () => setColor(`#00ff00`))
  controller.on(`x:release`, getRando)
  controller.on(`x:hold`, getRando)
  const intensityUp = () => {
    console.log(brightness)
    brightness = percentage(brightness + 1)
    light.intensity(brightness)
  }
  const intensityDown = () => {
    console.log(brightness)
    brightness = percentage(brightness - 1)
    light.intensity(brightness)
  }
  controller.on(`up:move`, intensityUp)
  controller.on(`down:move`, intensityDown)
  const hueShiftLeft = () => {
    rotation += 1
    if (rotation > 360) {
      rotation = 0
    }
    light.color(chromatism.hue(rotation, color).hex)
  }
  const hueShiftRight = () => {
    rotation -= 1
    if (rotation < 0) {
      rotation = 360
    }
    light.color(chromatism.hue(rotation, color).hex)
  }
  controller.on(`l1:release`, hueShiftLeft)
  controller.on(`l1:hold`, hueShiftLeft) // cray when it's 10
  controller.on(`r1:release`, hueShiftRight)
  controller.on(`r1:hold`, hueShiftRight)
  controller.on(`l2:hold`, intensityDown)
  controller.on(`l2:release`, intensityDown)
  controller.on(`r2:hold`, intensityUp)
  controller.on(`r2:release`, intensityUp)
  cell.on(`data`, function photoCellData() {
    /*
    console.log(
      `📸  current %s high %s low %s percentage %s%`,
      this.value,
      waterMarks.photoCell.high(this.value),
      waterMarks.photoCell.low(this.value),
      asPercentage(
        waterMarks.photoCell.high,
        waterMarks.photoCell.low,
        this.value
      )
    )
    */
    const data = this.value
    if (data > 700) {
      light.color(`#0000ff`)
    } else if (data < 550) {
      light.color(`#ff0000`)
    }
  })
  // light.on()
  prox.on(`data`,
    // debounce(26,
    function proximityData() {
      const current = this.cm
      const intensity = asPercentage(
        waterMarks.proximity.high,
        waterMarks.proximity.low,
        current
      )
      // (current / 60) * 100
      semilog(`distance! ${current}cm / ${this.in}in`, intensity)
      const i = debounce(5, light.intensity)
      const setIntensity = i.bind(light)
      setIntensity((30 / intensity))
      // light.intensity(20 / intensity)
      semilog(
        `👀  current %s high %s low %s intensity %s%`,
        current,
        waterMarks.proximity.high(current),
        waterMarks.proximity.low(current),
        intensity
      )
    }
    // )
  )
  board.repl.inject({
    controller,
    light,
    prox,
    cell
  })
})
