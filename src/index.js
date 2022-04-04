import { initGlobalAPi } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

function Vue(options) {
    this._init(options)
}


initMixin(Vue); //初始化方法   通过方法来进行传递
initLifeCycle(Vue);
initGlobalAPi(Vue);
initStateMixin(Vue);




export default Vue;
