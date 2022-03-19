import { newArrayProto } from "./array";

class Observer{
    constructor(data){
        //object.defineProperty只能对已经存在的属性进行劫持 对于新增和删除的属性不能进行劫持  $set $delete
        Object.defineProperty(data,"__ob__",{
            value:this,
            enumerable:false   //不可枚举 循环取不到
        })
        // data.__ob__ = this; //如果数组有__ob__则说明数据并观测过了   如果是对象的话进入死循环
        //数组的方法进行拦截
        if(Array.isArray(data)){
            this.observeArr(data);
            data.__proto__ = newArrayProto;
        }else{
            this.walk(data)
        }
    }
    walk(data){ //循环对象对属性进行劫持
        //重新定义属性  性能消耗点  这也是为什么换成vue3换成proxy后性能明显提升的原因
        Object.keys(data).forEach(key => defineReactive(data,key,data[key]))
    }
    observeArr(data){
        data.forEach(item => observe(item));   //数组的每一项也要进行属性的劫持
    }
}


export function defineReactive(target,key,value){ //闭包 这里的执行栈并没有被销毁 get和set方法能拿到value
    observe(value);
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(value === newValue)return;
            value = newValue
        }
    })
}

export function observe (data){
    //只对对象进行属性劫持
    if(typeof data !== 'object' || data == null)return;
    
    if(data.__ob__ instanceof Observer)return data.__ob__; //被观测过了 直接return

    return new Observer(data);
}


//深度劫持    一个函数里面调用原来的函数    重写数组的方法并且观察数组中的每一项


//数组劫持的核心 就是重写数组的方法 并观察每一项

//不可枚举  不能循环  不能取值