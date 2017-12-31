const five = require(`johnny-five`)
const Redbot = require(`five-redbot`)

const board = new five.Board()
// console.log(`redbot,`, redbot, Object.keys(redbot))

board.on(`ready`, function ready() {
  const motor = new Redbot(board)
  console.log(`motor`, motor)
  // const encoder = new redbot.RedbotEncoder(board, 15, 16, motor.leftMotor, motor.rightMotor)

  function turnWheelOnce() {
    // encoder.clearEnc(`BOTH`)
    // const stopListener = (ticks) => {
    //   if (ticks > 16 || ticks < -16) {
    //     motor.brake()
    //     // console.log(encoder.getTicks(`LEFT`))
    //   }
    // }

    // encoder.leftEncoder.on(`tick`, stopListener)
    motor.drive(180)
  }

  this.repl.inject({
    // e: encoder,
    m: motor,
    t: turnWheelOnce
  })
})
