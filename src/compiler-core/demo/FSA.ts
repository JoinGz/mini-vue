enum statusMap {
  init,
  tagOpen,
  tagName,
  tagEnd,
}

export function tokenizen(str: string) {
  const chars: string[] = []
  const result = []
  let cureentStatus = statusMap.init

  while (str) {
    const nowFirstChar = str.slice(0, 1)
    if (cureentStatus === statusMap.init) {
      if (nowFirstChar === '<') {
        cureentStatus = statusMap.tagOpen
        str = str.slice(1)
      } else if (isAlphabet(nowFirstChar)) {
        chars.push(nowFirstChar)
        str = str.slice(1)
        if (str === '') {
          result.push({
            type: 'text',
            value: chars.join(''),
          })
        }
        cureentStatus = statusMap.init
      }
    } else if (cureentStatus === statusMap.tagOpen) {
      if (isAlphabet(nowFirstChar)) {
        cureentStatus = statusMap.tagName
      } else if (nowFirstChar === '/') {
        cureentStatus = statusMap.tagEnd
        str = str.slice(1)
      }
    } else if (cureentStatus === statusMap.tagName) {
      if (isAlphabet(nowFirstChar)) {
        chars.push(nowFirstChar)
        str = str.slice(1)
      } else if (nowFirstChar === '>') {
        result.push({
          type: 'tag',
          value: chars.join(''),
        })
        chars.length = 0
        str = str.slice(1)
      } else if (nowFirstChar === '/') {
        cureentStatus = statusMap.tagEnd
        str = str.slice(1)
      } else if (nowFirstChar === '<') {
        result.push({
          type: 'text',
          value: chars.join(''),
        })
        chars.length = 0
        cureentStatus = statusMap.tagOpen
        str = str.slice(1)
      }
    } else if (cureentStatus === statusMap.tagEnd) {
      if (isAlphabet(nowFirstChar)) {
        chars.push(nowFirstChar)
        str = str.slice(1)
      } else if (nowFirstChar === '>') {
        str = str.slice(1)
        cureentStatus = statusMap.init
        result.push({
          type: 'tagEnd',
          value: chars.join(''),
        })
        chars.length = 0
      }
    }
  }
  return result
}
function isAlphabet(char: string) {
  return /[a-z]/gi.test(char)
}
