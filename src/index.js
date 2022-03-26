import { initGlobalAPi } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

function Vue(options) {
    this._init(options)
}

Vue.prototype.$nextTick = nextTick;
initMixin(Vue); //初始化方法   通过方法来进行传递
initLifeCycle(Vue);


//字符串 函数  数组  对象 字符串函数

Vue.prototype.$watch = function(exprOrFn,cb){
    //属性的值改变之后 直接执行cb就行
    new Watcher(this,exprOrFn,{user:true},cb); //用户自己写的watcher
}


initGlobalAPi(Vue);







export default Vue;
