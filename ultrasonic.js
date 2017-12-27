const five = require(`johnny-five`)
const {curry} = require(`f-utility`)
const board = new five.Board()
const _debounce = require('lodash.debounce')
// _debounce(fn, amount)
const debounce = curry((amount, fn) => _debounce(fn, amount))

const sensorDelay = debounce(10)

board.on(`ready`, function() {
  const proximity = new five.Proximity({
    controller: `HCSR04`,
    pin: 7
  })

  proximity.on(`data`, sensorDelay(function() {
    console.log(`Proximity: `)
    console.log(`  cm  : `, this.cm)
    console.log(`  in  : `, this.in)
    console.log(`-----------------`)
  }))

  // proximity.on(`change`, sensorDelay(function() {
  //   console.log(`The obstruction has moved.`)
  // }))
})
