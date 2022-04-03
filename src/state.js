import Dep from "./observe/dep.js";
import { observe } from "./observe/index.js";
import Watcher, { nextTick } from "./observe/watcher.js";

export function initState(vm) {
    let opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm);
    }
}

function initWatch(vm){
    let watch = vm.$options.watch;
    
    for(let key in watch){
        const handler = watch[key]; //数组、字符串、函数
        
        if(Array.isArray(handler)){
            for(let i=0;i<handler.length;i++){
                createWatcher(vm,key,handler[i])
            }
        }else{
            createWatcher(vm,key,handler)
        }
    }
}

function createWatcher(vm,key,handler){
    //字符串 数组 函数
    if(typeof handler == 'string'){
        handler = vm[handler]
    }

    return vm.$watch(key,handler)
}

function Proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {  //取值取_data上的值
            return vm[target][key]
        },
        set(newValue) { //设置值设置_data上的值
            if (newValue === vm[target][key]) return;
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;  //vm调用的
    vm._data = data;  //在实例上进行属性的劫持
    observe(data);

    //vm._data上的数据进行代理

    for (let key in data) {
        Proxy(vm, '_data', key)
    }
}


function initComputed(vm) {
    const computed = vm.$options.computed;
    const watchers = vm._computedWatchers = {};
    for (let key in computed) {
        let userDef = computed[key]; //值可能是函数也可能是对象 对象要分get和set  函数这是get

        //计算属性也要有一个watcher
        let fn = typeof userDef == 'function' ? userDef : userDef.get;
        watchers[key] = new Watcher(vm, fn, { lazy: true });//将属性和watcher对应起来

        defineComputed(vm, key, userDef);
    }
}

function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => { });

    //可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key];
        if (watcher.dirty) {
            watcher.evaluate()
        }
        if (Dep.target) { //计算属性出栈后还有渲染watcher
            watcher.depend();
        }

        return watcher.value;
    }
}

export function initStateMixin(Vue){
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function(exprOrFn,cb){
        //属性的值改变之后 直接执行cb就行
        new Watcher(this,exprOrFn,{user:true},cb); //用户自己写的watcher
    }
}



//首先初始化数据  vue2 兼容ie9以上  vue3抛弃了ie   proxy进行属性劫持


//一个计算属性对应一个watcher 并且放到实例上



/* 
    computed就是带有dirty属性的watcher
        两种形式 一个对象 这个函数就是getter setter就是空函数
        属性发生变化的时候
        渲染watcher收集到
    
    


*/