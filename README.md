# vuedemo
## vue2 响应式数据的理解？（基本问题，源码是怎么实现的，你用的时候会有什么样的问题）
可以监控数据的获取和修改 针对对象格式会给每个对象的属性进行劫持 方法是Object.defineProperty
> 源码层面 initData -> observer -> defineReactive方法 (内部会对所有的属性进行重写 性能问题) 递归增加对象中的对象增加getter和setter
> 我们在使用Vue的时候 层级过深（考虑优化） 如果数据不是响应式的就不要放在data里面。我们属性取值的时候尽量避免多次取值。如果有些对象是放在data中的但不是响应式的可以考虑用Object.freeze()来冻结对象。
## vue中如何检测数组的变化
vue2中检测数组的变化并没有用object.defineProperty 因为修改索引的情况并不多（如果直接使用object.defineProperty会浪费大量的性能）。采用重写数组的方法来实现（函数劫持）
> initDate -> observer -> 对我们传入的数组进行原型链的修改，后续调用的方法都是重写后的方法 -> 对数组中的每个对象进行代理
修改数组索引和长度无法进行监控
## vue中如何进行依赖收集
-所谓的依赖收集（观察者模式） 被观察者指的是数据(dep)，观察者（watcher 3种渲染watcher、计算属性、用户watcher）
-一个watcher中可能对应这多个数据 watcher还需要保存dep（重新渲染的时候可以让属性重新记录watcher） 计算属性也会用到
> 多对多的关系 一个dep对应多个watcher，一个watcher有多个dep。默认渲染的时候会进行依赖收集（会触发get方法），数据更新了会找到属性对应的watcher进行更新 取值的时候依赖收集 更新的时候视图更新
## 如何理解vue中的模板编译原理
用户传递的是template属性，我们需要将这个template编译成render函数

-template -> ast语法树
-对语法树进行标记(标记的是静态节点)
-将ast语法树生成render函数

> 最终每次渲染的时候可以调用render函数返回对应的虚拟节点   递归是深度优先 先标记儿子再标记自己  递归要创建一个栈 
## vue生命周期的钩子是如何实现的
就是内部利用了一个发布订阅模式，将用户写的钩子维护成一个数组，后续依次调用callHook。 
## vue的生命周期有哪些？一般在哪一步发送请求及原因
- beforeCreate 没有实现响应式数据  组件的父子关系 initLifecycle initEvents $emit $on $once $off  vue3中就没有这个api了
- created 拿到的数据就是响应式 不涉及dom渲染  这个api可以在服务端渲染的时候进行使用 vue3 setup进行取代了
- beforeMount 没有实际价值
- mounted 可以获取dom $el
- beforeUpdate 
- updated 
- actived keep-alive
- deactived
- beforeDestroy  手动调用移除后触发
- destroyed  移除后触发  既不涉及组件 又不涉及watcher  路由切换 v-if切换组件 is 动态组件 手动调用$destroy 实例上的方法都是带$的
- errorCaptured
> 一般最多是在mounted  代码是同步执行的，请求是异步的 生命周期是同步的 请求是异步的 最终获取的数据在mounted之后








