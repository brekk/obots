import five from 'johnny-five'
export const Button = {
  of: (x) => new five.Button(x)
}
