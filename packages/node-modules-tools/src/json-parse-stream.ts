import StreamJSON from 'stream-json'
import Assembler from 'stream-json/Assembler'

export function jsonParseStream<T>(stream: NodeJS.ReadableStream): Promise<T> {
  const assembler = new Assembler()
  const parser = StreamJSON.parser()

  return new Promise((resolve) => {
    parser.on('data', (chunk) => {
      // @ts-expect-error casting
      assembler[chunk.name]?.(chunk.value)
    })

    stream.pipe(parser)

    parser.on('end', () => {
      resolve(assembler.current)
    })
  })
}
