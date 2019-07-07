// '{{price}} 元' -> _s(this.props.data.{price})+‘ 元’

const tagRE = /\{\{((?:.|\n)+?)\}\}/g
export default function parseText(text: string): string {
  let result
  const tokens: string[] = []
  let lastIndex = 0
  // tslint:disable-next-line: no-conditional-assignment
  while ((result = tagRE.exec(text)) !== null) {
    if (result.index > lastIndex) {
      // 放入非匹配内容，并且进行 encode
      tokens.push(JSON.stringify(text.slice(lastIndex, result.index)))
    }
    tokens.push(`this._s(this.data.${result[1].trim()})`)
    lastIndex = tagRE.lastIndex
  }
  if (lastIndex < text.length - 1) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  return tokens.join("+")
}
