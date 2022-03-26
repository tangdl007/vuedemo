import { initGlobalAPi } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options) {
    this._init(options)
}

Vue.prototype.$nextTick = nextTick;
initMixin(Vue); //初始化方法   通过方法来进行传递
initLifeCycle(Vue);


initGlobalAPi(Vue);







export default Vue;
