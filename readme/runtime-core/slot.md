### slot 的实现

```js
// parent
render () {
    const slots = {
      header: ({age}) => h('p', null, 'header' + age),
      footer: () => h('p', null, 'footer'),
    }
    return h(
      'div',
      {
        id: 'hello',
      },
      [
        h('p', { onClick: () => console.log('clicked') }, 'hi, mini-vue!'),
        h(foo, {}, slots),
      ]
    )
  }
// son
render() {
    const p = h('p', null, 'foo')
    return h('div', null, [
      renderSlot(this.$slot, 'header', {age: 18}),
      p,
      renderSlot(this.$slot, 'footer'),
    ])
  }
```

在组件标签内部书写的东西，会被放到组件的`children`里面,这和 html 标签是一致的。如：

```js
h('div', null, 'text')
h(foo, null, h('div', null, 'text'))
```

在`h`函数，创建`vnode`时,会处理`slot`类型。如果他是一个组件类型，且`children`是一个对象就认为是一个`SLOT_CHILDREN`类型。

后面在`initSlots`中，会对类型进行判断，如果符合我们的类型，我们就会进行 slot 初始化操作。

#### 初始化 slot

因为我们传入的 slot 其实是一个对象，我们需要转为 vnode，才能渲染出来。如果执行这些内容。

```js
// 原始的slots
let slots = {
  header: ({ age }) => h('p', null, 'header' + age),
  footer: () => h('p', null, 'footer'),
}
// 处理后的slots

slots = {
  header: (...arg) => {
    const value = slotType(...arg)
    return normalizeSoltValue(value)
  },
}
```

`slotType`是从 slots 里面取出的原始 funtion,返回值为 vnode。同时用`normalizeSoltValue`进行处理，把不是数组的变成数组，因为我们 patch 的时候是对数组进行的处理。数据处理好之后挂载到实例上。键为`$slot`。此时实例上的内容就处理完成了。接下来进入渲染

### 渲染

因为的`slots`是一个对象，不是所需要的 vnode,所以我们借助`renderSlot`来得到处理好的 vnode。同时在组件内部获取到需要传入的值传入即可。

```js
// vnode结构

h('div', null, [
  renderSlot(this.$slot, 'header', { age: 18 }),
  p,
  renderSlot(this.$slot, 'footer'),
])

// renderSlot
function renderSlot(children, slotName, ...arg) {
  const slot = children[slotName]
  if (slot) {
    if (typeof slot === 'function') {
      // 在slot调用后得到 vnode
      return h(Fragment, null, slot(...arg))
    }
  }
}
```
在`h`中有一个symbol为`Fragment`。他是一种vnode的type。对于此type,我们渲染的时候是不会创建多余的父元素的，而是插入到指定元素的前面。