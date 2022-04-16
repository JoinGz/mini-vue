### 第一版的effect的实现过程

### 依赖收集

使用的是`Proxy`对象,还是在`get`,`set`方法中设置对应的事件。

#### get
在对象`get`的过程中。`track`收集会被触发，通过`activeEffect`来绑定当前的回调函数的对象。他是一个全局对象，在每次触发依赖收集前会被重写。重写为当前收集对象的回调。

依赖的去重：用map保存了所有对象与收集到依赖的关系。keyMap里面有保存着每个key对应的执行函数。通过`Set`来去重。

#### set
在对象`set`的过程中。`trigger`触发依赖，根据我们保存的map对象从中取出函数执行即可。



### 解决循环依赖的问题

```js
    const user = reactive({ age: 10 })
    let userAge
    effect(() => {
      userAge = user.age++ // Maximum call stack size exceeded
    })

    // get  -> 10
    // set  -> 11 -> 触发 get 收集的依赖

    expect(userAge).toBe(10)
  
```
上面的例子会出现堆栈异常错误。出现的原因是：在`effect`函数里，有一行`user.age++`,这句代码写完整就是`user.age = user.age + 1`,所以他会涉及到两个操作，第一个是`get`，先取到`user.age`的值，然后就行`set`操作,值+1。

在执行`get`操作时，就进行了依赖收集工作，把整个
`() => {
  userAge = user.age++
}`
作为依赖收集。

整个流程就是：
1. 获取`user.age`的值，得到10。并完成了依赖收集
2. 把`user.age`的值+1，同时触发收集到的依赖。
3. 触发依赖，执行`userAge = user.age++`
4. 进入死循环，重复执行1,2,3直到抛出堆栈异常错误

#### 处理思路

查看vue-core中的`effect`部分源码，对`activeEffect`进行处理，新增依赖收集完成后`activeEffect`清空，赋值为null。再在执行依赖的地方增加限制

```js

run(){
  if (this.active) {
    activeEffect = this
    shouldTrack = true
    result = this._fn()
    activeEffect = null
    shouldTrack = false
  }
}

// 触发时
export function triggerEffects(deps: any) {
  for (const effect of deps) {
    if (effect !== activeEffect) {
      if (typeof effect.options?.scheduler === 'function') {
        effect.options.scheduler()
      } else {
        effect.run()
      }
    }
  }
}
```

如果 `effect` 不等于 `activeEffect`，就是已经结束过一次的effect中的函数，就正常执行。

#### shouldTrack的作用

判断是否需要收集依赖

```js
const user = reactive({ age: 10 })
user.age++
```

`user`是一个响应式对象，但在`user.age++`时不会进行依赖收集，就是`shouldTrack`在控制。

如果放在effect中，就会进行依赖收集
```js
    effect(() => {
      userAge = user.age++
    })
```
在effect中会对`shouldTrack`进行处理（在`run`中）。