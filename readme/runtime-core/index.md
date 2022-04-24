### runtime-core

为运行时主要代码

### 入口

向外抛出`createRender`来创建渲染入口。此函数可以传入`patch`过程中的处理函数。

### createVnode

创建 vnode,返回一个对象，上面的键`type`为原始的`createVnode`第一个参数。可能为`string`,如： div,
也可以是{render:()=>any,setup(){}}等一个组件对象。会在这里处理[shageFlags](./%E6%8C%89%E4%BD%8D%E8%BF%90%E7%AE%97%E7%AC%A6.md),也可以是一些类型，如：Text

### render

有了 vnode 就可以渲染到真实 dom 了。render 函数就干这事。render 中主要是执行`patch`函数，把 vnode 对比增加到 dom 中。

### patch

生成 dom 元素，或生成组件实例，渲染组件。
对比两个 vnode,找出差异，改变 dom。

patch 收到的 vnode 主要为两种

1. html 类型的 vnode。表现为 type 为字符串。这种直接新建此类型的 html 即可，然后根据 props 等进行处理。
2. 组件类型的 vnode。此种 vnode 需要得到真正需要渲染的内容，来源于`render`函数。且需要生成组件实例`instnce`，上面挂着的一些内容。

```js
instance.type = 原始的组件
;(instance.subTree = render返回的vnode), 此组件需要渲染的vnode
```

### element 类型

对于元素类型的处理。主要分为，当没有需要旧节点时就是需要新建。调用`mountElement`。当有新旧节点时，则调用`patchElement`进行对比更新。

在`patchElement`内又会对子元素和自身的 props 进行对比更新，这样一棵树就完成了更新。子元素的详细 diff 过程参照[diff](../diff.md)

### component 类型

对于组件类型，也分为有无旧组件情况。
当没有旧组件时，直接进行组件实例的创建，然后获得组件需要渲染的内容，进行 patch 生成 dom。

当有旧组件时，我们会进入到更新组件的流程。

此时的组件的 vnode 还是正常生成，因为他在更新中属于父组件的子组件。如

```js
// app component
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
```

当 app 组件更新时，其 render 重新执行，还是会生成 foo 组件的 vnode。

目前我们得到的是新旧两个 vnode。

#### 判断组件是否应该更新

我们如何来判断组件时候应该更新呢，我们看看影响组件渲染的因素有哪些。

1. 组件接受到的 props 变化了，这种情况组件就需要重新 render 出正确的值
2. 组件内部的值变化了，这种情况会直接触发组件内部重新 render 不属于目前这种父元素变化而重新生成的 vnode，所以这种情况不考虑。

第一件事肯定就是把之前的组件实例迁移过来。所以新 vnode 是不会重新生成新组件实例的。

```js
    const instance = vnode2.component = vnode1.component as instance // 上次的组件实例 instance
```

##### 组件不需要更新时

我们把挂载到老 vnode 上面的实例挂载到新 vnode 上。同时老 vnode 的$el 赋值到新 vnode 上。老 vnode 上的实例又引用这老 vnode，所以实例也更新一下

```js
vnode2.$el = vnode1.$el
instance.vnode = vnode2
```

##### 需要更新组件时

```js
    instance.next = vnode2
    instance.update!()
```

我们向组件实例上挂载一个新的 vnode，键为 next。然后执行更新组件的方法。

在更新组件的时候，我们会根据是否有`next`来判断是更新组件逻辑

```js
const { next } = instance
if (next) {
  next.$el = instance.vnode.$el
  updateComponentProps(instance, next)
}

function updateComponentProps(instance: instance, next: vnode) {
  instance.vnode = next
  instance.next = null
  instance.props = next.props
}
```

当我们是更新的时候，我们需要更新实例的props。也会像不用更新组件实例那样，把老vnode上挂载的东西迁移到新vnode。如$el，更新实例的vnode为新vnode。清空next，防止下次进入更新流程。然后执行组件实例返回值的patch。就完成了整个过程。

