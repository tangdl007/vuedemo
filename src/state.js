import { observe } from "./observe/index.js";

export function initState(vm){
    let opts = vm.$options;
    if(opts.data){
        initData(vm);
    }
}

function Proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){  //取值取_data上的值
            return vm[target][key]
        },
        set(newValue){ //设置值设置_data上的值
            if(newValue === vm[target][key])return;
            vm[target][key] = newValue
        }
    })
}

function initData(vm){
    let data = vm.$options.data;
    data = typeof data === 'function'?data.call(vm):data;  //vm调用的
    vm._data = data;  //在实例上进行属性的劫持
    observe(data);

    //vm._data上的数据进行代理

    for(let key in data){
        Proxy(vm,'_data',key)
    }
}


//首先初始化数据  vue2 兼容ie9以上  vue3抛弃了ie   proxy进行属性劫持