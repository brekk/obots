import {curry} from 'f-utility'
export const when = curry(
  (condition, fn, input) => (
    condition && fn(input)
  )
)
export const whenever = curry(
  (conditionFn, fn, input) => {
    if (conditionFn(input)) {
      return fn(input)
    }
  }
)
export const whenElse = curry(
  (conditionFn, great, otherwise, input) => (
    conditionFn(input) ?
      great :
      otherwise
  )(input)
)
