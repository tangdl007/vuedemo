import {initMixin} from "./init"

function Vue(options){
    this._init(options)
}

initMixin(Vue); //初始化方法   通过方法来进行传递

export default Vue;
