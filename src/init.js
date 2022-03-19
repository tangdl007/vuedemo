import { compileToFunction } from "./compiler";
import { initState } from "./state";

export function initMixin(Vue){
    Vue.prototype._init = function(options){  //原型中的this指的都是实例
        const vm = this;
        vm.$options = options;  //$表示vue里面的变量  将用户的选项挂载到实例上
        //初始化数据
        initState(vm);


        if(options.el){
            vm.$mount(options.el);  //实现数据的挂载
        }
    }


    Vue.prototype.$mount = function(el){
        const vm = this;
        el = document.querySelector(el);
        let opts = vm.$options;
        if(!opts.render){
            let template
            if(!opts.template && el){
                template = el.outerHTML;
            }else{
                if(el){
                    template = opts.template;
                }
            }
            //先找render 再找template  再找el outerHTML

            //如果有模板就进行编译

            if(template){
                const render = compileToFunction(template);
                opts.render = render
            }
        }
        opts.render; //统一成了render方法
    }
}



//初始化  状态初始化  data初始化
