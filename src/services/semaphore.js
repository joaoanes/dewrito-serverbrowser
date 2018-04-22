// stolen from await-semaphore

class Semaphore {
  constructor (count) {
    this.tasks = []
    this.count = count
  }
  sched () {
    if (this.count > 0 && this.tasks.length > 0) {
      this.count--
      let next = this.tasks.shift()
      if (next === undefined) {
        throw new Error('Unexpected undefined value in tasks list')
      }
      next()
    }
  }
  acquire () {
    return new Promise((resolve, reject) => {
      var task = () => {
        var released = false
        resolve(() => {
          if (!released) {
            released = true
            this.count++
            this.sched()
          }
        })
      }
      this.tasks.push(task)
      if (process && process.nextTick) {
        process.nextTick(this.sched.bind(this))
      } else {
        setImmediate(this.sched.bind(this))
      }
    })
  }
  use (f) {
    return this.acquire()
      .then(release => f()
        .then((res) => {
          release()
          return res
        })
        .catch((err) => {
          release()
          throw err
        }))
  }
}
export default Semaphore
