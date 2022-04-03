//重写数组中的部分方法
let oldArrayProto = Array.prototype;

export let newArrayProto = Object.create(oldArrayProto); //在自己的身上改不在array本身上改变


//能够改变array本身的方法
let methods = [
    "push",
    "pop",  //移除最后一个元素，并返回该元素
    "shift",//删除第一个元素并返回
    "unshift",
    "reverse",
    "sort",
    "splice"  //删除添加元素  查询的位置  删除的个数 新增的元素
] //concat slice都不会改变数组本身

//切片编程  自己实现一个功能 把原有功能放进去  可以追加功能  实现切片编程



methods.forEach(method => {
    newArrayProto[method] = function(...args){ //实例调用的方法 
        const result = oldArrayProto[method].call(this,...args); //在里面调用this的指向就有问题  切片编程

        //新增的元素进行属性的劫持
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case "push":
            case "unshift":
                inserted = args;
            case "splice":
                inserted = args.slice(2);
            default:
                break;
        }

        if(inserted){
            ob.observeArr(inserted);
        }

        //更新
        ob.dep.notify();
        return result;
    }
})