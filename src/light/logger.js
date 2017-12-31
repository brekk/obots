import bug from 'debug'
import {LOGGER_NAMESPACE} from './constants'
export const log = bug(LOGGER_NAMESPACE)
export const makeLogger = (str) => bug(LOGGER_NAMESPACE + `:${str}`)
