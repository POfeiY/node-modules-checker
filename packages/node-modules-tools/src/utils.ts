export * from './utils/index'
// strip UTF-8 BOM
export function stripBomTag(content: string): string {
  // @ts-expect-error unicorn/number-literal-case
  if (content.charAt(0) === 0xFEFF)
    return content.slice(1)
  return content
}
