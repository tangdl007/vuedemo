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

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){  //头指针超过尾指针的时候就结束
        //头头比对
        if(isSameVnode(oldStartVnode,newStartVnode)){
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
            let oldEl = oldChildren[i].el;
            el.removeChild(oldEl);
        }
    }
}





//比较虚拟dom 尽可能的服用老的 提升性能
//节点比较  节点不同 tag和key
//文本节点  
//元素节点  props  老的有的新的没有去掉  新的覆盖老的
//比较儿子  双指针的方式  头指针超过尾指针的时候结束  超过的部分 追加或者去除
//是一个概念  
















