import { h, ref, onMounted } from '../../lib/index.esm.js'


export const app = {
  name: 'app',
  setup () {
    onMounted(() => console.log(`app onMounted`))
    const count = ref(0)

    const attrData = ref({id: 'id', name: "name", foo: 'foo'})

    const onAddCount = () => {
      count.value++
    }

    const changeAttrDataId = () => {
      attrData.value.id = 'new_id'
    }
    const changeAttrDataName = () => {
      attrData.value.name = null
    }
    const changeAttrData = () => {
      attrData.value = {"foo": 'newFoo'}
    }

    const clickFnShow =  ref(false)

    return {
      count,
      msg: 'p-one',
      onAddCount,
      attrData,
      changeAttrDataName,
      changeAttrData,
      changeAttrDataId,
      clickFnShow
    }
  },
  render() {
    return h(
      'div',
      {
        class: 'class',
        ...this.attrData,
        onClick: this.clickFnShow ? ()=>{console.log("clicked")} : null
      },
      [
        h('p', { onClick: () => console.log('clicked') }, this.count + "" /*render中判断的为string,才是子元素string类型*/),
        h('button', { onClick: () => this.onAddCount() }, 'changeCount'),
        h('button', { onClick: () => this.changeAttrDataId() }, 'changeAttrDataId->改变id'),
        h('button', { onClick: () => this.changeAttrDataName() }, 'changeAttrDataName->name=null->删除name'),
        h('button', { onClick: () => this.changeAttrData() }, 'changeAttrData->重新复制->删除name,id'),
        h('button', { onClick: (...arg) => console.log(...arg) }, 'click_test'),
        h('button', { onClick: [(...arg) => console.log(...arg), ()=>console.log(`end`)] }, 'click_test muliti function'),
        h('button', { onClick: () => { this.clickFnShow = true } },'changeClickFnShow'),
      ]
    )
  },
}
