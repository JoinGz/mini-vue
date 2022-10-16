### 核心

-   不重新创建

    缓存vnode。因为vnode上面有instance和生成的dom所以不用重新生成
-  渲染器结合

    在patch时，因为两次vnode的type不一致所以，vnode1会被卸载掉。然后执行生成vnode2实例前，判断是否已经keepAlive，如果是则直接挂载。跳过了组件生成实例等一系列步骤。


### 步骤

  编写keepAlive组件时，提供`__isKeepAlive: true`标识来表示是一个keepAlive组件。当渲染器遇到此种类型的组件时，会在vnode上提供`keepAliveCtx`对象。里面的`move`和`createElement`方法，用来处理缓存的组件dom。这里是把缓存的组件dom放入一个`createElement`创建的盒子里。我们在`keepAlive`的组件实例上挂载了两个方法：`activated`和`deActivated`。`activated`用于激活组件的时候，从缓冲的盒子中取出组件生成的dom。`deActivated`则是在移除时把组件生成的dom放入缓存的盒子，这两个都是挂载在`keepAlive`的实例上的，方便后面的组件使用，不用挂载每个组件上面了。

  在组件内，创建一个`Map`容器用来缓存生成的vnode。用生成vnode时用的type当键来映射。
    当`keepAlive`组件不是返回的组件时，我们直接渲染此vnode。除此外进入正常的流程。
    组件vnode上面新挂载两个属性：`shouldKeepAlive`和`keptAlive`，`shouldKeepAlive`赋值在缓存了组件之后，其作用时卸载时渲染器调用`deActivated`，把组件dom放入缓存的盒子而不是真实的卸载。`keptAlive`则是避免重新渲染，在第一次渲染后`keepAlive`组件里面的`Map`就缓存了这个组件了。所以根据这个标识，在渲染的时候跳过这个组件的渲染，直接执行`activated`把缓存盒子里面的dom放入页面。