import { anyFunction } from '../../reactivity/watch'

function nextFrame(fn: anyFunction) {
  requestAnimationFrame(fn)
}
export const Transtion = {
  name: 'Transtion',
  setup(props: any, { slot }: { slot: any }) {
    return () => {
      const children = slot.default()[0]
      children.transtionOps = {
        beforEnter(el: HTMLDivElement) {
          el.classList.add('enter-from')
          el.classList.add('enter-active')
          console.log(`before enter`)
        },
        enter(el: HTMLDivElement) {
          nextFrame(() => {
            el.classList.remove('enter-from')
            el.classList.add('enter-to')
          })
          el.addEventListener('transitionend', () => {
            el.classList.remove('enter-to')
            el.classList.remove('enter-active')
          })
          console.log(`enter`)
        },
        leave(remove: anyFunction, el: Element) {
          console.log(`leave`)
          el.classList.add('leave-active')
          el.classList.add('leave-from')
          nextFrame(() => {
            el.classList.remove('leave-from')
            el.classList.add('leave-to')
          })
          el.addEventListener('transitionend', () => {
            el.classList.remove('leave-active')
            el.classList.remove('leave-from')
            remove(el)
          })
        },
      }
      return children
    }
  },
}
