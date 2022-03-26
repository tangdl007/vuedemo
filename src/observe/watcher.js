import Dep, { popTarget, pushTarget } from "./dep";

//局部更新 提高性能
let id = 0;

class Watcher {
    constructor(vm, exprOrFn, options, cb) {  //每个组件都会new watcher
        this.id = id++;

        this.renderWatcher = options;//是否为渲染watcher

        if(typeof exprOrFn == 'string'){
            this.getter = function(){
                return vm[exprOrFn]
            }
        }else{
            this.getter = exprOrFn;
        }
        this.deps = [];  //实现计算属性和清理工作需要用到
        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy;
        this.vm = vm;
        this.user = options.user;

        this.value = this.lazy ? undefined : this.get();

    }
    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }
    get() {  //get方法的时候会进行依赖收集 那么改变的时候回执行这个watcher
        pushTarget(this);
        let value = this.getter.call(this.vm);
        popTarget();
        return value;
    }
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();  //让计算属性watcher也收集渲染watcher
        }
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
        if (this.lazy) {
            this.dirty = true;
        } else {
            queueWatcher(this);
        }
    }
    run() {
        let oldValue = this.value;
        let newValue = this.get();
        if(this.user){
            this.cb.call(this.vm,newValue,oldValue);
        }
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
// 计算属性根本就不会去收集依赖而是让自己的依赖去收集依赖
// 异步更新 取最后的值









export default Watcher;