import five from 'johnny-five'
import {
  isNumber,
  isDistinctObject
} from 'f-utility'
export const Led = {
  of: (x) => {
    if (isNumber(x)) {
      return new five.Led(x)
    } else if (isDistinctObject(x)) {
      const {pins, r, g, b, red, green, blue} = x
      const rgb = (y) => new five.Led.RGB(y)
      if (pins) {
        return rgb({ pins })
      }
      if (r && g && b) {
        return rgb({ pins: {red: r, green: g, blue: b} })
      }
      if (red && green && blue) {
        return rgb({ pins: {red, green, blue} })
      }
      return rgb(x)
    }
  }
}
