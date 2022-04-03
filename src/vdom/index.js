export function createElementVNode(vm,tag,data,...children){
    if(data == null){
        data = {}
    }
    let key = data.key; 
    if(key){
        delete data.key
    }
    return vnode(vm,tag,key,data,children);
}


export function createTextVNode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}


export function isSameVnode(vnode1,vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}


//ast是语法层面上的转化  描述的语法本身
//虚拟dom描述的是dom元素  可以增加一些自定义属性


function vnode(vm,tag,key,data,children,text){
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}
