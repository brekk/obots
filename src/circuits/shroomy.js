import five from 'johnny-five'
import {
  e0
} from 'entrust'
import {
  isNumber,
  map,
  ternary
} from 'f-utility'
const LIGHTS = {
  rgb1: {
    red: 11,
    green: 10,
    blue: 9
  },
  rgb2: {
    red: 6,
    green: 5,
    blue: 3
  },
  littleGreen1: 4,
  littleGreen2: 2,
  green: 12,
  yellow: 8,
  red: 7
}
/*
rgb1 => magentas & pinks & pale pink
rgb2 => blues to purples
littleGreen1 => blinking
littleGreen2 => intensity range 70 - 0
green => intensity range 30 - 0
yellow => intensity range 50 - 0
red => intensity range 20 - 0
 */
const board = five.Board()

board.on(`ready`, function boardReady() {
  const littleGreen1 = new five.Led(LIGHTS.littleGreen1)
  const littleGreen2 = new five.Led(LIGHTS.littleGreen2)
  const green = new five.Led(LIGHTS.green)
  const red = new five.Led(LIGHTS.red)
  const yellow = new five.Led(LIGHTS.yellow)
  const rgb1 = new five.Led.RGB({pins: LIGHTS.rgb1})
  const rgb2 = new five.Led.RGB({pins: LIGHTS.rgb2})

  // const Led = {of: (x) => new five.Led(x)}
  // Led.RGB = {of: (x) => new five.Led.RGB(x)}
  // const rgb1 = Led.RGB.of({
  //   pins: LIGHTS.rgb1
  // })
  // const rgb2 = Led.RGB.of({
  //   pins: LIGHTS.rgb2
  // })
  // const [
  //   littleGreen2,
  //   littleGreen2,
  //   green,
  //   yellow,
  //   red
  // ] = map(Led.of, [
  //   LIGHTS.littleGreen2,
  //   LIGHTS.littleGreen2,
  //   LIGHTS.green,
  //   LIGHTS.yellow,
  //   LIGHTS.red
  // ])
  const on = e0(`on`)
  const off = e0(`off`)

  // Add led to REPL (optional)
  this.repl.inject({
    littleGreen1,
    littleGreen2,
    green,
    red,
    yellow,
    rgb1,
    rgb2
  })

  // Turn it on and set the initial color
  // on(littleGreen1)
  // littleGreen1.on()
  // green.on()
  // on(littleGreen1)
  // green => littleGreen2 => yellow => littleGreen1 => red
  on(green)
  setTimeout(() => {
    off(green)
    on(littleGreen2)
  }, 1000)
  setTimeout(() => {
    off(littleGreen2)
    on(yellow)
  }, 2000)
  setTimeout(() => {
    off(yellow)
    on(littleGreen1)
  }, 3000)
  setTimeout(() => {
    off(littleGreen1)
    on(red)
  }, 4000)
  setTimeout(() => {
    off(red)
    rgb1.color(`#ff00ff`)
  }, 5000)
  setTimeout(() => {
    off(rgb1)
    rgb2.color(`#ffff00`)
  }, 6000)
})
