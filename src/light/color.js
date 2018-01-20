export const random = () => {
  const core = Math.random() * (Math.pow(2, 24) - 1)
  let root = Math.floor(core).toString(16)
  while (root.length < 6) {
    root += `0` // eslint-disable-line
  }
  return `#` + root
}
