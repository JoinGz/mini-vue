

const queue: (()=>any)[] = []

let hadPromise = false

export function nextTick(fn: (...arg: any[])=>any) {
  return fn ? Promise.resolve().then(fn) : Promise.resolve()
}

export function queueJobs(fn: ()=>any) {
  if (!queue.includes(fn)) {
    queue.push(fn)
  }

  queueFlush()

}

function queueFlush() {
  if (!hadPromise) {
    hadPromise = true
    return nextTick(queueRun)
  }
}

function queueRun() {
  hadPromise = false // 一开始就结束，让任务里面的也可以产生微任务
  let job;
  while (job = queue.shift()) {
    job && job()
  }
}