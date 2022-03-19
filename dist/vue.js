(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    //正则表达式
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的是标签名

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性

    var startTagClose = /^\s*(\/?)>/;

    function parseHTML(html) {
      //解析一个删除一个 知道没有解析的为止
      function advance(n) {
        html = html.substring(n); //匹配一点截取一点
      }

      function parseStart() {
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            //标签名
            attrs: []
          };
          advance(start[0].length);
          console.log(match);
        }

        var attr, end; //赋值的话加一个括号就行 匹配的值

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          //如果标签没有结束就一直匹配
          advance(attr[0].length);
        }

        if (end) {
          advance(end[0].length);
        }

        console.log(html);
        return false;
      }

      while (html) {
        //如果为0则是标签开始的位置，如果大于0  文本结束的位置
        var textEnd = html.indexOf("<");

        if (textEnd == 0) {
          parseStart();
          break;
        }
      }
    }

    function compileToFunction(template) {
      //将template生成ast抽象语法树
      //生成render函数
      //render函数执行的结果就是 虚拟dom
      parseHTML(template);
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    //重写数组中的部分方法
    var oldArrayProto = Array.prototype;
    var newArrayProto = Object.create(oldArrayProto); //在自己的身上改不在array本身上改变
    //能够改变array本身的方法

    var methods = ["push", "pop", //移除最后一个元素，并返回该元素
    "shift", //删除第一个元素并返回
    "unshift", "reverse", "sort", "splice" //删除添加元素  查询的位置  删除的个数 新增的元素
    ]; //concat slice都不会改变数组本身
    //切片编程  自己实现一个功能 把原有功能放进去  可以追加功能  实现切片编程

    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        //实例调用的方法 
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //在里面调用this的指向就有问题  切片编程
        //新增的元素进行属性的劫持


        var inserted;
        var ob = this.__ob__;

        switch (method) {
          case "push":
          case "unshift":
            inserted = args;

          case "splice":
            inserted = args.slice(2);
        }

        if (inserted) {
          ob.observeArr(inserted);
        }

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        //object.defineProperty只能对已经存在的属性进行劫持 对于新增和删除的属性不能进行劫持  $set $delete
        Object.defineProperty(data, "__ob__", {
          value: this,
          enumerable: false //不可枚举 循环取不到

        }); // data.__ob__ = this; //如果数组有__ob__则说明数据并观测过了   如果是对象的话进入死循环
        //数组的方法进行拦截

        if (Array.isArray(data)) {
          this.observeArr(data);
          data.__proto__ = newArrayProto;
        } else {
          this.walk(data);
        }
      }

      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          //循环对象对属性进行劫持
          //重新定义属性  性能消耗点  这也是为什么换成vue3换成proxy后性能明显提升的原因
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArr",
        value: function observeArr(data) {
          data.forEach(function (item) {
            return observe(item);
          }); //数组的每一项也要进行属性的劫持
        }
      }]);

      return Observer;
    }();

    function defineReactive(target, key, value) {
      //闭包 这里的执行栈并没有被销毁 get和set方法能拿到value
      observe(value);
      Object.defineProperty(target, key, {
        get: function get() {
          return value;
        },
        set: function set(newValue) {
          if (value === newValue) return;
          value = newValue;
        }
      });
    }
    function observe(data) {
      //只对对象进行属性劫持
      if (_typeof(data) !== 'object' || data == null) return;
      if (data.__ob__ instanceof Observer) return data.__ob__; //被观测过了 直接return

      return new Observer(data);
    } //深度劫持    一个函数里面调用原来的函数    重写数组的方法并且观察数组中的每一项
    //数组劫持的核心 就是重写数组的方法 并观察每一项
    //不可枚举  不能循环  不能取值

    function initState(vm) {
      var opts = vm.$options;

      if (opts.data) {
        initData(vm);
      }
    }

    function Proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          //取值取_data上的值
          return vm[target][key];
        },
        set: function set(newValue) {
          //设置值设置_data上的值
          if (newValue === vm[target][key]) return;
          vm[target][key] = newValue;
        }
      });
    }

    function initData(vm) {
      var data = vm.$options.data;
      data = typeof data === 'function' ? data.call(vm) : data; //vm调用的

      vm._data = data; //在实例上进行属性的劫持

      observe(data); //vm._data上的数据进行代理

      for (var key in data) {
        Proxy(vm, '_data', key);
      }
    } //首先初始化数据  vue2 兼容ie9以上  vue3抛弃了ie   proxy进行属性劫持

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        //原型中的this指的都是实例
        var vm = this;
        vm.$options = options; //$表示vue里面的变量  将用户的选项挂载到实例上
        //初始化数据

        initState(vm);

        if (options.el) {
          vm.$mount(options.el); //实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var opts = vm.$options;

        if (!opts.render) {
          var template;

          if (!opts.template && el) {
            template = el.outerHTML;
          } else {
            if (el) {
              template = opts.template;
            }
          } //先找render 再找template  再找el outerHTML
          //如果有模板就进行编译


          if (template) {
            var render = compileToFunction(template);
            opts.render = render;
          }
        }

        opts.render; //统一成了render方法
      };
    } //初始化  状态初始化  data初始化

    function Vue(options) {
      this._init(options);
    }

    initMixin(Vue); //初始化方法   通过方法来进行传递

    return Vue;

}));
//# sourceMappingURL=vue.js.map
