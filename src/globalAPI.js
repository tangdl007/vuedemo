import { mergerOptions } from "./utils";




export function initGlobalAPi(Vue) {
    Vue.options = {};
    Vue.mixin = function (mixin) {  
        this.options = mergerOptions(this.options, mixin);
        return this;
    }
}