import { isSameVnode } from ".";

export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag == 'string') {
        vnode.el = document.createElement(tag);  //将虚拟节点和真实节点联系起来  
        patchProps(vnode.el,{}, data);
        vnode.children.forEach(child => {  //递归进行创建
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;   //真实节点
}
export function patchProps(el,oldProps = {},props={}) {
    //老的有新的没有直接删除 对应的el就是元素本身   尽量复用老的  
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    for(let key in oldStyles){
        if(!newStyles[key]){
            el.style[key] = "";
        }
    }

    for(let key in oldProps){
        if(!props[key]){
            el.removeAttribute(key);
        }
    }

    //新的覆盖老的
    for (let key in props) {
        if (key == 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType;

    if (isRealElement) {
        const elm = oldVnode;
        const parentElm = elm.parentNode;

        let newElm = createElm(vnode);

        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm)


        return newElm;
    } else {

        return patchVnode(oldVnode,vnode);

    }
}

function  patchVnode(oldVnode,vnode){
    //不是相同节点
    if (!isSameVnode(oldVnode, vnode)) {
        let el = createElm(vnode);
        oldVnode.el.parentNode.replaceChild(el, oldVnode.el);
        return el;
    }


    //文本节点还是元素节点
    let el = vnode.el = oldVnode.el;
    if (!oldVnode.tag) {
        if (oldVnode.text !== vnode.text) {
            el.textContent = vnode.text;  //用新的文本替换掉老的文本
        }
    }
    
    //是标签比较属性
    patchProps(el,oldVnode.data,vnode.data);


    //比较儿子 一个有儿子一个没有  两个都有儿子 两个都没有

    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if(oldChildren.length > 0 && newChildren.length > 0){
        updateChildren(el,oldChildren,newChildren);
    }else if(newChildren.length > 0){
        mountChildren(el,newChildren);
    }else if(oldChildren.length > 0){
        el.innerHTML = "";
    }


    return el;
}

function mountChildren(el,newChildren){
    for(let i=0;i<newChildren.length;i++){
        let child = newChildren[i];
        el.appendChild(createElm(child));
    }
}


function updateChildren(el,oldChildren,newChildren){
    //头指针超过尾指针就结束
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0];

    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children){
        let map = {};
        children.forEach((child,index) => {
            map[child.key] = index
        })
        return map
    }

    let map = makeIndexByKey(oldChildren); //key对应的索引 老的  a:1



    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){  //头指针超过尾指针的时候就结束
        if(!oldStartVnode){  //为空的情况进行处理
            oldStartVnode = oldChildren[++oldStartIndex]
        }else if(!oldEndVnode){
            oldEndVnode = oldChildren[--oldEndIndex]
        }else if(isSameVnode(oldStartVnode,newStartVnode)){
            patchVnode(oldStartVnode,newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVnode(oldEndVnode,newEndVnode)){  //尾尾比
            patchVnode(oldEndVnode,newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else if(isSameVnode(oldEndVnode,newStartVnode)){ //交叉比  老的尾与新的头比较 比较完后往前追加
            patchVnode(oldEndVnode,newStartVnode);
            el.insertBefore(oldEndVnode.el,oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVnode(oldStartVnode,newEndVnode)){//老的头和新的尾比较
            patchVnode(oldStartVnode,newEndVnode);
            el.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling);  //a插入到b的前面  
            newEndVnode = newChildren[--newEndIndex];
            oldStartVnode = oldChildren[++oldStartIndex]; 
        }else {
            let moveIndex = map[newStartVnode.key];
            if(moveIndex !== undefined){
                let moveVnode = oldChildren[moveIndex];
                el.insertBefore(moveVnode.el,oldStartVnode.el);
                oldChildren[moveIndex] = undefined; //不能删 删了就会数组塌陷
                patchVnode(moveVnode,newStartVnode);
            }else{
                el.insertBefore(createElm(newStartVnode),oldStartVnode.el)
            }
    
            newStartVnode = newChildren[++newStartIndex];  //尽可能的复用老的 以老的为标准  找到就移动找不到就插入
        }
        
    }
    if(newStartIndex <= newEndIndex){
        for(let i = newStartIndex;i <= newEndIndex;i++){
            let childEl = createElm(newChildren[i]);

            let anchor = newChildren[newStartIndex + 1]?newChildren[newStartIndex + 1].el:null
  
            el.insertBefore(childEl,anchor); //为null就是appendChild
        }
    }
    if(oldStartIndex <= oldEndIndex){
        for(let i=oldStartIndex;i<=oldEndIndex;i++){
            if(oldChildren[i]){
                let oldEl = oldChildren[i].el;
                el.removeChild(oldEl);
            }
        }
    }
}





//虚拟dom之间的比较  尽可能的复用老的 提升性能
//根节点是不是一致的 不是一致的新的覆盖老的  key 和 tag  标签是不是一致的
//节点如果是一致的 元素节点和文本节点  元素节点 比较props  两点  老的有的新的没有直接去除 新的覆盖老的
//比较儿子  头头比较 双指针的方式  头指针大于尾指针的时候结束  尾尾比较  交叉比较
//老的尾和新的头比较
//永远都往头指针做插入
//如果批量向页面中插入内容 浏览器会自动优化
//组件渲染原理



/* 
    说下diff算法吧  两个虚拟dom之间的比较 尽可能的复用老的节约性能


    采取的是双指针的方式进行比较  头头和头比较 比较节点 key tag  文本节点
    元素节点 属性比较 老的有新的没有去除  
    然后在比较儿子
        头和头比较 头指针超过尾指针就结束
        尾和尾比较  
        交叉比较
        乱序比较 将老做一个映射关系  新的最前面  当前头指针的最前面  
    不加key 会有bug 比如复用错误 
    循环列表 勾选状态  苹果 香蕉 梨  火龙果  就被勾选了
    
*/

















