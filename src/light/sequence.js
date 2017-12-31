import {curry, curryObjectK} from 'f-utility'
import _color from 'colortransition'
const color = curry(_color)

// TODO: make this support more than two colors!
export const colorSequence = curryObjectK(
  [`scale`, `colors`, `interval`, `cb`],
  ({scale, colors, interval, cb, limit = 100}) => {
    const [start, end] = colors
    const changeColorByPercentage = color(start, end)
    let count = 0
    let counter = scale
    return setInterval(() => {
      // lightLog(`counting! ${count} + ${counter}`, count + counter)
      count += counter
      if (count > limit || count <= 0) {
        counter *= -1
      }
      if (count <= 0) {
        count = 0
      }
      if (count >= limit) {
        count = limit
      }
      // count %= limit
      cb(changeColorByPercentage(count))
    }, interval)
  }
)
