export enum tokenTypes  {
  TAGBEGIN = "TAGBEGIN",
  TAGEND = "TAGEND",
  TEXT = "TEXT",
}


export enum statusMap {
  init,
  tagOpen,
  tagName,
  text,
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
        cureentStatus = statusMap.text
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
          type: tokenTypes.TAGBEGIN,
          value: chars.join(''),
        })
        chars.length = 0
        str = str.slice(1)
        cureentStatus = statusMap.init
      }
    }
    else if (cureentStatus === statusMap.text) {
      if (isAlphabet(nowFirstChar)) {
        chars.push(nowFirstChar)
        str = str.slice(1)
        if (str === '') {
          result.push({
            type: tokenTypes.TEXT,
            value: chars.join(''),
          })
        }
      }  else if (nowFirstChar === '<') {
        result.push({
          type: tokenTypes.TEXT,
          value: chars.join(''),
        })
        chars.length = 0
        cureentStatus = statusMap.tagOpen
        str = str.slice(1)
      }
    }
    else if (cureentStatus === statusMap.tagEnd) {
      if (isAlphabet(nowFirstChar)) {
        chars.push(nowFirstChar)
        str = str.slice(1)
      } else if (nowFirstChar === '>') {
        str = str.slice(1)
        cureentStatus = statusMap.init
        result.push({
          type: tokenTypes.TAGEND,
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
