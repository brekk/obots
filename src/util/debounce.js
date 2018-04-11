import {curry} from 'f-utility'
import _debounce from 'lodash.debounce'
export const debounce = curry((amount, fn) => _debounce(fn, amount))
