import { mergerOptions } from "./utils";




export function initGlobalAPi(Vue) {
    Vue.options = {};
    Vue.mixin = function (mixin) {  
        this.options = mergerOptions(this.options, mixin);
        return this;
    }

    //创建一个组件的构造函数 可以直接进行挂载
    Vue.extend = function(options){

        function Sub(options = {}){  //最终使用一个组件就是new一个实例
            this._init(options);
        }

        Sub.prototype = Object.create(Vue.prototype); //复用原型
        Sub.prototype.constructor = Sub;

        Sub.options = options;

        return Sub;
    }
    Vue.options.components = {};

    // 创建一个组件在模板中使用
    Vue.component = function(id,definition){  
        definition = typeof definition == 'function'? definition:Vue.extend(definition);
        Vue.options.components[id] = definition;  //保存在 options.components
    }
}






