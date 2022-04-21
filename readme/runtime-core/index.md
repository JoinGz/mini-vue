### runtime-core

为运行时主要代码

### 入口

向外抛出`createRender`来创建渲染入口。此函数可以传入`patch`过程中的处理函数。





### createVnode

创建vnode,返回一个对象，上面的键`type`为原始的`createVnode`第一个参数。可能为`string`,如： div,
也可以是{render:()=>any,setup(){}}等一个组件对象。会在这里处理[shageFlags](./%E6%8C%89%E4%BD%8D%E8%BF%90%E7%AE%97%E7%AC%A6.md),也可以是一些类型，如：Text


### render

有了vnode就可以渲染到真实dom了。render函数就干这事。render中主要是执行`patch`函数，把vnode对比增加到dom中。


### patch

对比两个vnode,找出差异，改变dom。

patch收到的vnode主要为两种
1. html类型的vnode。表现为type为字符串。这种直接新建此类型的html即可，然后根据props等进行处理。
2. 组件类型的vnode。此种vnode需要得到真正需要渲染的内容，来源于`render`函数。且需要生成组件实例`instnce`，上面挂着的一些内容。

```js

instance.type = 原始的组件
instance.subTree = render返回的vnode,此组件需要渲染的vnode

```


