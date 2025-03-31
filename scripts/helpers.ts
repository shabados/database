import { type ColorInput, color } from 'bun'

const colorize =
  (colorName: ColorInput) =>
  (...args: Parameters<typeof console.log>) =>
    color(colorName, 'ansi') + args[0]

export const log = {
  stage: (...args: Parameters<typeof console.log>) => {
    const [message, ...rest] = args
    console.log(colorize('blue')(`\n${message}`, ...rest))
  },
  success: (...args: Parameters<typeof console.log>) => {
    const [message, ...rest] = args
    console.log(colorize('forestgreen')(`✔️ ${message}`, ...rest))
  },
  info: (...args: Parameters<typeof console.info>) => console.info(colorize('blue')(...args)),
  error: (...args: Parameters<typeof console.error>) => console.error(colorize('red')(...args)),
  warn: (...args: Parameters<typeof console.warn>) => console.warn(colorize('yellow')(...args)),
  debug: (...args: Parameters<typeof console.debug>) =>
    console.debug(colorize('whiteBright')(...args)),
  trace: (...args: Parameters<typeof console.trace>) => console.trace(colorize('magenta')(...args)),
}
