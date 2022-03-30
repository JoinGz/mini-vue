import { h, ref } from '../../lib/index.esm.js'


export const app = {
  name: 'app',
  setup () {
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

    return {
      count,
      msg: 'p-one',
      onAddCount,
      attrData,
      changeAttrDataName,
      changeAttrData,
      changeAttrDataId
    }
  },
  render() {
    return h(
      'div',
      {
        class: 'class',
        ...this.attrData
      },
      [
        h('p', { onClick: () => console.log('clicked') }, this.count),
        h('button', { onClick: () => this.onAddCount() }, 'changeCount'),
        h('button', { onClick: () => this.changeAttrDataId() }, 'changeAttrDataId->改变id'),
        h('button', { onClick: () => this.changeAttrDataName() }, 'changeAttrDataName->name=null->删除name'),
        h('button', { onClick: () => this.changeAttrData() }, 'changeAttrData->重新复制->删除name,id'),
      ]
    )
  },
}
