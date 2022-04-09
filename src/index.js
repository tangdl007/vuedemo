import { compileToFunction } from "./compiler";
import { initGlobalAPi } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

function Vue(options) {
    this._init(options)
}


initMixin(Vue); //初始化方法   通过方法来进行传递
initLifeCycle(Vue);
initGlobalAPi(Vue);
initStateMixin(Vue);




let render1 = compileToFunction(`<ul style="color:red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`);
let vm1 = new Vue({
    data: {
        name: "zf"
    }
})
let prevVnode = render1.call(vm1);  //对象
let el = createElm(prevVnode);

document.body.appendChild(el);

let render2 = compileToFunction(`<ul style="background:yellow">
    <li key="d">d</li>
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
</ul>`);
let vm2 = new Vue({
    data: {
        name: "李寻欢"
    }
})
let nextVnode = render2.call(vm2);  //对象



//尽可能的服用老节点  节约性能  平级来进行比较  父亲不一样就不比较儿子
setTimeout(() => {
    patch(prevVnode, nextVnode)
}, 1000);





export default Vue;
