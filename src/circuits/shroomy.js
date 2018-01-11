import five from 'johnny-five'
import {
  e0
} from 'entrust'
import {COLORS} from '../light'
const K = (x) => () => x
// import {
//   isNumber,
//   map,
//   ternary
// } from 'f-utility'
const LIGHTS = {
  rgb1: {
    red: 3,
    green: 5,
    blue: 6
  },
  rgb2: {
    red: 9,
    green: 10,
    blue: 11
  },
  littleGreen1: 25,
  littleGreen2: 22,
  green: 23,
  yellow: 27,
  red: 24,
  white: 28,
  blue: 26
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
  const blue = new five.Led(LIGHTS.blue)
  const white = new five.Led(LIGHTS.white)
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
    rgb2,
    white,
    blue
  })

  // lg1 => rgb2(purple) => red => green =>
  // white => rgb1(magenta) => blue => yellow => lg2
  const S = [
    littleGreen1,
    rgb2,
    red,
    green,
    white,
    rgb1,
    littleGreen2,
    yellow,
    blue
  ]
  on(S[0])
  setTimeout(() => {
    off(S[0])
    // on(S[1])
    rgb2.color(COLORS.PURPLE)
    rgb2.intensity(8)
  }, 1000)
  setTimeout(() => {
    off(S[1])
    // rgb2.off()
    on(S[2])
  }, 2000)
  setTimeout(() => {
    off(S[2])
    on(S[3])
  }, 3000)
  setTimeout(() => {
    off(S[3])
    on(S[4])
  }, 4000)
  setTimeout(() => {
    off(S[4])
    rgb1.color(COLORS.MAGENTA)
    rgb1.intensity(12)
    // on(S[5])
  }, 5000)
  setTimeout(() => {
    off(S[5])
    on(S[6])
  }, 6000)
  setTimeout(() => {
    off(S[6])
    on(S[7])
  }, 7000)
  setTimeout(() => {
    off(S[7])
    on(S[8])
  }, 8000)
})
