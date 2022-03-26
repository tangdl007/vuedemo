import { VERSION } from "rollup";
import Dep from "./dep";

//局部更新 提高性能
let id = 0;

class Watcher {
    constructor(vm, fn, options) {  //每个组件都会new watcher
        this.id = id++;

        this.renderWatcher = options;//是否为渲染watcher
        this.getter = fn;
        this.deps = [];  //实现计算属性和清理工作需要用到
        this.depsId = new Set();
        this.get()
    }
    get() {
        Dep.target = this; //静态属性只有一份 为什么不放在原型上  原型行要通过实例来调用 只想通过类来进行调用
        this.getter();
        Dep.target = null;
    }
    addDep(dep) {  //既要保证不重复  又要保证双向  
        let id = dep.id;
        if (!this.depsId.has(id)) {   //在watcher进行去重
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
    update() {
        //实现异步更新的操作   update无论走多少次 更新操作只有一次
        queueWatcher(this);
    }
    run() {
        this.get();
    }
}

let queue = [];
let has = {};
let pending = false;

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);   //拷贝
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(q => q.run());
}
function queueWatcher(watcher) {
    let id = watcher.id;
    if (!has[id]) {  //相同的watcher不用重复的去刷新
        has[id] = true;
        queue.push(watcher);

        if (!pending) {
            nextTick(flushSchedulerQueue);
            pending = true;
        }
    }
}

let waiting = false;
let callbacks = [];
let flushCallbacks = function () {
    waiting = false;
    let cbs = callbacks.slice(0);//拷贝
    callbacks = [];
    cbs.forEach(cb => {
        cb();
    })
}

let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks);
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        textNode.textContent = 2;
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks);
    }
}

export function nextTick(cb) {    //先用户的还是先内部的  异步更新操作 不一定  那个在先那个就先执行
    callbacks.push(cb);
    if (!waiting) {
        timerFunc(flushCallbacks);
        waiting = true;
    }
}

// mixin 可以混入一些公共的方法  数据来源不明确   










export default Watcher;