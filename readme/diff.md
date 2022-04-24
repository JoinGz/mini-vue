## 前言

记录一下 diff 开发流程

## diff 的四种情况

### 文本节点->文本节点

对比文本是否一样，不一样则进行替换。

### 文本->数组节点

删除原来的文本节点，遍历新增数组节点

### 数组节点->文本

遍历删除原来的数组节点，新增文本节点

### 数组节点->数组节点

通过 3 个指针来实现数组节点的比较。

第一个指针为默认为 0,接下来遍历数组,如果接下来新旧节点类型和 key 相同就移动指针。

第二个指针为老节点的最后一位

第三个指针为新节点的最后一位

如：

```js
// (a b) c 老节点
// (a b) d e 新节点
//  0 1  2 3
// 第一个指针i 为0 新老节点的开始
// 第二个指针e1 为2 老节点最后一位
// 第三个指针e2 为3 新节点最后一位
```

我们开始用指针来遍历新老节点。左侧的对比中 i 停在小于等于 e1 且小于等于 e2 的地方,右侧的对比中 e1,e2 停在大于等于 i 的地方。当不能满足以上条件的时候，循环结束，我们拿此时的 i, e1, e2 来做进一步的处理。

当两个节点 type 和 key 都一致的时候，我们就直接 patch 这个两个节点。

通过这 3 个指针我们能实现：

- 老节点比新节点长 -> 删除老节点

  - 当 i > e2 时

  ```js
  // 左侧
  // (a b) c
  // (a b)
  //  0 1  2
  // i = 2, e1 = 2, e2 = 1 把c侧删除

  // 右侧
  // a (b c)
  //   (b c)
  // 0  1 2
  // i = 0, e1 = 2, e2 = -1 把a侧删除
  ```

- 老节点比新节点短 -> 新增新节点

  - 当 i > e1 且 i <= e2 时

  ```js
  // 左侧
  // (a b)
  // (a b) c d
  //  0 1  2 3
  // i = 2, e1 = 1, e2 = 3 把cd侧新增

  // 右侧 (逻辑同样适用)
  //     (a b)
  // c d (a b)
  // 0 1  2 3
  // i = 0, e1 = -1, e2 = 1 把cd侧新增
  ```

- 中间对比

  - <span id="middleChange">中间部分的改和删除</span>

    遍历老的节点，如果新节点中有对应的老节点（通过 key 的 type 来判断是否一致）。就进行 patch 对比。如果新节点中没有老节点就删除。

    我们需要先找出一些变量，方便后面的操作

    1. 找出新增节点的 key 和新增节点的 index(位置)关系。`keyToNewIndexMap`的键为新节点的 key,值为新节点的在整个数组中的位置

    ```ts
    const keyToNewIndexMap = {}

    for (let j = i; j <= e2; j++) {
      const vnode = newChildren[j]
      if (vnode.key) {
        keyToNewIndexMap[vnode.key] = j
      }
    }

    // 一个工具函数 根据新节点的key返回起所在位置
    function getIndexFromKey(key: string | number) {
      return keyToNewIndexMap[key]
    }
    ```

    2. 我们需要知道中间部分新节点的个数。这里用`toBePatchedNum`来保存。用`patchedNum`来保存已经对比过的个数，如果个数大于等于了`toBePatchedNum`就说明了新节点已经遍历完成。如果还有老节点就直接删除。

    ```js
    const toBePatchedNum = e2 - i + 1
    // a,b,(c,d),f,g
    // a,b,(e,c),f,g
    // 0 1  2 3  4 5
    // 如 上面的新增节点数为2（e,c）
    ```

    接下来开始对比

    取一个老节点，用老节点的 key 在`keyToNewIndexMap`寻找，看是否有新节点与之对应。如果`keyToNewIndexMap`里没有，还需要在新节点里面遍历来寻找是否有一样的元素（type 和 key 相同的元素）。因为用户可能没有设置 key。如果都没有找到就说明需要删除老节点。

    如果找到了就直接 patch 对比更新差异

    这样中间部分的删除的改动就处理完了

  - 中间部分的移动和新增

    找出新节点对应老节点的位置（索引）信息，用此索引求的最长递增子序列。然后新节点和最长递增子序列的值来进行比较。如果没有在最长递增子序列里面的说明需要移动。

    1. 找出新节点对应老节点的位置（索引）信息
       用`newIndexToOldIndex`来保存新旧节点的位置对应关系，并初始化为 0

    ```js
    // 初始化映射
    const newIndexToOldIndex = new Array(toBePatchedNum)
    for (let i = 0; i < toBePatchedNum; i++) {
      newIndexToOldIndex[i] = 0
    }
    ```

    因为在[中间部分的改和删除](#middleChange)中，当在老节点中找到新节点时，会进行对比。所以可以在此时可以进行新旧节点位置赋值操作。

    ```js
    newIndexToOldIndex[currentIndex - i] = j + 1
    ```

    其中`currentIndex`为新节点的索引位置，`i`为左边对比后停留的位置，减`i`是为了索引从零开始，`j`为老节点的位置。

    在更新新节点对应老节点位置信息时 `j + 1` 的目的: `newIndexToOldIndex`初始化的时候值为 0，所有如果对比完后值没有改变，表示新节点在老节点不存在，需要新建。是有这一层含义的。

    ```js
    // a,b,(c,d,e),f,g
    // a,b,(e,c,d),f,g
    // 0 1  2 3 4  5 6
    // i = 2, e1 = 4, e2 = 4
    newIndexToOldIndex = [4 + 1, 2 + 1, 3 + 1] // [5,3,4]
    // 新节点中e对应的老节点位置为4,为了不和初始化冲突+1,就是5
    // 新节点中c的对应老节点的位置为2 + 1 = 3
    // 新节点中d的对应老节点的位置为3 + 1 = 4
    // 最长子序列：[5,3,4] => [1,2] // 3 和 4
    ```

    遍历新增的子节点（上面的就是e,c,d），这里我们采用倒序，因为只有后面的节点是稳定的。如果`newIndexToOldIndex`值为初始值0时,表示没有在老节点中找到新节点需要新建。如果`N`不在最长递增子序列中或最长递增子序列已经遍历完表示需要移动。

    ```ts
      for (let N = newIndexToOldIndex.length - 1; N >= 0; N--) {
          const nextIndex = N + i + 1
          const nextChild = newChildren![nextIndex] ? (newChildren![nextIndex] as vnode).$el : null
          // 新增元素
          if (newIndexToOldIndex[N] === 0) {
            patch(null, newChildren![nextIndex - 1] as vnode, el, parentInstance, nextChild as HTMLElement)
          } else if (needMove) {
            if (sequenceIndex < 0 || N !== increasingNewIndexSequence[sequenceIndex]) {
              insert(el, (newChildren![nextIndex - 1] as vnode).$el, nextChild)
              console.log('需要移动');
            } else {
              sequenceIndex--
            }
          }
      }
    ```

    - 判断是否需要最长递增子序列

      声明两个`maxIndex`,`needMove`值来判断。
      ```js
        let maxIndex = 0
        let needMove = false
      ```
      记录上一次的index，如果不需要移动，那么每次的index都会等于或大于上次的index，如果出现相反的情况就说明需要移动。

### key值的作用

- 提高性能，遍历的时候从o(n)降到o(1)
- 准确找到哪些元素增删改了