import five from 'johnny-five'
import chalk from 'chalk'
import {
  map,
  K
} from 'f-utility'
import {Led} from '../light/led'
import {debounce} from '../util/debounce'

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
      // semilog(`distance! ${current}cm / ${this.in}in`, intensity)
      const i = debounce(40, light.intensity)
      const setIntensity = i.bind(light)
      setIntensity(50 / intensity)
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
    light,
    prox,
    cell
  })
})
