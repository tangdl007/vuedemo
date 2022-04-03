
import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch"




export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        const el = vm.$el;

        //既有初始化的功能又有更新的功能
        vm.$el = patch(el, vnode); //新的el
    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments);
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value;
        return JSON.stringify(value);
    }
    Vue.prototype._render = function () {
        let vm = this;
        //当渲染的时候会去实例中取值  将属性和视图绑定在一起
        return vm.$options.render.call(vm);
    }
}


export function mountComponent(vm, el) {
    vm.$el = el;


    const updateComponent = () => {
        vm._update(vm._render());
    }

    new Watcher(vm, updateComponent, true);

}



/*    依赖收集
    对每一个属性增加一个dep属性
    页面渲染的时候，将渲染逻辑放到watcher中
    dep记录这个watcher，属性发生变化之后用dep找到这个watcher进行重新渲染即可
*/

export function callHook(vm, hook) {  //调用钩子函数
    let handlers = vm.$options[hook];
    if (handlers) {
        handlers.forEach(handler => handler.call(vm));
    }
}


