(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var strats = {};
    var LIFECYCLE = ["beforeCreated", 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        if (c) {
          if (p) {
            return p.concat(c); //并不会返回值
          } else {
            return [c];
          }
        } else {
          return p;
        }
      };
    });
    function mergerOptions(parent, child) {
      var options = {};

      for (var key in parent) {
        mergeField(key);
      }

      for (var _key in child) {
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          options[key] = child[key] || parent[key];
        }
      }

      return options;
    } //用户的选项和全局的配置合并都一起

    function initGlobalAPi(Vue) {
      Vue.options = {};

      Vue.mixin = function (mixin) {
        this.options = mergerOptions(this.options, mixin);
        return this;
      };
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

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    //正则表达式
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的是标签名

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //结束标签

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性

    var startTagClose = /^\s*(\/?)>/; //这是语法的转移不是dom的转义   利用栈形结构来构造一棵树  

    function parseHTML(html) {
      //解析一个删除一个 知道没有解析的为止
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = [];
      var currentParent;
      var root;

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }

      function start(tag, attrs) {
        var node = createASTElement(tag, attrs);

        if (!root) {
          root = node;
        }

        if (currentParent) {
          node.parent = currentParent;
          currentParent.children.push(node);
        }

        stack.push(node);
        currentParent = node;
      }

      function chars(text) {
        text = text.replace(/\s/g, "");
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }

      function end() {
        stack.pop();
        currentParent = stack[stack.length - 1];
      }

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

          var attr, _end; //赋值的话加一个括号就行 匹配的值


          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            //如果标签没有结束就一直匹配
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }

          if (_end) {
            advance(_end[0].length);
          }

          return match;
        }

        return false;
      }

      while (html) {
        //如果为0则是标签开始的位置，如果大于0  文本结束的位置
        var textEnd = html.indexOf("<");

        if (textEnd == 0) {
          var startTagMatch = parseStart();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd);

          if (text) {
            chars(text);
            advance(text.length);
          }
        }
      }

      return root;
    }

    function genProps(attrs) {
      var str = "";

      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];

        if (attr.name == 'style') {
          (function () {
            //重写value的值
            var obj = {};
            attr.value.split(";").forEach(function (item) {
              var _item$split = item.split(":"),
                  _item$split2 = _slicedToArray(_item$split, 2),
                  key = _item$split2[0],
                  value = _item$split2[1];

              obj[key] = value;
            });
            attr.value = obj;
          })();
        }

        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
      }

      return "{".concat(str.slice(0, -1), "}"); //去掉最后一个
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    function gen(node) {
      if (node.type == 1) {
        return codeGen(node);
      } else {
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          var token = [];
          var match;
          defaultTagRE.lastIndex = 0; //每次匹配过后，lastindex会往前加1

          var lastIndex = 0;

          while (match = defaultTagRE.exec(text)) {
            var index = match.index;

            if (index > lastIndex) {
              token.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            token.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          } //是起始的位置  lastindex  中间的内容进行截取


          if (lastIndex < text.length) {
            token.push(JSON.stringify(text.slice(lastIndex)));
          }

          return "_v(".concat(token.join("+"), ")");
        }
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(","); //数组转换为字符串 join  字符串转化为数组 split
    }

    function codeGen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null).concat(ast.children.length ? ",".concat(children) : '', ")");
      return code;
    } //模版引擎的实现原理就是 with +  new Function


    function compileToFunction(template) {
      var ast = parseHTML(template); //生成字符串  _c  _v  _s

      var code = codeGen(ast);
      code = "with(this){return ".concat(code, "}");
      var render = new Function(code);
      return render;
    }

    var id$1 = 0;

    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.id = id$1++;
        this.subs = []; //这里存放着属性对应的watcher
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          Dep.target.addDep(this); //记录dep  计算属性和清理操作的时候要用
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          });
        }
      }]);

      return Dep;
    }(); //用到的属性才会收集 没有用到的就不会收集


    Dep.target = null;
    var stack = [];
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popTarget(watcher) {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var id = 0;

    var Watcher = /*#__PURE__*/function () {
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);

        //每个组件都会new watcher
        this.id = id++;
        this.renderWatcher = options; //是否为渲染watcher

        if (typeof exprOrFn == 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn;
        }

        this.deps = []; //实现计算属性和清理工作需要用到

        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy;
        this.vm = vm;
        this.user = options.user;
        this.value = this.lazy ? undefined : this.get();
      }

      _createClass(Watcher, [{
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get();
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          //get方法的时候会进行依赖收集 那么改变的时候回执行这个watcher
          pushTarget(this);
          var value = this.getter.call(this.vm);
          popTarget();
          return value;
        }
      }, {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;

          while (i--) {
            this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
          }
        }
      }, {
        key: "addDep",
        value: function addDep(dep) {
          //既要保证不重复  又要保证双向  
          var id = dep.id;

          if (!this.depsId.has(id)) {
            //在watcher进行去重
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
          }
        }
      }, {
        key: "update",
        value: function update() {
          //实现异步更新的操作   update无论走多少次 更新操作只有一次
          if (this.lazy) {
            this.dirty = true;
          } else {
            queueWatcher(this);
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newValue = this.get();

          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);

      return Watcher;
    }();

    var queue = [];
    var has = {};
    var pending = false;

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0); //拷贝

      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      });
    }

    function queueWatcher(watcher) {
      var id = watcher.id;

      if (!has[id]) {
        //相同的watcher不用重复的去刷新
        has[id] = true;
        queue.push(watcher);

        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    var waiting = false;
    var callbacks = [];

    var flushCallbacks = function flushCallbacks() {
      waiting = false;
      var cbs = callbacks.slice(0); //拷贝

      callbacks = [];
      cbs.forEach(function (cb) {
        cb();
      });
    };

    var timerFunc;

    if (Promise) {
      timerFunc = function timerFunc() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks);
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });

      timerFunc = function timerFunc() {
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timerFunc = function timerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFunc = function timerFunc() {
        setTimeout(flushCallbacks);
      };
    }

    function nextTick(cb) {
      //先用户的还是先内部的  异步更新操作 不一定  那个在先那个就先执行
      callbacks.push(cb);

      if (!waiting) {
        timerFunc(flushCallbacks);
        waiting = true;
      }
    } // mixin 可以混入一些公共的方法  数据来源不明确

    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }

      var key = data.key;

      if (key) {
        delete data.key;
      }

      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      return vnode(vm, tag, key, data, children);
    }
    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    } //ast是语法层面上的转化  描述的语法本身
    //虚拟dom描述的是dom元素  可以增加一些自定义属性

    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text
      };
    }

    function createElm(vnode) {
      var tag = vnode.tag,
          data = vnode.data;
          vnode.children;
          var text = vnode.text;

      if (typeof tag == 'string') {
        vnode.el = document.createElement(tag); //将虚拟节点和真实节点联系起来  

        patchProps(vnode.el, data);
        vnode.children.forEach(function (child) {
          //递归进行创建
          vnode.el.appendChild(createElm(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el; //真实节点
    }

    function patchProps(el, props) {
      for (var key in props) {
        if (key == 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    }

    function patch(oldVNode, vnode) {
      var isRealElement = oldVNode.nodeType;

      if (isRealElement) {
        var elm = oldVNode;
        var parentElm = elm.parentNode;
        var newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm);
        return newElm;
      }
    }

    function initLifeCycle(Vue) {
      Vue.prototype._update = function (vnode) {
        var vm = this;
        var el = vm.$el; //既有初始化的功能又有更新的功能

        vm.$el = patch(el, vnode); //新的el
      };

      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };

      Vue.prototype._render = function () {
        var vm = this; //当渲染的时候会去实例中取值  将属性和视图绑定在一起

        return vm.$options.render.call(vm);
      };
    }
    function mountComponent(vm, el) {
      vm.$el = el;

      var updateComponent = function updateComponent() {
        vm._update(vm._render());
      };

      new Watcher(vm, updateComponent, true);
    }
    /*    依赖收集
        对每一个属性增加一个dep属性
        页面渲染的时候，将渲染逻辑放到watcher中
        dep记录这个watcher，属性发生变化之后用dep找到这个watcher进行重新渲染即可
    */

    function callHook(vm, hook) {
      //调用钩子函数
      var handlers = vm.$options[hook];

      if (handlers) {
        handlers.forEach(function (handler) {
          return handler.call(vm);
        });
      }
    }

    /*
      @license
    	Rollup.js v2.70.1
    	Mon, 14 Mar 2022 05:50:08 GMT - commit b8315e03f9790d610a413316fbf6d565f9340cab

    	https://github.com/rollup/rollup

    	Released under the MIT License.
    */
    for(var t={},s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",i=0;i<s.length;i++)t[s.charCodeAt(i)]=i;function D(e,t,s){const i=e.get(t);if(i)return i;const n=s();return e.set(t,n),n}const L=Symbol("Unknown Key"),O=Symbol("Unknown Integer"),V=[],B=[L],F=[O],z=Symbol("Entities");class W{constructor(){this.entityPaths=Object.create(null,{[z]:{value:new Set}});}trackEntityAtPathAndGetIfTracked(e,t){const s=this.getEntities(e);return !!s.has(t)||(s.add(t),!1)}withTrackedEntityAtPath(e,t,s,i){const n=this.getEntities(e);if(n.has(t))return i;n.add(t);const r=s();return n.delete(t),r}getEntities(e){let t=this.entityPaths;for(const s of e)t=t[s]=t[s]||Object.create(null,{[z]:{value:new Set}});return t[z]}}const U=new W;class j{constructor(){this.entityPaths=Object.create(null,{[z]:{value:new Map}});}trackEntityAtPathAndGetIfTracked(e,t,s){let i=this.entityPaths;for(const t of e)i=i[t]=i[t]||Object.create(null,{[z]:{value:new Map}});const n=D(i[z],t,(()=>new Set));return !!n.has(s)||(n.add(s),!1)}}const G=Symbol("Unknown Value");class H{constructor(){this.included=!1;}deoptimizePath(e){}deoptimizeThisOnEventAtPath(e,t,s,i){s.deoptimizePath(B);}getLiteralValueAtPath(e,t,s){return G}getReturnExpressionWhenCalledAtPath(e,t,s,i){return q}hasEffectsWhenAccessedAtPath(e,t){return !0}hasEffectsWhenAssignedAtPath(e,t){return !0}hasEffectsWhenCalledAtPath(e,t,s){return !0}include(e,t){this.included=!0;}includeCallArguments(e,t){for(const s of t)s.include(e,!1);}}const q=new class extends H{};class K extends H{constructor(e){super(),this.name=e,this.alwaysRendered=!1,this.initReached=!1,this.isId=!1,this.isReassigned=!1,this.kind=null,this.renderBaseName=null,this.renderName=null;}addReference(e){}getBaseVariableName(){return this.renderBaseName||this.renderName||this.name}getName(e){const t=this.renderName||this.name;return this.renderBaseName?`${this.renderBaseName}${e(t)}`:t}hasEffectsWhenAccessedAtPath(e,t){return e.length>0}include(){this.included=!0;}markCalledFromTryStatement(){}setRenderNames(e,t){this.renderBaseName=e,this.renderName=t;}}const Y=Object.freeze(Object.create(null));Object.freeze({});Object.freeze([]);var le;!function(e){e.ALREADY_CLOSED="ALREADY_CLOSED",e.ASSET_NOT_FINALISED="ASSET_NOT_FINALISED",e.ASSET_NOT_FOUND="ASSET_NOT_FOUND",e.ASSET_SOURCE_ALREADY_SET="ASSET_SOURCE_ALREADY_SET",e.ASSET_SOURCE_MISSING="ASSET_SOURCE_MISSING",e.BAD_LOADER="BAD_LOADER",e.CANNOT_EMIT_FROM_OPTIONS_HOOK="CANNOT_EMIT_FROM_OPTIONS_HOOK",e.CHUNK_NOT_GENERATED="CHUNK_NOT_GENERATED",e.CHUNK_INVALID="CHUNK_INVALID",e.CIRCULAR_REEXPORT="CIRCULAR_REEXPORT",e.CYCLIC_CROSS_CHUNK_REEXPORT="CYCLIC_CROSS_CHUNK_REEXPORT",e.DEPRECATED_FEATURE="DEPRECATED_FEATURE",e.EXTERNAL_SYNTHETIC_EXPORTS="EXTERNAL_SYNTHETIC_EXPORTS",e.FILE_NAME_CONFLICT="FILE_NAME_CONFLICT",e.FILE_NOT_FOUND="FILE_NOT_FOUND",e.INPUT_HOOK_IN_OUTPUT_PLUGIN="INPUT_HOOK_IN_OUTPUT_PLUGIN",e.INVALID_CHUNK="INVALID_CHUNK",e.INVALID_EXPORT_OPTION="INVALID_EXPORT_OPTION",e.INVALID_EXTERNAL_ID="INVALID_EXTERNAL_ID",e.INVALID_OPTION="INVALID_OPTION",e.INVALID_PLUGIN_HOOK="INVALID_PLUGIN_HOOK",e.INVALID_ROLLUP_PHASE="INVALID_ROLLUP_PHASE",e.MISSING_EXPORT="MISSING_EXPORT",e.MISSING_IMPLICIT_DEPENDANT="MISSING_IMPLICIT_DEPENDANT",e.MIXED_EXPORTS="MIXED_EXPORTS",e.NAMESPACE_CONFLICT="NAMESPACE_CONFLICT",e.AMBIGUOUS_EXTERNAL_NAMESPACES="AMBIGUOUS_EXTERNAL_NAMESPACES",e.NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE="NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE",e.PLUGIN_ERROR="PLUGIN_ERROR",e.PREFER_NAMED_EXPORTS="PREFER_NAMED_EXPORTS",e.SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT="SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT",e.UNEXPECTED_NAMED_IMPORT="UNEXPECTED_NAMED_IMPORT",e.UNRESOLVED_ENTRY="UNRESOLVED_ENTRY",e.UNRESOLVED_IMPORT="UNRESOLVED_IMPORT",e.VALIDATION_ERROR="VALIDATION_ERROR";}(le||(le={}));var be=new Set(["await","break","case","catch","class","const","continue","debugger","default","delete","do","else","enum","eval","export","extends","false","finally","for","function","if","implements","import","in","instanceof","interface","let","NaN","new","null","package","private","protected","public","return","static","super","switch","this","throw","true","try","typeof","undefined","var","void","while","with","yield"]);new Set("break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl".split(" ")).add("");function Ie(){return {brokenFlow:0,includedCallArguments:new Set,includedLabels:new Set}}function Ne(){return {accessed:new W,assigned:new W,brokenFlow:0,called:new j,ignore:{breaks:!1,continues:!1,labels:new Set,returnYield:!1},includedLabels:new Set,instantiated:new j,replacedVariableInits:new Map}}const _e=[];function $e(e,t=null){return Object.create(t,e)}const Te=new class extends H{getLiteralValueAtPath(){}},Re={value:{callsArgs:null,returns:q}},Me=new class extends H{getReturnExpressionWhenCalledAtPath(e){return 1===e.length?Ge(ze,e[0]):q}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,s){return 1!==e.length||je(ze,e[0],t,s)}},De={value:{callsArgs:null,returns:Me}},Le=new class extends H{getReturnExpressionWhenCalledAtPath(e){return 1===e.length?Ge(We,e[0]):q}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,s){return 1!==e.length||je(We,e[0],t,s)}},Oe={value:{callsArgs:null,returns:Le}},Ve=new class extends H{getReturnExpressionWhenCalledAtPath(e){return 1===e.length?Ge(Ue,e[0]):q}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,s){return 1!==e.length||je(Ue,e[0],t,s)}},Be={value:{callsArgs:null,returns:Ve}},Fe=$e({hasOwnProperty:De,isPrototypeOf:De,propertyIsEnumerable:De,toLocaleString:Be,toString:Be,valueOf:Re}),ze=$e({valueOf:De},Fe),We=$e({toExponential:Be,toFixed:Be,toLocaleString:Be,toPrecision:Be,valueOf:Oe},Fe),Ue=$e({anchor:Be,at:Re,big:Be,blink:Be,bold:Be,charAt:Be,charCodeAt:Oe,codePointAt:Re,concat:Be,endsWith:De,fixed:Be,fontcolor:Be,fontsize:Be,includes:De,indexOf:Oe,italics:Be,lastIndexOf:Oe,link:Be,localeCompare:Oe,match:Re,matchAll:Re,normalize:Be,padEnd:Be,padStart:Be,repeat:Be,replace:{value:{callsArgs:[1],returns:Ve}},replaceAll:{value:{callsArgs:[1],returns:Ve}},search:Oe,slice:Be,small:Be,split:Re,startsWith:De,strike:Be,sub:Be,substr:Be,substring:Be,sup:Be,toLocaleLowerCase:Be,toLocaleUpperCase:Be,toLowerCase:Be,toString:Be,toUpperCase:Be,trim:Be,trimEnd:Be,trimLeft:Be,trimRight:Be,trimStart:Be,valueOf:Be},Fe);function je(e,t,s,i){if("string"!=typeof t||!e[t])return !0;if(!e[t].callsArgs)return !1;for(const n of e[t].callsArgs)if(s.args[n]&&s.args[n].hasEffectsWhenCalledAtPath(V,{args:_e,thisParam:null,withNew:!1},i))return !0;return !1}function Ge(e,t){return "string"==typeof t&&e[t]?e[t].returns:q}const nt={Literal:[],Program:["body"]};class rt extends H{constructor(e,t,s){super(),this.esTreeNode=e,this.keys=nt[e.type]||function(e){return nt[e.type]=Object.keys(e).filter((t=>"object"==typeof e[t]&&95!==t.charCodeAt(0))),nt[e.type]}(e),this.parent=t,this.context=t.context,this.createScope(s),this.parseNode(e),this.initialise(),this.context.magicString.addSourcemapLocation(this.start),this.context.magicString.addSourcemapLocation(this.end);}addExportedVariables(e,t){}bind(){for(const e of this.keys){const t=this[e];if(null!==t)if(Array.isArray(t))for(const e of t)null!==e&&e.bind();else t.bind();}}createScope(e){this.scope=e;}hasEffects(e){!1===this.deoptimized&&this.applyDeoptimizations();for(const t of this.keys){const s=this[t];if(null!==s)if(Array.isArray(s)){for(const t of s)if(null!==t&&t.hasEffects(e))return !0}else if(s.hasEffects(e))return !0}return !1}include(e,t){!1===this.deoptimized&&this.applyDeoptimizations(),this.included=!0;for(const s of this.keys){const i=this[s];if(null!==i)if(Array.isArray(i))for(const s of i)null!==s&&s.include(e,t);else i.include(e,t);}}includeAsSingleStatement(e,t){this.include(e,t);}initialise(){}insertSemicolon(e){";"!==e.original[this.end-1]&&e.appendLeft(this.end,";");}parseNode(e){for(const[t,s]of Object.entries(e))if(!this.hasOwnProperty(t))if(95===t.charCodeAt(0)){if("_rollupAnnotations"===t)this.annotations=s;else if("_rollupRemoved"===t)for(const{start:e,end:t}of s)this.context.magicString.remove(e,t);}else if("object"!=typeof s||null===s)this[t]=s;else if(Array.isArray(s)){this[t]=[];for(const e of s)this[t].push(null===e?null:new(this.context.getNodeConstructor(e.type))(e,this,this.scope));}else this[t]=new(this.context.getNodeConstructor(s.type))(s,this,this.scope);}render(e,t){for(const s of this.keys){const i=this[s];if(null!==i)if(Array.isArray(i))for(const s of i)null!==s&&s.render(e,t);else i.render(e,t);}}shouldBeIncluded(e){return this.included||!e.brokenFlow&&this.hasEffects(Ne())}applyDeoptimizations(){}}class at extends rt{constructor(){super(...arguments),this.deoptimized=!1;}deoptimizeThisOnEventAtPath(e,t,s,i){t.length>0&&this.argument.deoptimizeThisOnEventAtPath(e,[L,...t],s,i);}hasEffects(e){this.deoptimized||this.applyDeoptimizations();const{propertyReadSideEffects:t}=this.context.options.treeshake;return this.argument.hasEffects(e)||t&&("always"===t||this.argument.hasEffectsWhenAccessedAtPath(B,e))}applyDeoptimizations(){this.deoptimized=!0,this.argument.deoptimizePath([L,L]),this.context.requestTreeshakingPass();}}class ot extends H{constructor(e){super(),this.description=e;}deoptimizeThisOnEventAtPath(e,t,s){2===e&&0===t.length&&this.description.mutatesSelfAsArray&&s.deoptimizePath(F);}getReturnExpressionWhenCalledAtPath(e,t){return e.length>0?q:this.description.returnsPrimitive||("self"===this.description.returns?t.thisParam||q:this.description.returns())}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>0}hasEffectsWhenCalledAtPath(e,t,s){var i,n;if(e.length>0||!0===this.description.mutatesSelfAsArray&&(null===(i=t.thisParam)||void 0===i?void 0:i.hasEffectsWhenAssignedAtPath(F,s)))return !0;if(!this.description.callsArgs)return !1;for(const e of this.description.callsArgs)if(null===(n=t.args[e])||void 0===n?void 0:n.hasEffectsWhenCalledAtPath(V,{args:_e,thisParam:null,withNew:!1},s))return !0;return !1}includeCallArguments(e,t){for(const s of t)s.include(e,!1);}}const ht=[new ot({callsArgs:null,mutatesSelfAsArray:!1,returns:null,returnsPrimitive:Me})],lt=[new ot({callsArgs:null,mutatesSelfAsArray:!1,returns:null,returnsPrimitive:Ve})],ct=[new ot({callsArgs:null,mutatesSelfAsArray:!1,returns:null,returnsPrimitive:Le})],ut=[new ot({callsArgs:null,mutatesSelfAsArray:!1,returns:null,returnsPrimitive:q})],dt=/^\d+$/;class pt extends H{constructor(e,t,s=!1){if(super(),this.prototypeExpression=t,this.immutable=s,this.allProperties=[],this.deoptimizedPaths=Object.create(null),this.expressionsToBeDeoptimizedByKey=Object.create(null),this.gettersByKey=Object.create(null),this.hasUnknownDeoptimizedInteger=!1,this.hasUnknownDeoptimizedProperty=!1,this.propertiesAndGettersByKey=Object.create(null),this.propertiesAndSettersByKey=Object.create(null),this.settersByKey=Object.create(null),this.thisParametersToBeDeoptimized=new Set,this.unknownIntegerProps=[],this.unmatchableGetters=[],this.unmatchablePropertiesAndGetters=[],this.unmatchableSetters=[],Array.isArray(e))this.buildPropertyMaps(e);else {this.propertiesAndGettersByKey=this.propertiesAndSettersByKey=e;for(const t of Object.values(e))this.allProperties.push(...t);}}deoptimizeAllProperties(){var e;if(!this.hasUnknownDeoptimizedProperty){this.hasUnknownDeoptimizedProperty=!0;for(const e of Object.values(this.propertiesAndGettersByKey).concat(Object.values(this.settersByKey)))for(const t of e)t.deoptimizePath(B);null===(e=this.prototypeExpression)||void 0===e||e.deoptimizePath([L,L]),this.deoptimizeCachedEntities();}}deoptimizeIntegerProperties(){if(!this.hasUnknownDeoptimizedProperty&&!this.hasUnknownDeoptimizedInteger){this.hasUnknownDeoptimizedInteger=!0;for(const[e,t]of Object.entries(this.propertiesAndGettersByKey))if(dt.test(e))for(const e of t)e.deoptimizePath(B);this.deoptimizeCachedIntegerEntities();}}deoptimizePath(e){var t;if(this.hasUnknownDeoptimizedProperty||this.immutable)return;const s=e[0];if(1===e.length){if("string"!=typeof s)return s===O?this.deoptimizeIntegerProperties():this.deoptimizeAllProperties();if(!this.deoptimizedPaths[s]){this.deoptimizedPaths[s]=!0;const e=this.expressionsToBeDeoptimizedByKey[s];if(e)for(const t of e)t.deoptimizeCache();}}const i=1===e.length?B:e.slice(1);for(const e of "string"==typeof s?(this.propertiesAndGettersByKey[s]||this.unmatchablePropertiesAndGetters).concat(this.settersByKey[s]||this.unmatchableSetters):this.allProperties)e.deoptimizePath(i);null===(t=this.prototypeExpression)||void 0===t||t.deoptimizePath(1===e.length?[L,L]:e);}deoptimizeThisOnEventAtPath(e,t,s,i){var n;const[r,...a]=t;if(this.hasUnknownDeoptimizedProperty||(2===e||t.length>1)&&"string"==typeof r&&this.deoptimizedPaths[r])return void s.deoptimizePath(B);const[o,h,l]=2===e||t.length>1?[this.propertiesAndGettersByKey,this.propertiesAndGettersByKey,this.unmatchablePropertiesAndGetters]:0===e?[this.propertiesAndGettersByKey,this.gettersByKey,this.unmatchableGetters]:[this.propertiesAndSettersByKey,this.settersByKey,this.unmatchableSetters];if("string"==typeof r){if(o[r]){const t=h[r];if(t)for(const n of t)n.deoptimizeThisOnEventAtPath(e,a,s,i);return void(this.immutable||this.thisParametersToBeDeoptimized.add(s))}for(const t of l)t.deoptimizeThisOnEventAtPath(e,a,s,i);if(dt.test(r))for(const t of this.unknownIntegerProps)t.deoptimizeThisOnEventAtPath(e,a,s,i);}else {for(const t of Object.values(h).concat([l]))for(const n of t)n.deoptimizeThisOnEventAtPath(e,a,s,i);for(const t of this.unknownIntegerProps)t.deoptimizeThisOnEventAtPath(e,a,s,i);}this.immutable||this.thisParametersToBeDeoptimized.add(s),null===(n=this.prototypeExpression)||void 0===n||n.deoptimizeThisOnEventAtPath(e,t,s,i);}getLiteralValueAtPath(e,t,s){if(0===e.length)return G;const i=e[0],n=this.getMemberExpressionAndTrackDeopt(i,s);return n?n.getLiteralValueAtPath(e.slice(1),t,s):this.prototypeExpression?this.prototypeExpression.getLiteralValueAtPath(e,t,s):1!==e.length?G:void 0}getReturnExpressionWhenCalledAtPath(e,t,s,i){if(0===e.length)return q;const n=e[0],r=this.getMemberExpressionAndTrackDeopt(n,i);return r?r.getReturnExpressionWhenCalledAtPath(e.slice(1),t,s,i):this.prototypeExpression?this.prototypeExpression.getReturnExpressionWhenCalledAtPath(e,t,s,i):q}hasEffectsWhenAccessedAtPath(e,t){const[s,...i]=e;if(e.length>1){if("string"!=typeof s)return !0;const n=this.getMemberExpression(s);return n?n.hasEffectsWhenAccessedAtPath(i,t):!this.prototypeExpression||this.prototypeExpression.hasEffectsWhenAccessedAtPath(e,t)}if(this.hasUnknownDeoptimizedProperty)return !0;if("string"==typeof s){if(this.propertiesAndGettersByKey[s]){const e=this.gettersByKey[s];if(e)for(const s of e)if(s.hasEffectsWhenAccessedAtPath(i,t))return !0;return !1}for(const e of this.unmatchableGetters)if(e.hasEffectsWhenAccessedAtPath(i,t))return !0}else for(const e of Object.values(this.gettersByKey).concat([this.unmatchableGetters]))for(const s of e)if(s.hasEffectsWhenAccessedAtPath(i,t))return !0;return !!this.prototypeExpression&&this.prototypeExpression.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){const[s,...i]=e;if(e.length>1){if("string"!=typeof s)return !0;const n=this.getMemberExpression(s);return n?n.hasEffectsWhenAssignedAtPath(i,t):!this.prototypeExpression||this.prototypeExpression.hasEffectsWhenAssignedAtPath(e,t)}if(this.hasUnknownDeoptimizedProperty)return !0;if("string"==typeof s){if(this.propertiesAndSettersByKey[s]){const e=this.settersByKey[s];if(e)for(const s of e)if(s.hasEffectsWhenAssignedAtPath(i,t))return !0;return !1}for(const e of this.unmatchableSetters)if(e.hasEffectsWhenAssignedAtPath(i,t))return !0}return !!this.prototypeExpression&&this.prototypeExpression.hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,s){const i=e[0],n=this.getMemberExpression(i);return n?n.hasEffectsWhenCalledAtPath(e.slice(1),t,s):!this.prototypeExpression||this.prototypeExpression.hasEffectsWhenCalledAtPath(e,t,s)}buildPropertyMaps(e){const{allProperties:t,propertiesAndGettersByKey:s,propertiesAndSettersByKey:i,settersByKey:n,gettersByKey:r,unknownIntegerProps:a,unmatchablePropertiesAndGetters:o,unmatchableGetters:h,unmatchableSetters:l}=this,c=[];for(let u=e.length-1;u>=0;u--){const{key:d,kind:p,property:f}=e[u];if(t.push(f),"string"!=typeof d){if(d===O){a.push(f);continue}"set"===p&&l.push(f),"get"===p&&h.push(f),"get"!==p&&c.push(f),"set"!==p&&o.push(f);}else "set"===p?i[d]||(i[d]=[f,...c],n[d]=[f,...l]):"get"===p?s[d]||(s[d]=[f,...o],r[d]=[f,...h]):(i[d]||(i[d]=[f,...c]),s[d]||(s[d]=[f,...o]));}}deoptimizeCachedEntities(){for(const e of Object.values(this.expressionsToBeDeoptimizedByKey))for(const t of e)t.deoptimizeCache();for(const e of this.thisParametersToBeDeoptimized)e.deoptimizePath(B);}deoptimizeCachedIntegerEntities(){for(const[e,t]of Object.entries(this.expressionsToBeDeoptimizedByKey))if(dt.test(e))for(const e of t)e.deoptimizeCache();for(const e of this.thisParametersToBeDeoptimized)e.deoptimizePath(F);}getMemberExpression(e){if(this.hasUnknownDeoptimizedProperty||"string"!=typeof e||this.hasUnknownDeoptimizedInteger&&dt.test(e)||this.deoptimizedPaths[e])return q;const t=this.propertiesAndGettersByKey[e];return 1===(null==t?void 0:t.length)?t[0]:t||this.unmatchablePropertiesAndGetters.length>0||this.unknownIntegerProps.length&&dt.test(e)?q:null}getMemberExpressionAndTrackDeopt(e,t){if("string"!=typeof e)return q;const s=this.getMemberExpression(e);if(s!==q&&!this.immutable){(this.expressionsToBeDeoptimizedByKey[e]=this.expressionsToBeDeoptimizedByKey[e]||[]).push(t);}return s}}const ft=e=>"string"==typeof e&&/^\d+$/.test(e),mt=new class extends H{deoptimizeThisOnEventAtPath(e,t,s){2!==e||1!==t.length||ft(t[0])||s.deoptimizePath(B);}getLiteralValueAtPath(e){return 1===e.length&&ft(e[0])?void 0:G}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>1}},gt=new pt({__proto__:null,hasOwnProperty:ht,isPrototypeOf:ht,propertyIsEnumerable:ht,toLocaleString:lt,toString:lt,valueOf:ut},mt,!0),yt=[{key:O,kind:"init",property:q},{key:"length",kind:"init",property:Le}],Et=[new ot({callsArgs:[0],mutatesSelfAsArray:"deopt-only",returns:null,returnsPrimitive:Me})],xt=[new ot({callsArgs:[0],mutatesSelfAsArray:"deopt-only",returns:null,returnsPrimitive:Le})],vt=[new ot({callsArgs:null,mutatesSelfAsArray:!0,returns:()=>new pt(yt,Nt),returnsPrimitive:null})],bt=[new ot({callsArgs:null,mutatesSelfAsArray:"deopt-only",returns:()=>new pt(yt,Nt),returnsPrimitive:null})],St=[new ot({callsArgs:[0],mutatesSelfAsArray:"deopt-only",returns:()=>new pt(yt,Nt),returnsPrimitive:null})],At=[new ot({callsArgs:null,mutatesSelfAsArray:!0,returns:null,returnsPrimitive:Le})],Pt=[new ot({callsArgs:null,mutatesSelfAsArray:!0,returns:null,returnsPrimitive:q})],kt=[new ot({callsArgs:null,mutatesSelfAsArray:"deopt-only",returns:null,returnsPrimitive:q})],wt=[new ot({callsArgs:[0],mutatesSelfAsArray:"deopt-only",returns:null,returnsPrimitive:q})],Ct=[new ot({callsArgs:null,mutatesSelfAsArray:!0,returns:"self",returnsPrimitive:null})],It=[new ot({callsArgs:[0],mutatesSelfAsArray:!0,returns:"self",returnsPrimitive:null})],Nt=new pt({__proto__:null,at:kt,concat:bt,copyWithin:Ct,entries:bt,every:Et,fill:Ct,filter:St,find:wt,findIndex:xt,findLast:wt,findLastIndex:xt,flat:bt,flatMap:St,forEach:wt,groupBy:wt,groupByToMap:wt,includes:ht,indexOf:ct,join:lt,keys:ut,lastIndexOf:ct,map:St,pop:Pt,push:At,reduce:wt,reduceRight:wt,reverse:Ct,shift:Pt,slice:bt,some:Et,sort:It,splice:vt,toLocaleString:lt,toString:lt,unshift:At,values:kt},gt,!0);class _t extends K{constructor(e,t,s,i){super(e),this.calledFromTryStatement=!1,this.additionalInitializers=null,this.expressionsToBeDeoptimized=[],this.declarations=t?[t]:[],this.init=s,this.deoptimizationTracker=i.deoptimizationTracker,this.module=i.module;}addDeclaration(e,t){this.declarations.push(e);const s=this.markInitializersForDeoptimization();null!==t&&s.push(t);}consolidateInitializers(){if(null!==this.additionalInitializers){for(const e of this.additionalInitializers)e.deoptimizePath(B);this.additionalInitializers=null;}}deoptimizePath(e){var t,s;if(!this.isReassigned&&!this.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(e,this))if(0===e.length){if(!this.isReassigned){this.isReassigned=!0;const e=this.expressionsToBeDeoptimized;this.expressionsToBeDeoptimized=[];for(const t of e)t.deoptimizeCache();null===(t=this.init)||void 0===t||t.deoptimizePath(B);}}else null===(s=this.init)||void 0===s||s.deoptimizePath(e);}deoptimizeThisOnEventAtPath(e,t,s,i){if(this.isReassigned||!this.init)return s.deoptimizePath(B);i.withTrackedEntityAtPath(t,this.init,(()=>this.init.deoptimizeThisOnEventAtPath(e,t,s,i)),void 0);}getLiteralValueAtPath(e,t,s){return this.isReassigned||!this.init?G:t.withTrackedEntityAtPath(e,this.init,(()=>(this.expressionsToBeDeoptimized.push(s),this.init.getLiteralValueAtPath(e,t,s))),G)}getReturnExpressionWhenCalledAtPath(e,t,s,i){return this.isReassigned||!this.init?q:s.withTrackedEntityAtPath(e,this.init,(()=>(this.expressionsToBeDeoptimized.push(i),this.init.getReturnExpressionWhenCalledAtPath(e,t,s,i))),q)}hasEffectsWhenAccessedAtPath(e,t){return !!this.isReassigned||this.init&&!t.accessed.trackEntityAtPathAndGetIfTracked(e,this)&&this.init.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return !!this.included||0!==e.length&&(!!this.isReassigned||this.init&&!t.accessed.trackEntityAtPathAndGetIfTracked(e,this)&&this.init.hasEffectsWhenAssignedAtPath(e,t))}hasEffectsWhenCalledAtPath(e,t,s){return !!this.isReassigned||this.init&&!(t.withNew?s.instantiated:s.called).trackEntityAtPathAndGetIfTracked(e,t,this)&&this.init.hasEffectsWhenCalledAtPath(e,t,s)}include(){if(!this.included){this.included=!0;for(const e of this.declarations){e.included||e.include(Ie(),!1);let t=e.parent;for(;!t.included&&(t.included=!0,"Program"!==t.type);)t=t.parent;}}}includeCallArguments(e,t){if(this.isReassigned||this.init&&e.includedCallArguments.has(this.init))for(const s of t)s.include(e,!1);else this.init&&(e.includedCallArguments.add(this.init),this.init.includeCallArguments(e,t),e.includedCallArguments.delete(this.init));}markCalledFromTryStatement(){this.calledFromTryStatement=!0;}markInitializersForDeoptimization(){return null===this.additionalInitializers&&(this.additionalInitializers=null===this.init?[]:[this.init],this.init=q,this.isReassigned=!0),this.additionalInitializers}}function $t(e){let t="";do{const s=e%64;e=Math.floor(e/64),t="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$"[s]+t;}while(0!==e);return t}function Tt(e,t){let s=e,i=1;for(;t.has(s)||be.has(s);)s=`${e}$${$t(i++)}`;return t.add(s),s}class Rt{constructor(){this.children=[],this.variables=new Map;}addDeclaration(e,t,s,i){const n=e.name;let r=this.variables.get(n);return r?r.addDeclaration(e,s):(r=new _t(e.name,e,s||Te,t),this.variables.set(n,r)),r}contains(e){return this.variables.has(e)}findVariable(e){throw new Error("Internal Error: findVariable needs to be implemented by a subclass")}}class Mt extends Rt{constructor(e){super(),this.accessedOutsideVariables=new Map,this.parent=e,e.children.push(this);}addAccessedDynamicImport(e){(this.accessedDynamicImports||(this.accessedDynamicImports=new Set)).add(e),this.parent instanceof Mt&&this.parent.addAccessedDynamicImport(e);}addAccessedGlobals(e,t){const s=t.get(this)||new Set;for(const t of e)s.add(t);t.set(this,s),this.parent instanceof Mt&&this.parent.addAccessedGlobals(e,t);}addNamespaceMemberAccess(e,t){this.accessedOutsideVariables.set(e,t),this.parent.addNamespaceMemberAccess(e,t);}addReturnExpression(e){this.parent instanceof Mt&&this.parent.addReturnExpression(e);}addUsedOutsideNames(e,t,s,i){for(const i of this.accessedOutsideVariables.values())i.included&&(e.add(i.getBaseVariableName()),"system"===t&&s.has(i)&&e.add("exports"));const n=i.get(this);if(n)for(const t of n)e.add(t);}contains(e){return this.variables.has(e)||this.parent.contains(e)}deconflict(e,t,s){const i=new Set;if(this.addUsedOutsideNames(i,e,t,s),this.accessedDynamicImports)for(const e of this.accessedDynamicImports)e.inlineNamespace&&i.add(e.inlineNamespace.getBaseVariableName());for(const[e,t]of this.variables)(t.included||t.alwaysRendered)&&t.setRenderNames(null,Tt(e,i));for(const i of this.children)i.deconflict(e,t,s);}findLexicalBoundary(){return this.parent.findLexicalBoundary()}findVariable(e){const t=this.variables.get(e)||this.accessedOutsideVariables.get(e);if(t)return t;const s=this.parent.findVariable(e);return this.accessedOutsideVariables.set(e,s),s}}class Dt extends Mt{constructor(e,t){super(e),this.parameters=[],this.hasRest=!1,this.context=t,this.hoistedBodyVarScope=new Mt(this);}addParameterDeclaration(e){const t=e.name;let s=this.hoistedBodyVarScope.variables.get(t);return s?s.addDeclaration(e,null):s=new _t(t,e,q,this.context),this.variables.set(t,s),s}addParameterVariables(e,t){this.parameters=e;for(const t of e)for(const e of t)e.alwaysRendered=!0;this.hasRest=t;}includeCallArguments(e,t){let s=!1,i=!1;const n=this.hasRest&&this.parameters[this.parameters.length-1];for(const s of t)if(s instanceof at){for(const s of t)s.include(e,!1);break}for(let r=t.length-1;r>=0;r--){const a=this.parameters[r]||n,o=t[r];if(a)if(s=!1,0===a.length)i=!0;else for(const e of a)e.included&&(i=!0),e.calledFromTryStatement&&(s=!0);!i&&o.shouldBeIncluded(e)&&(i=!0),i&&o.include(e,s);}}}class Lt extends Dt{constructor(){super(...arguments),this.returnExpression=null,this.returnExpressions=[];}addReturnExpression(e){this.returnExpressions.push(e);}getReturnExpression(){return null===this.returnExpression&&this.updateReturnExpression(),this.returnExpression}updateReturnExpression(){if(1===this.returnExpressions.length)this.returnExpression=this.returnExpressions[0];else {this.returnExpression=q;for(const e of this.returnExpressions)e.deoptimizePath(B);}}}function Ot(e,t,s,i){if(t.remove(s,i),e.annotations)for(const i of e.annotations){if(!(i.start<s))return;t.remove(i.start,i.end);}}function Ft(e,t,s=0){let i,n;for(i=e.indexOf(t,s);;){if(-1===(s=e.indexOf("/",s))||s>=i)return i;n=e.charCodeAt(++s),++s,(s=47===n?e.indexOf("\n",s)+1:e.indexOf("*/",s)+2)>i&&(i=e.indexOf(t,s));}}const zt=/\S/g;function Wt(e,t){zt.lastIndex=t;return zt.exec(e).index}function Ut(e){let t,s,i=0;for(t=e.indexOf("\n",i);;){if(i=e.indexOf("/",i),-1===i||i>t)return [t,t+1];if(s=e.charCodeAt(i+1),47===s)return [i,t+1];i=e.indexOf("*/",i+3)+2,i>t&&(t=e.indexOf("\n",i));}}function jt(e,t,s,i,n){let r,a,o,h,l=e[0],c=!l.included||l.needsBoundaries;c&&(h=s+Ut(t.original.slice(s,l.start))[1]);for(let s=1;s<=e.length;s++)r=l,a=h,o=c,l=e[s],c=void 0!==l&&(!l.included||l.needsBoundaries),o||c?(h=r.end+Ut(t.original.slice(r.end,void 0===l?i:l.start))[1],r.included?o?r.render(t,n,{end:h,start:a}):r.render(t,n):Ot(r,t,a,h)):r.render(t,n);}class qt extends Mt{addDeclaration(e,t,s,i){if(i){const n=this.parent.addDeclaration(e,t,s,i);return n.markInitializersForDeoptimization(),n}return super.addDeclaration(e,t,s,!1)}}class Kt extends rt{initialise(){this.directive&&"use strict"!==this.directive&&"Program"===this.parent.type&&this.context.warn({code:"MODULE_LEVEL_DIRECTIVE",message:`Module level directives cause errors when bundled, '${this.directive}' was ignored.`},this.start);}render(e,t){super.render(e,t),this.included&&this.insertSemicolon(e);}shouldBeIncluded(e){return this.directive&&"use strict"!==this.directive?"Program"!==this.parent.type:super.shouldBeIncluded(e)}}class Xt extends rt{constructor(){super(...arguments),this.directlyIncluded=!1;}addImplicitReturnExpressionToScope(){const e=this.body[this.body.length-1];e&&"ReturnStatement"===e.type||this.scope.addReturnExpression(q);}createScope(e){this.scope=this.parent.preventChildBlockScope?e:new qt(e);}hasEffects(e){if(this.deoptimizeBody)return !0;for(const t of this.body){if(e.brokenFlow)break;if(t.hasEffects(e))return !0}return !1}include(e,t){if(!this.deoptimizeBody||!this.directlyIncluded){this.included=!0,this.directlyIncluded=!0,this.deoptimizeBody&&(t=!0);for(const s of this.body)(t||s.shouldBeIncluded(e))&&s.include(e,t);}}initialise(){const e=this.body[0];this.deoptimizeBody=e instanceof Kt&&"use asm"===e.directive;}render(e,t){this.body.length?jt(this.body,e,this.start+1,this.end-1,t):super.render(e,t);}}function Yt(e,t){if("MemberExpression"===e.type)return !e.computed&&Yt(e.object,e);if("Identifier"===e.type){if(!t)return !0;switch(t.type){case"MemberExpression":return t.computed||e===t.object;case"MethodDefinition":return t.computed;case"PropertyDefinition":case"Property":return t.computed||e===t.value;case"ExportSpecifier":case"ImportSpecifier":return e===t.local;case"LabeledStatement":case"BreakStatement":case"ContinueStatement":return !1;default:return !0}}return !1}const Qt=Symbol("Value Properties"),Zt={pure:!0},Jt={pure:!1},es={__proto__:null,[Qt]:Jt},ts={__proto__:null,[Qt]:Zt},ss={__proto__:null,[Qt]:Jt,prototype:es},is={__proto__:null,[Qt]:Zt,prototype:es},ns={__proto__:null,[Qt]:Zt,from:ts,of:ts,prototype:es},rs={__proto__:null,[Qt]:Zt,supportedLocalesOf:is},as={global:es,globalThis:es,self:es,window:es,__proto__:null,[Qt]:Jt,Array:{__proto__:null,[Qt]:Jt,from:es,isArray:ts,of:ts,prototype:es},ArrayBuffer:{__proto__:null,[Qt]:Zt,isView:ts,prototype:es},Atomics:es,BigInt:ss,BigInt64Array:ss,BigUint64Array:ss,Boolean:is,constructor:ss,DataView:is,Date:{__proto__:null,[Qt]:Zt,now:ts,parse:ts,prototype:es,UTC:ts},decodeURI:ts,decodeURIComponent:ts,encodeURI:ts,encodeURIComponent:ts,Error:is,escape:ts,eval:es,EvalError:is,Float32Array:ns,Float64Array:ns,Function:ss,hasOwnProperty:es,Infinity:es,Int16Array:ns,Int32Array:ns,Int8Array:ns,isFinite:ts,isNaN:ts,isPrototypeOf:es,JSON:es,Map:is,Math:{__proto__:null,[Qt]:Jt,abs:ts,acos:ts,acosh:ts,asin:ts,asinh:ts,atan:ts,atan2:ts,atanh:ts,cbrt:ts,ceil:ts,clz32:ts,cos:ts,cosh:ts,exp:ts,expm1:ts,floor:ts,fround:ts,hypot:ts,imul:ts,log:ts,log10:ts,log1p:ts,log2:ts,max:ts,min:ts,pow:ts,random:ts,round:ts,sign:ts,sin:ts,sinh:ts,sqrt:ts,tan:ts,tanh:ts,trunc:ts},NaN:es,Number:{__proto__:null,[Qt]:Zt,isFinite:ts,isInteger:ts,isNaN:ts,isSafeInteger:ts,parseFloat:ts,parseInt:ts,prototype:es},Object:{__proto__:null,[Qt]:Zt,create:ts,getOwnPropertyDescriptor:ts,getOwnPropertyNames:ts,getOwnPropertySymbols:ts,getPrototypeOf:ts,is:ts,isExtensible:ts,isFrozen:ts,isSealed:ts,keys:ts,fromEntries:ts,entries:ts,prototype:es},parseFloat:ts,parseInt:ts,Promise:{__proto__:null,[Qt]:Jt,all:es,prototype:es,race:es,reject:es,resolve:es},propertyIsEnumerable:es,Proxy:es,RangeError:is,ReferenceError:is,Reflect:es,RegExp:is,Set:is,SharedArrayBuffer:ss,String:{__proto__:null,[Qt]:Zt,fromCharCode:ts,fromCodePoint:ts,prototype:es,raw:ts},Symbol:{__proto__:null,[Qt]:Zt,for:ts,keyFor:ts,prototype:es},SyntaxError:is,toLocaleString:es,toString:es,TypeError:is,Uint16Array:ns,Uint32Array:ns,Uint8Array:ns,Uint8ClampedArray:ns,unescape:ts,URIError:is,valueOf:es,WeakMap:is,WeakSet:is,clearInterval:ss,clearTimeout:ss,console:es,Intl:{__proto__:null,[Qt]:Jt,Collator:rs,DateTimeFormat:rs,ListFormat:rs,NumberFormat:rs,PluralRules:rs,RelativeTimeFormat:rs},setInterval:ss,setTimeout:ss,TextDecoder:ss,TextEncoder:ss,URL:ss,URLSearchParams:ss,AbortController:ss,AbortSignal:ss,addEventListener:es,alert:es,AnalyserNode:ss,Animation:ss,AnimationEvent:ss,applicationCache:es,ApplicationCache:ss,ApplicationCacheErrorEvent:ss,atob:es,Attr:ss,Audio:ss,AudioBuffer:ss,AudioBufferSourceNode:ss,AudioContext:ss,AudioDestinationNode:ss,AudioListener:ss,AudioNode:ss,AudioParam:ss,AudioProcessingEvent:ss,AudioScheduledSourceNode:ss,AudioWorkletNode:ss,BarProp:ss,BaseAudioContext:ss,BatteryManager:ss,BeforeUnloadEvent:ss,BiquadFilterNode:ss,Blob:ss,BlobEvent:ss,blur:es,BroadcastChannel:ss,btoa:es,ByteLengthQueuingStrategy:ss,Cache:ss,caches:es,CacheStorage:ss,cancelAnimationFrame:es,cancelIdleCallback:es,CanvasCaptureMediaStreamTrack:ss,CanvasGradient:ss,CanvasPattern:ss,CanvasRenderingContext2D:ss,ChannelMergerNode:ss,ChannelSplitterNode:ss,CharacterData:ss,clientInformation:es,ClipboardEvent:ss,close:es,closed:es,CloseEvent:ss,Comment:ss,CompositionEvent:ss,confirm:es,ConstantSourceNode:ss,ConvolverNode:ss,CountQueuingStrategy:ss,createImageBitmap:es,Credential:ss,CredentialsContainer:ss,crypto:es,Crypto:ss,CryptoKey:ss,CSS:ss,CSSConditionRule:ss,CSSFontFaceRule:ss,CSSGroupingRule:ss,CSSImportRule:ss,CSSKeyframeRule:ss,CSSKeyframesRule:ss,CSSMediaRule:ss,CSSNamespaceRule:ss,CSSPageRule:ss,CSSRule:ss,CSSRuleList:ss,CSSStyleDeclaration:ss,CSSStyleRule:ss,CSSStyleSheet:ss,CSSSupportsRule:ss,CustomElementRegistry:ss,customElements:es,CustomEvent:ss,DataTransfer:ss,DataTransferItem:ss,DataTransferItemList:ss,defaultstatus:es,defaultStatus:es,DelayNode:ss,DeviceMotionEvent:ss,DeviceOrientationEvent:ss,devicePixelRatio:es,dispatchEvent:es,document:es,Document:ss,DocumentFragment:ss,DocumentType:ss,DOMError:ss,DOMException:ss,DOMImplementation:ss,DOMMatrix:ss,DOMMatrixReadOnly:ss,DOMParser:ss,DOMPoint:ss,DOMPointReadOnly:ss,DOMQuad:ss,DOMRect:ss,DOMRectReadOnly:ss,DOMStringList:ss,DOMStringMap:ss,DOMTokenList:ss,DragEvent:ss,DynamicsCompressorNode:ss,Element:ss,ErrorEvent:ss,Event:ss,EventSource:ss,EventTarget:ss,external:es,fetch:es,File:ss,FileList:ss,FileReader:ss,find:es,focus:es,FocusEvent:ss,FontFace:ss,FontFaceSetLoadEvent:ss,FormData:ss,frames:es,GainNode:ss,Gamepad:ss,GamepadButton:ss,GamepadEvent:ss,getComputedStyle:es,getSelection:es,HashChangeEvent:ss,Headers:ss,history:es,History:ss,HTMLAllCollection:ss,HTMLAnchorElement:ss,HTMLAreaElement:ss,HTMLAudioElement:ss,HTMLBaseElement:ss,HTMLBodyElement:ss,HTMLBRElement:ss,HTMLButtonElement:ss,HTMLCanvasElement:ss,HTMLCollection:ss,HTMLContentElement:ss,HTMLDataElement:ss,HTMLDataListElement:ss,HTMLDetailsElement:ss,HTMLDialogElement:ss,HTMLDirectoryElement:ss,HTMLDivElement:ss,HTMLDListElement:ss,HTMLDocument:ss,HTMLElement:ss,HTMLEmbedElement:ss,HTMLFieldSetElement:ss,HTMLFontElement:ss,HTMLFormControlsCollection:ss,HTMLFormElement:ss,HTMLFrameElement:ss,HTMLFrameSetElement:ss,HTMLHeadElement:ss,HTMLHeadingElement:ss,HTMLHRElement:ss,HTMLHtmlElement:ss,HTMLIFrameElement:ss,HTMLImageElement:ss,HTMLInputElement:ss,HTMLLabelElement:ss,HTMLLegendElement:ss,HTMLLIElement:ss,HTMLLinkElement:ss,HTMLMapElement:ss,HTMLMarqueeElement:ss,HTMLMediaElement:ss,HTMLMenuElement:ss,HTMLMetaElement:ss,HTMLMeterElement:ss,HTMLModElement:ss,HTMLObjectElement:ss,HTMLOListElement:ss,HTMLOptGroupElement:ss,HTMLOptionElement:ss,HTMLOptionsCollection:ss,HTMLOutputElement:ss,HTMLParagraphElement:ss,HTMLParamElement:ss,HTMLPictureElement:ss,HTMLPreElement:ss,HTMLProgressElement:ss,HTMLQuoteElement:ss,HTMLScriptElement:ss,HTMLSelectElement:ss,HTMLShadowElement:ss,HTMLSlotElement:ss,HTMLSourceElement:ss,HTMLSpanElement:ss,HTMLStyleElement:ss,HTMLTableCaptionElement:ss,HTMLTableCellElement:ss,HTMLTableColElement:ss,HTMLTableElement:ss,HTMLTableRowElement:ss,HTMLTableSectionElement:ss,HTMLTemplateElement:ss,HTMLTextAreaElement:ss,HTMLTimeElement:ss,HTMLTitleElement:ss,HTMLTrackElement:ss,HTMLUListElement:ss,HTMLUnknownElement:ss,HTMLVideoElement:ss,IDBCursor:ss,IDBCursorWithValue:ss,IDBDatabase:ss,IDBFactory:ss,IDBIndex:ss,IDBKeyRange:ss,IDBObjectStore:ss,IDBOpenDBRequest:ss,IDBRequest:ss,IDBTransaction:ss,IDBVersionChangeEvent:ss,IdleDeadline:ss,IIRFilterNode:ss,Image:ss,ImageBitmap:ss,ImageBitmapRenderingContext:ss,ImageCapture:ss,ImageData:ss,indexedDB:es,innerHeight:es,innerWidth:es,InputEvent:ss,IntersectionObserver:ss,IntersectionObserverEntry:ss,isSecureContext:es,KeyboardEvent:ss,KeyframeEffect:ss,length:es,localStorage:es,location:es,Location:ss,locationbar:es,matchMedia:es,MediaDeviceInfo:ss,MediaDevices:ss,MediaElementAudioSourceNode:ss,MediaEncryptedEvent:ss,MediaError:ss,MediaKeyMessageEvent:ss,MediaKeySession:ss,MediaKeyStatusMap:ss,MediaKeySystemAccess:ss,MediaList:ss,MediaQueryList:ss,MediaQueryListEvent:ss,MediaRecorder:ss,MediaSettingsRange:ss,MediaSource:ss,MediaStream:ss,MediaStreamAudioDestinationNode:ss,MediaStreamAudioSourceNode:ss,MediaStreamEvent:ss,MediaStreamTrack:ss,MediaStreamTrackEvent:ss,menubar:es,MessageChannel:ss,MessageEvent:ss,MessagePort:ss,MIDIAccess:ss,MIDIConnectionEvent:ss,MIDIInput:ss,MIDIInputMap:ss,MIDIMessageEvent:ss,MIDIOutput:ss,MIDIOutputMap:ss,MIDIPort:ss,MimeType:ss,MimeTypeArray:ss,MouseEvent:ss,moveBy:es,moveTo:es,MutationEvent:ss,MutationObserver:ss,MutationRecord:ss,name:es,NamedNodeMap:ss,NavigationPreloadManager:ss,navigator:es,Navigator:ss,NetworkInformation:ss,Node:ss,NodeFilter:es,NodeIterator:ss,NodeList:ss,Notification:ss,OfflineAudioCompletionEvent:ss,OfflineAudioContext:ss,offscreenBuffering:es,OffscreenCanvas:ss,open:es,openDatabase:es,Option:ss,origin:es,OscillatorNode:ss,outerHeight:es,outerWidth:es,PageTransitionEvent:ss,pageXOffset:es,pageYOffset:es,PannerNode:ss,parent:es,Path2D:ss,PaymentAddress:ss,PaymentRequest:ss,PaymentRequestUpdateEvent:ss,PaymentResponse:ss,performance:es,Performance:ss,PerformanceEntry:ss,PerformanceLongTaskTiming:ss,PerformanceMark:ss,PerformanceMeasure:ss,PerformanceNavigation:ss,PerformanceNavigationTiming:ss,PerformanceObserver:ss,PerformanceObserverEntryList:ss,PerformancePaintTiming:ss,PerformanceResourceTiming:ss,PerformanceTiming:ss,PeriodicWave:ss,Permissions:ss,PermissionStatus:ss,personalbar:es,PhotoCapabilities:ss,Plugin:ss,PluginArray:ss,PointerEvent:ss,PopStateEvent:ss,postMessage:es,Presentation:ss,PresentationAvailability:ss,PresentationConnection:ss,PresentationConnectionAvailableEvent:ss,PresentationConnectionCloseEvent:ss,PresentationConnectionList:ss,PresentationReceiver:ss,PresentationRequest:ss,print:es,ProcessingInstruction:ss,ProgressEvent:ss,PromiseRejectionEvent:ss,prompt:es,PushManager:ss,PushSubscription:ss,PushSubscriptionOptions:ss,queueMicrotask:es,RadioNodeList:ss,Range:ss,ReadableStream:ss,RemotePlayback:ss,removeEventListener:es,Request:ss,requestAnimationFrame:es,requestIdleCallback:es,resizeBy:es,ResizeObserver:ss,ResizeObserverEntry:ss,resizeTo:es,Response:ss,RTCCertificate:ss,RTCDataChannel:ss,RTCDataChannelEvent:ss,RTCDtlsTransport:ss,RTCIceCandidate:ss,RTCIceTransport:ss,RTCPeerConnection:ss,RTCPeerConnectionIceEvent:ss,RTCRtpReceiver:ss,RTCRtpSender:ss,RTCSctpTransport:ss,RTCSessionDescription:ss,RTCStatsReport:ss,RTCTrackEvent:ss,screen:es,Screen:ss,screenLeft:es,ScreenOrientation:ss,screenTop:es,screenX:es,screenY:es,ScriptProcessorNode:ss,scroll:es,scrollbars:es,scrollBy:es,scrollTo:es,scrollX:es,scrollY:es,SecurityPolicyViolationEvent:ss,Selection:ss,ServiceWorker:ss,ServiceWorkerContainer:ss,ServiceWorkerRegistration:ss,sessionStorage:es,ShadowRoot:ss,SharedWorker:ss,SourceBuffer:ss,SourceBufferList:ss,speechSynthesis:es,SpeechSynthesisEvent:ss,SpeechSynthesisUtterance:ss,StaticRange:ss,status:es,statusbar:es,StereoPannerNode:ss,stop:es,Storage:ss,StorageEvent:ss,StorageManager:ss,styleMedia:es,StyleSheet:ss,StyleSheetList:ss,SubtleCrypto:ss,SVGAElement:ss,SVGAngle:ss,SVGAnimatedAngle:ss,SVGAnimatedBoolean:ss,SVGAnimatedEnumeration:ss,SVGAnimatedInteger:ss,SVGAnimatedLength:ss,SVGAnimatedLengthList:ss,SVGAnimatedNumber:ss,SVGAnimatedNumberList:ss,SVGAnimatedPreserveAspectRatio:ss,SVGAnimatedRect:ss,SVGAnimatedString:ss,SVGAnimatedTransformList:ss,SVGAnimateElement:ss,SVGAnimateMotionElement:ss,SVGAnimateTransformElement:ss,SVGAnimationElement:ss,SVGCircleElement:ss,SVGClipPathElement:ss,SVGComponentTransferFunctionElement:ss,SVGDefsElement:ss,SVGDescElement:ss,SVGDiscardElement:ss,SVGElement:ss,SVGEllipseElement:ss,SVGFEBlendElement:ss,SVGFEColorMatrixElement:ss,SVGFEComponentTransferElement:ss,SVGFECompositeElement:ss,SVGFEConvolveMatrixElement:ss,SVGFEDiffuseLightingElement:ss,SVGFEDisplacementMapElement:ss,SVGFEDistantLightElement:ss,SVGFEDropShadowElement:ss,SVGFEFloodElement:ss,SVGFEFuncAElement:ss,SVGFEFuncBElement:ss,SVGFEFuncGElement:ss,SVGFEFuncRElement:ss,SVGFEGaussianBlurElement:ss,SVGFEImageElement:ss,SVGFEMergeElement:ss,SVGFEMergeNodeElement:ss,SVGFEMorphologyElement:ss,SVGFEOffsetElement:ss,SVGFEPointLightElement:ss,SVGFESpecularLightingElement:ss,SVGFESpotLightElement:ss,SVGFETileElement:ss,SVGFETurbulenceElement:ss,SVGFilterElement:ss,SVGForeignObjectElement:ss,SVGGElement:ss,SVGGeometryElement:ss,SVGGradientElement:ss,SVGGraphicsElement:ss,SVGImageElement:ss,SVGLength:ss,SVGLengthList:ss,SVGLinearGradientElement:ss,SVGLineElement:ss,SVGMarkerElement:ss,SVGMaskElement:ss,SVGMatrix:ss,SVGMetadataElement:ss,SVGMPathElement:ss,SVGNumber:ss,SVGNumberList:ss,SVGPathElement:ss,SVGPatternElement:ss,SVGPoint:ss,SVGPointList:ss,SVGPolygonElement:ss,SVGPolylineElement:ss,SVGPreserveAspectRatio:ss,SVGRadialGradientElement:ss,SVGRect:ss,SVGRectElement:ss,SVGScriptElement:ss,SVGSetElement:ss,SVGStopElement:ss,SVGStringList:ss,SVGStyleElement:ss,SVGSVGElement:ss,SVGSwitchElement:ss,SVGSymbolElement:ss,SVGTextContentElement:ss,SVGTextElement:ss,SVGTextPathElement:ss,SVGTextPositioningElement:ss,SVGTitleElement:ss,SVGTransform:ss,SVGTransformList:ss,SVGTSpanElement:ss,SVGUnitTypes:ss,SVGUseElement:ss,SVGViewElement:ss,TaskAttributionTiming:ss,Text:ss,TextEvent:ss,TextMetrics:ss,TextTrack:ss,TextTrackCue:ss,TextTrackCueList:ss,TextTrackList:ss,TimeRanges:ss,toolbar:es,top:es,Touch:ss,TouchEvent:ss,TouchList:ss,TrackEvent:ss,TransitionEvent:ss,TreeWalker:ss,UIEvent:ss,ValidityState:ss,visualViewport:es,VisualViewport:ss,VTTCue:ss,WaveShaperNode:ss,WebAssembly:es,WebGL2RenderingContext:ss,WebGLActiveInfo:ss,WebGLBuffer:ss,WebGLContextEvent:ss,WebGLFramebuffer:ss,WebGLProgram:ss,WebGLQuery:ss,WebGLRenderbuffer:ss,WebGLRenderingContext:ss,WebGLSampler:ss,WebGLShader:ss,WebGLShaderPrecisionFormat:ss,WebGLSync:ss,WebGLTexture:ss,WebGLTransformFeedback:ss,WebGLUniformLocation:ss,WebGLVertexArrayObject:ss,WebSocket:ss,WheelEvent:ss,Window:ss,Worker:ss,WritableStream:ss,XMLDocument:ss,XMLHttpRequest:ss,XMLHttpRequestEventTarget:ss,XMLHttpRequestUpload:ss,XMLSerializer:ss,XPathEvaluator:ss,XPathExpression:ss,XPathResult:ss,XSLTProcessor:ss};for(const e of ["window","global","self","globalThis"])as[e]=as;function os(e){let t=as;for(const s of e){if("string"!=typeof s)return null;if(t=t[s],!t)return null}return t[Qt]}class hs extends K{constructor(){super(...arguments),this.isReassigned=!0;}hasEffectsWhenAccessedAtPath(e){return !function(e){return 1===e.length?"undefined"===e[0]||null!==os(e):null!==os(e.slice(0,-1))}([this.name,...e])}hasEffectsWhenCalledAtPath(e){return !function(e){const t=os(e);return null!==t&&t.pure}([this.name,...e])}}const ls={__proto__:null,class:!0,const:!0,let:!0,var:!0};class cs extends rt{constructor(){super(...arguments),this.variable=null,this.deoptimized=!1,this.isTDZAccess=null;}addExportedVariables(e,t){null!==this.variable&&t.has(this.variable)&&e.push(this.variable);}bind(){null===this.variable&&Yt(this,this.parent)&&(this.variable=this.scope.findVariable(this.name),this.variable.addReference(this));}declare(e,t){let s;const{treeshake:i}=this.context.options;switch(e){case"var":s=this.scope.addDeclaration(this,this.context,t,!0),i&&i.correctVarValueBeforeDeclaration&&s.markInitializersForDeoptimization();break;case"function":case"let":case"const":case"class":s=this.scope.addDeclaration(this,this.context,t,!1);break;case"parameter":s=this.scope.addParameterDeclaration(this);break;default:throw new Error(`Internal Error: Unexpected identifier kind ${e}.`)}return s.kind=e,[this.variable=s]}deoptimizePath(e){0!==e.length||this.scope.contains(this.name)||this.disallowImportReassignment(),this.variable.deoptimizePath(e);}deoptimizeThisOnEventAtPath(e,t,s,i){this.variable.deoptimizeThisOnEventAtPath(e,t,s,i);}getLiteralValueAtPath(e,t,s){return this.getVariableRespectingTDZ().getLiteralValueAtPath(e,t,s)}getReturnExpressionWhenCalledAtPath(e,t,s,i){return this.getVariableRespectingTDZ().getReturnExpressionWhenCalledAtPath(e,t,s,i)}hasEffects(){return this.deoptimized||this.applyDeoptimizations(),!(!this.isPossibleTDZ()||"var"===this.variable.kind)||this.context.options.treeshake.unknownGlobalSideEffects&&this.variable instanceof hs&&this.variable.hasEffectsWhenAccessedAtPath(V)}hasEffectsWhenAccessedAtPath(e,t){return null!==this.variable&&this.getVariableRespectingTDZ().hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return !this.variable||(e.length>0?this.getVariableRespectingTDZ():this.variable).hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,s){return !this.variable||this.getVariableRespectingTDZ().hasEffectsWhenCalledAtPath(e,t,s)}include(){this.deoptimized||this.applyDeoptimizations(),this.included||(this.included=!0,null!==this.variable&&this.context.includeVariableInModule(this.variable));}includeCallArguments(e,t){this.getVariableRespectingTDZ().includeCallArguments(e,t);}isPossibleTDZ(){if(null!==this.isTDZAccess)return this.isTDZAccess;if(!(this.variable instanceof _t&&this.variable.kind&&this.variable.kind in ls))return this.isTDZAccess=!1;let e;return this.variable.declarations&&1===this.variable.declarations.length&&(e=this.variable.declarations[0])&&this.start<e.start&&us(this)===us(e)?this.isTDZAccess=!0:this.variable.initReached?this.isTDZAccess=!1:this.isTDZAccess=!0}markDeclarationReached(){this.variable.initReached=!0;}render(e,{snippets:{getPropertyAccess:t}},{renderedParentType:s,isCalleeOfRenderedParent:i,isShorthandProperty:n}=Y){if(this.variable){const r=this.variable.getName(t);r!==this.name&&(e.overwrite(this.start,this.end,r,{contentOnly:!0,storeName:!0}),n&&e.prependRight(this.start,`${this.name}: `)),"eval"===r&&"CallExpression"===s&&i&&e.appendRight(this.start,"0, ");}}applyDeoptimizations(){this.deoptimized=!0,null!==this.variable&&this.variable instanceof _t&&(this.variable.consolidateInitializers(),this.context.requestTreeshakingPass());}disallowImportReassignment(){return this.context.error({code:"ILLEGAL_REASSIGNMENT",message:`Illegal reassignment to import '${this.name}'`},this.start)}getVariableRespectingTDZ(){return this.isPossibleTDZ()?q:this.variable}}function us(e){for(;e&&!/^Program|Function/.test(e.type);)e=e.parent;return e}class ds extends rt{constructor(){super(...arguments),this.deoptimized=!1,this.declarationInit=null;}addExportedVariables(e,t){this.argument.addExportedVariables(e,t);}declare(e,t){return this.declarationInit=t,this.argument.declare(e,q)}deoptimizePath(e){0===e.length&&this.argument.deoptimizePath(V);}hasEffectsWhenAssignedAtPath(e,t){return e.length>0||this.argument.hasEffectsWhenAssignedAtPath(V,t)}markDeclarationReached(){this.argument.markDeclarationReached();}applyDeoptimizations(){this.deoptimized=!0,null!==this.declarationInit&&(this.declarationInit.deoptimizePath([L,L]),this.context.requestTreeshakingPass());}}class ps extends rt{constructor(){super(...arguments),this.deoptimizedReturn=!1;}createScope(e){this.scope=new Lt(e,this.context);}deoptimizePath(e){1===e.length&&e[0]===L&&this.scope.getReturnExpression().deoptimizePath(B);}deoptimizeThisOnEventAtPath(){}getReturnExpressionWhenCalledAtPath(e){return 0!==e.length?q:this.async?(this.deoptimizedReturn||(this.deoptimizedReturn=!0,this.scope.getReturnExpression().deoptimizePath(B),this.context.requestTreeshakingPass()),q):this.scope.getReturnExpression()}hasEffects(){return !1}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,s){if(e.length>0)return !0;if(this.async){const{propertyReadSideEffects:e}=this.context.options.treeshake,t=this.scope.getReturnExpression();if(t.hasEffectsWhenCalledAtPath(["then"],{args:_e,thisParam:null,withNew:!1},s)||e&&("always"===e||t.hasEffectsWhenAccessedAtPath(["then"],s)))return !0}for(const e of this.params)if(e.hasEffects(s))return !0;const{ignore:i,brokenFlow:n}=s;return s.ignore={breaks:!1,continues:!1,labels:new Set,returnYield:!0},!!this.body.hasEffects(s)||(s.ignore=i,s.brokenFlow=n,!1)}include(e,t){this.included=!0;for(const s of this.params)s instanceof cs||s.include(e,t);const{brokenFlow:s}=e;e.brokenFlow=0,this.body.include(e,t),e.brokenFlow=s;}includeCallArguments(e,t){this.scope.includeCallArguments(e,t);}initialise(){this.scope.addParameterVariables(this.params.map((e=>e.declare("parameter",q))),this.params[this.params.length-1]instanceof ds),this.body instanceof Xt?this.body.addImplicitReturnExpressionToScope():this.scope.addReturnExpression(this.body);}parseNode(e){"BlockStatement"===e.body.type&&(this.body=new Xt(e.body,this,this.scope.hoistedBodyVarScope)),super.parseNode(e);}}function fs(e,{exportNamesByVariable:t,snippets:{_:s,getObject:i,getPropertyAccess:n}},r=""){if(1===e.length&&1===t.get(e[0]).length){const i=e[0];return `exports('${t.get(i)}',${s}${i.getName(n)}${r})`}{const s=[];for(const i of e)for(const e of t.get(i))s.push([e,i.getName(n)+r]);return `exports(${i(s,{lineBreakIndent:null})})`}}ps.prototype.preventChildBlockScope=!0;class xs extends _t{constructor(e){super("arguments",null,q,e);}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(){return !0}hasEffectsWhenCalledAtPath(){return !0}}class vs extends _t{constructor(e){super("this",null,null,e),this.deoptimizedPaths=[],this.entitiesToBeDeoptimized=new Set,this.thisDeoptimizationList=[],this.thisDeoptimizations=new j;}addEntityToBeDeoptimized(e){for(const t of this.deoptimizedPaths)e.deoptimizePath(t);for(const t of this.thisDeoptimizationList)this.applyThisDeoptimizationEvent(e,t);this.entitiesToBeDeoptimized.add(e);}deoptimizePath(e){if(0!==e.length&&!this.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(e,this)){this.deoptimizedPaths.push(e);for(const t of this.entitiesToBeDeoptimized)t.deoptimizePath(e);}}deoptimizeThisOnEventAtPath(e,t,s){const i={event:e,path:t,thisParameter:s};if(!this.thisDeoptimizations.trackEntityAtPathAndGetIfTracked(t,e,s)){for(const e of this.entitiesToBeDeoptimized)this.applyThisDeoptimizationEvent(e,i);this.thisDeoptimizationList.push(i);}}hasEffectsWhenAccessedAtPath(e,t){return this.getInit(t).hasEffectsWhenAccessedAtPath(e,t)||super.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return this.getInit(t).hasEffectsWhenAssignedAtPath(e,t)||super.hasEffectsWhenAssignedAtPath(e,t)}applyThisDeoptimizationEvent(e,{event:t,path:s,thisParameter:i}){e.deoptimizeThisOnEventAtPath(t,s,i===this?e:i,U);}getInit(e){return e.replacedVariableInits.get(this)||q}}class bs extends Lt{constructor(e,t){super(e,t),this.variables.set("arguments",this.argumentsVariable=new xs(t)),this.variables.set("this",this.thisVariable=new vs(t));}findLexicalBoundary(){return this}includeCallArguments(e,t){if(super.includeCallArguments(e,t),this.argumentsVariable.included)for(const s of t)s.included||s.include(e,!1);}}class Ss extends rt{constructor(){super(...arguments),this.deoptimizedReturn=!1,this.isPrototypeDeoptimized=!1;}createScope(e){this.scope=new bs(e,this.context);}deoptimizePath(e){1===e.length&&("prototype"===e[0]?this.isPrototypeDeoptimized=!0:e[0]===L&&(this.isPrototypeDeoptimized=!0,this.scope.getReturnExpression().deoptimizePath(B)));}deoptimizeThisOnEventAtPath(e,t,s){2===e&&(t.length>0?s.deoptimizePath(B):this.scope.thisVariable.addEntityToBeDeoptimized(s));}getReturnExpressionWhenCalledAtPath(e){return 0!==e.length?q:this.async?(this.deoptimizedReturn||(this.deoptimizedReturn=!0,this.scope.getReturnExpression().deoptimizePath(B),this.context.requestTreeshakingPass()),q):this.scope.getReturnExpression()}hasEffects(){return null!==this.id&&this.id.hasEffects()}hasEffectsWhenAccessedAtPath(e){return !(e.length<=1)&&(e.length>2||"prototype"!==e[0]||this.isPrototypeDeoptimized)}hasEffectsWhenAssignedAtPath(e){return !(e.length<=1)&&(e.length>2||"prototype"!==e[0]||this.isPrototypeDeoptimized)}hasEffectsWhenCalledAtPath(e,t,s){if(e.length>0)return !0;if(this.async){const{propertyReadSideEffects:e}=this.context.options.treeshake,t=this.scope.getReturnExpression();if(t.hasEffectsWhenCalledAtPath(["then"],{args:_e,thisParam:null,withNew:!1},s)||e&&("always"===e||t.hasEffectsWhenAccessedAtPath(["then"],s)))return !0}for(const e of this.params)if(e.hasEffects(s))return !0;const i=s.replacedVariableInits.get(this.scope.thisVariable);s.replacedVariableInits.set(this.scope.thisVariable,t.withNew?new pt(Object.create(null),gt):q);const{brokenFlow:n,ignore:r}=s;return s.ignore={breaks:!1,continues:!1,labels:new Set,returnYield:!0},!!this.body.hasEffects(s)||(s.brokenFlow=n,i?s.replacedVariableInits.set(this.scope.thisVariable,i):s.replacedVariableInits.delete(this.scope.thisVariable),s.ignore=r,!1)}include(e,t){this.included=!0,this.id&&this.id.include();const s=this.scope.argumentsVariable.included;for(const i of this.params)i instanceof cs&&!s||i.include(e,t);const{brokenFlow:i}=e;e.brokenFlow=0,this.body.include(e,t),e.brokenFlow=i;}includeCallArguments(e,t){this.scope.includeCallArguments(e,t);}initialise(){null!==this.id&&this.id.declare("function",this),this.scope.addParameterVariables(this.params.map((e=>e.declare("parameter",q))),this.params[this.params.length-1]instanceof ds),this.body.addImplicitReturnExpressionToScope();}parseNode(e){this.body=new Xt(e.body,this,this.scope.hoistedBodyVarScope),super.parseNode(e);}}Ss.prototype.preventChildBlockScope=!0;class _s extends rt{constructor(){super(...arguments),this.accessedValue=null,this.accessorCallOptions={args:_e,thisParam:null,withNew:!1};}deoptimizeCache(){}deoptimizePath(e){this.getAccessedValue().deoptimizePath(e);}deoptimizeThisOnEventAtPath(e,t,s,i){return 0===e&&"get"===this.kind&&0===t.length||1===e&&"set"===this.kind&&0===t.length?this.value.deoptimizeThisOnEventAtPath(2,V,s,i):void this.getAccessedValue().deoptimizeThisOnEventAtPath(e,t,s,i)}getLiteralValueAtPath(e,t,s){return this.getAccessedValue().getLiteralValueAtPath(e,t,s)}getReturnExpressionWhenCalledAtPath(e,t,s,i){return this.getAccessedValue().getReturnExpressionWhenCalledAtPath(e,t,s,i)}hasEffects(e){return this.key.hasEffects(e)}hasEffectsWhenAccessedAtPath(e,t){return "get"===this.kind&&0===e.length?this.value.hasEffectsWhenCalledAtPath(V,this.accessorCallOptions,t):this.getAccessedValue().hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return "set"===this.kind?this.value.hasEffectsWhenCalledAtPath(V,this.accessorCallOptions,t):this.getAccessedValue().hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,s){return this.getAccessedValue().hasEffectsWhenCalledAtPath(e,t,s)}getAccessedValue(){return null===this.accessedValue?"get"===this.kind?(this.accessedValue=q,this.accessedValue=this.value.getReturnExpressionWhenCalledAtPath(V,this.accessorCallOptions,U,this)):this.accessedValue=this.value:this.accessedValue}}class $s extends _s{}class Ts extends H{constructor(e,t){super(),this.object=e,this.key=t;}deoptimizePath(e){this.object.deoptimizePath([this.key,...e]);}deoptimizeThisOnEventAtPath(e,t,s,i){this.object.deoptimizeThisOnEventAtPath(e,[this.key,...t],s,i);}getLiteralValueAtPath(e,t,s){return this.object.getLiteralValueAtPath([this.key,...e],t,s)}getReturnExpressionWhenCalledAtPath(e,t,s,i){return this.object.getReturnExpressionWhenCalledAtPath([this.key,...e],t,s,i)}hasEffectsWhenAccessedAtPath(e,t){return 0!==e.length&&this.object.hasEffectsWhenAccessedAtPath([this.key,...e],t)}hasEffectsWhenAssignedAtPath(e,t){return this.object.hasEffectsWhenAssignedAtPath([this.key,...e],t)}hasEffectsWhenCalledAtPath(e,t,s){return this.object.hasEffectsWhenCalledAtPath([this.key,...e],t,s)}}class Rs extends rt{constructor(){super(...arguments),this.objectEntity=null;}createScope(e){this.scope=new Mt(e);}deoptimizeCache(){this.getObjectEntity().deoptimizeAllProperties();}deoptimizePath(e){this.getObjectEntity().deoptimizePath(e);}deoptimizeThisOnEventAtPath(e,t,s,i){this.getObjectEntity().deoptimizeThisOnEventAtPath(e,t,s,i);}getLiteralValueAtPath(e,t,s){return this.getObjectEntity().getLiteralValueAtPath(e,t,s)}getReturnExpressionWhenCalledAtPath(e,t,s,i){return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(e,t,s,i)}hasEffects(e){var t,s;const i=(null===(t=this.superClass)||void 0===t?void 0:t.hasEffects(e))||this.body.hasEffects(e);return null===(s=this.id)||void 0===s||s.markDeclarationReached(),i||super.hasEffects(e)}hasEffectsWhenAccessedAtPath(e,t){return this.getObjectEntity().hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return this.getObjectEntity().hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,s){return 0===e.length?!t.withNew||(null!==this.classConstructor?this.classConstructor.hasEffectsWhenCalledAtPath(V,t,s):null!==this.superClass&&this.superClass.hasEffectsWhenCalledAtPath(e,t,s)):this.getObjectEntity().hasEffectsWhenCalledAtPath(e,t,s)}include(e,t){var s;this.included=!0,null===(s=this.superClass)||void 0===s||s.include(e,t),this.body.include(e,t),this.id&&(this.id.markDeclarationReached(),this.id.include());}initialise(){var e;null===(e=this.id)||void 0===e||e.declare("class",this);for(const e of this.body.body)if(e instanceof $s&&"constructor"===e.kind)return void(this.classConstructor=e);this.classConstructor=null;}getObjectEntity(){if(null!==this.objectEntity)return this.objectEntity;const e=[],t=[];for(const s of this.body.body){const i=s.static?e:t,n=s.kind;if(i===t&&!n)continue;const r="set"===n||"get"===n?n:"init";let a;if(s.computed){const e=s.key.getLiteralValueAtPath(V,U,this);if(e===G){i.push({key:L,kind:r,property:s});continue}a=String(e);}else a=s.key instanceof cs?s.key.name:String(s.key.value);i.push({key:a,kind:r,property:s});}return e.unshift({key:"prototype",kind:"init",property:new pt(t,this.superClass?new Ts(this.superClass,"prototype"):gt)}),this.objectEntity=new pt(e,this.superClass||gt)}}class Ms extends Rs{initialise(){super.initialise(),null!==this.id&&(this.id.variable.isId=!0);}parseNode(e){null!==e.id&&(this.id=new cs(e.id,this,this.scope.parent)),super.parseNode(e);}render(e,t){const{exportNamesByVariable:s,format:i,snippets:{_:n}}=t;"system"===i&&this.id&&s.has(this.id.variable)&&e.appendLeft(this.end,`${n}${fs([this.id.variable],t)};`),super.render(e,t);}}class Ls extends rt{hasEffects(){return !1}initialise(){this.context.addExport(this);}render(e,t,s){e.remove(s.start,s.end);}}Ls.prototype.needsBoundaries=!0;class Os extends Ss{initialise(){super.initialise(),null!==this.id&&(this.id.variable.isId=!0);}parseNode(e){null!==e.id&&(this.id=new cs(e.id,this,this.scope.parent)),super.parseNode(e);}}class Vs extends rt{include(e,t){super.include(e,t),t&&this.context.includeVariableInModule(this.variable);}initialise(){const e=this.declaration;this.declarationName=e.id&&e.id.name||this.declaration.name,this.variable=this.scope.addExportDefaultDeclaration(this.declarationName||this.context.getModuleName(),this,this.context),this.context.addExport(this);}render(e,t,s){const{start:i,end:n}=s,r=function(e,t){return Wt(e,Ft(e,"default",t)+7)}(e.original,this.start);if(this.declaration instanceof Os)this.renderNamedDeclaration(e,r,"function","(",null===this.declaration.id,t);else if(this.declaration instanceof Ms)this.renderNamedDeclaration(e,r,"class","{",null===this.declaration.id,t);else {if(this.variable.getOriginalVariable()!==this.variable)return void Ot(this,e,i,n);if(!this.variable.included)return e.remove(this.start,r),this.declaration.render(e,t,{renderedSurroundingElement:"ExpressionStatement"}),void(";"!==e.original[this.end-1]&&e.appendLeft(this.end,";"));this.renderVariableDeclaration(e,r,t);}this.declaration.render(e,t);}renderNamedDeclaration(e,t,s,i,n,r){const{exportNamesByVariable:a,format:o,snippets:{getPropertyAccess:h}}=r,l=this.variable.getName(h);e.remove(this.start,t),n&&e.appendLeft(function(e,t,s,i){const n=Ft(e,t,i)+t.length;e=e.slice(n,Ft(e,s,n));const r=Ft(e,"*");return -1===r?n:n+r+1}(e.original,s,i,t),` ${l}`),"system"===o&&this.declaration instanceof Ms&&a.has(this.variable)&&e.appendLeft(this.end,` ${fs([this.variable],r)};`);}renderVariableDeclaration(e,t,{format:s,exportNamesByVariable:i,snippets:{cnst:n,getPropertyAccess:r}}){const a=59===e.original.charCodeAt(this.end-1),o="system"===s&&i.get(this.variable);o?(e.overwrite(this.start,t,`${n} ${this.variable.getName(r)} = exports('${o[0]}', `),e.appendRight(a?this.end-1:this.end,")"+(a?"":";"))):(e.overwrite(this.start,t,`${n} ${this.variable.getName(r)} = `),a||e.appendLeft(this.end,";"));}}Vs.prototype.needsBoundaries=!0;class Bs extends rt{bind(){null!==this.declaration&&this.declaration.bind();}hasEffects(e){return null!==this.declaration&&this.declaration.hasEffects(e)}initialise(){this.context.addExport(this);}render(e,t,s){const{start:i,end:n}=s;null===this.declaration?e.remove(i,n):(e.remove(this.start,this.declaration.start),this.declaration.render(e,t,{end:n,start:i}));}}Bs.prototype.needsBoundaries=!0;class Us extends rt{bind(){}hasEffects(){return !1}initialise(){this.context.addImport(this);}render(e,t,s){e.remove(s.start,s.end);}}Us.prototype.needsBoundaries=!0;function hi(e){return e([["value","'Module'"]],{lineBreakIndent:null})}class Si extends rt{hasEffects(e){if(this.test&&this.test.hasEffects(e))return !0;for(const t of this.consequent){if(e.brokenFlow)break;if(t.hasEffects(e))return !0}return !1}include(e,t){this.included=!0,this.test&&this.test.include(e,t);for(const s of this.consequent)(t||s.shouldBeIncluded(e))&&s.include(e,t);}render(e,t,s){if(this.consequent.length){this.test&&this.test.render(e,t);const i=this.test?this.test.end:Ft(e.original,"default",this.start)+7,n=Ft(e.original,":",i)+1;jt(this.consequent,e,n,s.end,t);}else super.render(e,t);}}Si.prototype.needsBoundaries=!0;class Ti extends K{constructor(e){super(e.getModuleName()),this.memberVariables=null,this.mergedNamespaces=[],this.referencedEarly=!1,this.references=[],this.context=e,this.module=e.module;}addReference(e){this.references.push(e),this.name=e.name;}getMemberVariables(){if(this.memberVariables)return this.memberVariables;const e=Object.create(null);for(const t of this.context.getExports().concat(this.context.getReexports()))if("*"!==t[0]&&t!==this.module.info.syntheticNamedExports){const s=this.context.traceExport(t);s&&(e[t]=s);}return this.memberVariables=e}include(){this.included=!0,this.context.includeAllExports();}prepare(e){this.mergedNamespaces.length>0&&this.module.scope.addAccessedGlobals(["_mergeNamespaces"],e);}renderBlock(e){const{exportNamesByVariable:t,format:s,freeze:i,indent:n,namespaceToStringTag:r,snippets:{_:a,cnst:o,getObject:h,getPropertyAccess:l,n:c,s:u}}=e,d=this.getMemberVariables(),p=Object.entries(d).map((([e,t])=>this.referencedEarly||t.isReassigned?[null,`get ${e}${a}()${a}{${a}return ${t.getName(l)}${u}${a}}`]:[e,t.getName(l)]));p.unshift([null,`__proto__:${a}null`]);let f=h(p,{lineBreakIndent:{base:"",t:n}});if(this.mergedNamespaces.length>0){const e=this.mergedNamespaces.map((e=>e.getName(l)));f=`/*#__PURE__*/_mergeNamespaces(${f},${a}[${e.join(`,${a}`)}])`;}else r&&(f=`/*#__PURE__*/Object.defineProperty(${f},${a}Symbol.toStringTag,${a}${hi(h)})`),i&&(f=`/*#__PURE__*/Object.freeze(${f})`);return f=`${o} ${this.getName(l)}${a}=${a}${f};`,"system"===s&&t.has(this)&&(f+=`${c}${fs([this],e)};`),f}renderFirst(){return this.referencedEarly}setMergedNamespaces(e){this.mergedNamespaces=e;const t=this.context.getModuleExecIndex();for(const e of this.references)if(e.context.getModuleExecIndex()<=t){this.referencedEarly=!0;break}}}Ti.prototype.isNamespace=!0;var Mi;!function(e){e[e.LOAD_AND_PARSE=0]="LOAD_AND_PARSE",e[e.ANALYSE=1]="ANALYSE",e[e.GENERATE=2]="GENERATE";}(Mi||(Mi={}));var Cn={},In=Nn;function Nn(e,t){if(!e)throw new Error(t||"Assertion failed")}Nn.equal=function(e,t,s){if(e!=t)throw new Error(s||"Assertion failed: "+e+" != "+t)};var _n={exports:{}};"function"==typeof Object.create?_n.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}));}:_n.exports=function(e,t){if(t){e.super_=t;var s=function(){};s.prototype=t.prototype,e.prototype=new s,e.prototype.constructor=e;}};var $n=In,Tn=_n.exports;function Rn(e,t){return 55296==(64512&e.charCodeAt(t))&&(!(t<0||t+1>=e.length)&&56320==(64512&e.charCodeAt(t+1)))}function Mn(e){return (e>>>24|e>>>8&65280|e<<8&16711680|(255&e)<<24)>>>0}function Dn(e){return 1===e.length?"0"+e:e}function Ln(e){return 7===e.length?"0"+e:6===e.length?"00"+e:5===e.length?"000"+e:4===e.length?"0000"+e:3===e.length?"00000"+e:2===e.length?"000000"+e:1===e.length?"0000000"+e:e}Cn.inherits=Tn,Cn.toArray=function(e,t){if(Array.isArray(e))return e.slice();if(!e)return [];var s=[];if("string"==typeof e)if(t){if("hex"===t)for((e=e.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(e="0"+e),n=0;n<e.length;n+=2)s.push(parseInt(e[n]+e[n+1],16));}else for(var i=0,n=0;n<e.length;n++){var r=e.charCodeAt(n);r<128?s[i++]=r:r<2048?(s[i++]=r>>6|192,s[i++]=63&r|128):Rn(e,n)?(r=65536+((1023&r)<<10)+(1023&e.charCodeAt(++n)),s[i++]=r>>18|240,s[i++]=r>>12&63|128,s[i++]=r>>6&63|128,s[i++]=63&r|128):(s[i++]=r>>12|224,s[i++]=r>>6&63|128,s[i++]=63&r|128);}else for(n=0;n<e.length;n++)s[n]=0|e[n];return s},Cn.toHex=function(e){for(var t="",s=0;s<e.length;s++)t+=Dn(e[s].toString(16));return t},Cn.htonl=Mn,Cn.toHex32=function(e,t){for(var s="",i=0;i<e.length;i++){var n=e[i];"little"===t&&(n=Mn(n)),s+=Ln(n.toString(16));}return s},Cn.zero2=Dn,Cn.zero8=Ln,Cn.join32=function(e,t,s,i){var n=s-t;$n(n%4==0);for(var r=new Array(n/4),a=0,o=t;a<r.length;a++,o+=4){var h;h="big"===i?e[o]<<24|e[o+1]<<16|e[o+2]<<8|e[o+3]:e[o+3]<<24|e[o+2]<<16|e[o+1]<<8|e[o],r[a]=h>>>0;}return r},Cn.split32=function(e,t){for(var s=new Array(4*e.length),i=0,n=0;i<e.length;i++,n+=4){var r=e[i];"big"===t?(s[n]=r>>>24,s[n+1]=r>>>16&255,s[n+2]=r>>>8&255,s[n+3]=255&r):(s[n+3]=r>>>24,s[n+2]=r>>>16&255,s[n+1]=r>>>8&255,s[n]=255&r);}return s},Cn.rotr32=function(e,t){return e>>>t|e<<32-t},Cn.rotl32=function(e,t){return e<<t|e>>>32-t},Cn.sum32=function(e,t){return e+t>>>0},Cn.sum32_3=function(e,t,s){return e+t+s>>>0},Cn.sum32_4=function(e,t,s,i){return e+t+s+i>>>0},Cn.sum32_5=function(e,t,s,i,n){return e+t+s+i+n>>>0},Cn.sum64=function(e,t,s,i){var n=e[t],r=i+e[t+1]>>>0,a=(r<i?1:0)+s+n;e[t]=a>>>0,e[t+1]=r;},Cn.sum64_hi=function(e,t,s,i){return (t+i>>>0<t?1:0)+e+s>>>0},Cn.sum64_lo=function(e,t,s,i){return t+i>>>0},Cn.sum64_4_hi=function(e,t,s,i,n,r,a,o){var h=0,l=t;return h+=(l=l+i>>>0)<t?1:0,h+=(l=l+r>>>0)<r?1:0,e+s+n+a+(h+=(l=l+o>>>0)<o?1:0)>>>0},Cn.sum64_4_lo=function(e,t,s,i,n,r,a,o){return t+i+r+o>>>0},Cn.sum64_5_hi=function(e,t,s,i,n,r,a,o,h,l){var c=0,u=t;return c+=(u=u+i>>>0)<t?1:0,c+=(u=u+r>>>0)<r?1:0,c+=(u=u+o>>>0)<o?1:0,e+s+n+a+h+(c+=(u=u+l>>>0)<l?1:0)>>>0},Cn.sum64_5_lo=function(e,t,s,i,n,r,a,o,h,l){return t+i+r+o+l>>>0},Cn.rotr64_hi=function(e,t,s){return (t<<32-s|e>>>s)>>>0},Cn.rotr64_lo=function(e,t,s){return (e<<32-s|t>>>s)>>>0},Cn.shr64_hi=function(e,t,s){return e>>>s},Cn.shr64_lo=function(e,t,s){return (e<<32-s|t>>>s)>>>0};var On={},Vn=Cn,Bn=In;function Fn(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32;}On.BlockHash=Fn,Fn.prototype.update=function(e,t){if(e=Vn.toArray(e,t),this.pending?this.pending=this.pending.concat(e):this.pending=e,this.pendingTotal+=e.length,this.pending.length>=this._delta8){var s=(e=this.pending).length%this._delta8;this.pending=e.slice(e.length-s,e.length),0===this.pending.length&&(this.pending=null),e=Vn.join32(e,0,e.length-s,this.endian);for(var i=0;i<e.length;i+=this._delta32)this._update(e,i,i+this._delta32);}return this},Fn.prototype.digest=function(e){return this.update(this._pad()),Bn(null===this.pending),this._digest(e)},Fn.prototype._pad=function(){var e=this.pendingTotal,t=this._delta8,s=t-(e+this.padLength)%t,i=new Array(s+this.padLength);i[0]=128;for(var n=1;n<s;n++)i[n]=0;if(e<<=3,"big"===this.endian){for(var r=8;r<this.padLength;r++)i[n++]=0;i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=e>>>24&255,i[n++]=e>>>16&255,i[n++]=e>>>8&255,i[n++]=255&e;}else for(i[n++]=255&e,i[n++]=e>>>8&255,i[n++]=e>>>16&255,i[n++]=e>>>24&255,i[n++]=0,i[n++]=0,i[n++]=0,i[n++]=0,r=8;r<this.padLength;r++)i[n++]=0;return i};var zn={},Wn=Cn.rotr32;function Un(e,t,s){return e&t^~e&s}function jn(e,t,s){return e&t^e&s^t&s}function Gn(e,t,s){return e^t^s}zn.ft_1=function(e,t,s,i){return 0===e?Un(t,s,i):1===e||3===e?Gn(t,s,i):2===e?jn(t,s,i):void 0},zn.ch32=Un,zn.maj32=jn,zn.p32=Gn,zn.s0_256=function(e){return Wn(e,2)^Wn(e,13)^Wn(e,22)},zn.s1_256=function(e){return Wn(e,6)^Wn(e,11)^Wn(e,25)},zn.g0_256=function(e){return Wn(e,7)^Wn(e,18)^e>>>3},zn.g1_256=function(e){return Wn(e,17)^Wn(e,19)^e>>>10};var Hn=Cn,qn=On,Kn=zn,Xn=In,Yn=Hn.sum32,Qn=Hn.sum32_4,Zn=Hn.sum32_5,Jn=Kn.ch32,er=Kn.maj32,tr=Kn.s0_256,sr=Kn.s1_256,ir=Kn.g0_256,nr=Kn.g1_256,rr=qn.BlockHash,ar=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function or(){if(!(this instanceof or))return new or;rr.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=ar,this.W=new Array(64);}Hn.inherits(or,rr);or.blockSize=512,or.outSize=256,or.hmacStrength=192,or.padLength=64,or.prototype._update=function(e,t){for(var s=this.W,i=0;i<16;i++)s[i]=e[t+i];for(;i<s.length;i++)s[i]=Qn(nr(s[i-2]),s[i-7],ir(s[i-15]),s[i-16]);var n=this.h[0],r=this.h[1],a=this.h[2],o=this.h[3],h=this.h[4],l=this.h[5],c=this.h[6],u=this.h[7];for(Xn(this.k.length===s.length),i=0;i<s.length;i++){var d=Zn(u,sr(h),Jn(h,l,c),this.k[i],s[i]),p=Yn(tr(n),er(n,r,a));u=c,c=l,l=h,h=Yn(o,d),o=a,a=r,r=n,n=Yn(d,p);}this.h[0]=Yn(this.h[0],n),this.h[1]=Yn(this.h[1],r),this.h[2]=Yn(this.h[2],a),this.h[3]=Yn(this.h[3],o),this.h[4]=Yn(this.h[4],h),this.h[5]=Yn(this.h[5],l),this.h[6]=Yn(this.h[6],c),this.h[7]=Yn(this.h[7],u);},or.prototype._digest=function(e){return "hex"===e?Hn.toHex32(this.h,"big"):Hn.split32(this.h,"big")};var Kr={3:"abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",5:"class enum extends super const export import",6:"enum",strict:"implements interface let package private protected public static yield",strictBind:"eval arguments"},Xr="break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",Yr={5:Xr,"5module":Xr+" export import",6:Xr+" const class extends export import super"},Qr=/^in(stanceof)?$/,Zr="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-ࢎࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೝೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꟊꟐꟑꟓꟕ-ꟙꟲ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",Jr="‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛࢘-࢟࣊-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄ఼ా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜕ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠏-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿ-ᫎᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿",ea=new RegExp("["+Zr+"]"),ta=new RegExp("["+Zr+Jr+"]");Zr=Jr=null;var sa=[0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,13,10,2,14,2,6,2,1,2,10,2,14,2,6,2,1,68,310,10,21,11,7,25,5,2,41,2,8,70,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,349,41,7,1,79,28,11,0,9,21,43,17,47,20,28,22,13,52,58,1,3,0,14,44,33,24,27,35,30,0,3,0,9,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,21,2,31,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,14,0,72,26,38,6,186,43,117,63,32,7,3,0,3,7,2,1,2,23,16,0,2,0,95,7,3,38,17,0,2,0,29,0,11,39,8,0,22,0,12,45,20,0,19,72,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,190,0,80,921,103,110,18,195,2637,96,16,1070,4050,582,8634,568,8,30,18,78,18,29,19,47,17,3,32,20,6,18,689,63,129,74,6,0,67,12,65,1,2,0,29,6135,9,1237,43,8,8936,3,2,6,2,1,2,290,46,2,18,3,9,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,1845,30,482,44,11,6,17,0,322,29,19,43,1269,6,2,3,2,1,2,14,2,196,60,67,8,0,1205,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42719,33,4152,8,221,3,5761,15,7472,3104,541,1507,4938],ia=[509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,370,1,154,10,50,3,123,2,54,14,32,10,3,1,11,3,46,10,8,0,46,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,2,11,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,71,5,2,1,3,3,2,0,2,1,13,9,120,6,3,6,4,0,29,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,87,9,39,4,60,6,26,9,1014,0,2,54,8,3,82,0,12,1,19628,1,4706,45,3,22,543,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,262,6,10,9,357,0,62,13,1495,6,110,6,6,9,4759,9,787719,239];function na(e,t){for(var s=65536,i=0;i<t.length;i+=2){if((s+=t[i])>e)return !1;if((s+=t[i+1])>=e)return !0}}function ra(e,t){return e<65?36===e:e<91||(e<97?95===e:e<123||(e<=65535?e>=170&&ea.test(String.fromCharCode(e)):!1!==t&&na(e,sa)))}function aa(e,t){return e<48?36===e:e<58||!(e<65)&&(e<91||(e<97?95===e:e<123||(e<=65535?e>=170&&ta.test(String.fromCharCode(e)):!1!==t&&(na(e,sa)||na(e,ia)))))}var oa=function(e,t){void 0===t&&(t={}),this.label=e,this.keyword=t.keyword,this.beforeExpr=!!t.beforeExpr,this.startsExpr=!!t.startsExpr,this.isLoop=!!t.isLoop,this.isAssign=!!t.isAssign,this.prefix=!!t.prefix,this.postfix=!!t.postfix,this.binop=t.binop||null,this.updateContext=null;};function ha(e,t){return new oa(e,{beforeExpr:!0,binop:t})}var la={beforeExpr:!0},ca={startsExpr:!0},ua={};function da(e,t){return void 0===t&&(t={}),t.keyword=e,ua[e]=new oa(e,t)}var pa={num:new oa("num",ca),regexp:new oa("regexp",ca),string:new oa("string",ca),name:new oa("name",ca),privateId:new oa("privateId",ca),eof:new oa("eof"),bracketL:new oa("[",{beforeExpr:!0,startsExpr:!0}),bracketR:new oa("]"),braceL:new oa("{",{beforeExpr:!0,startsExpr:!0}),braceR:new oa("}"),parenL:new oa("(",{beforeExpr:!0,startsExpr:!0}),parenR:new oa(")"),comma:new oa(",",la),semi:new oa(";",la),colon:new oa(":",la),dot:new oa("."),question:new oa("?",la),questionDot:new oa("?."),arrow:new oa("=>",la),template:new oa("template"),invalidTemplate:new oa("invalidTemplate"),ellipsis:new oa("...",la),backQuote:new oa("`",ca),dollarBraceL:new oa("${",{beforeExpr:!0,startsExpr:!0}),eq:new oa("=",{beforeExpr:!0,isAssign:!0}),assign:new oa("_=",{beforeExpr:!0,isAssign:!0}),incDec:new oa("++/--",{prefix:!0,postfix:!0,startsExpr:!0}),prefix:new oa("!/~",{beforeExpr:!0,prefix:!0,startsExpr:!0}),logicalOR:ha("||",1),logicalAND:ha("&&",2),bitwiseOR:ha("|",3),bitwiseXOR:ha("^",4),bitwiseAND:ha("&",5),equality:ha("==/!=/===/!==",6),relational:ha("</>/<=/>=",7),bitShift:ha("<</>>/>>>",8),plusMin:new oa("+/-",{beforeExpr:!0,binop:9,prefix:!0,startsExpr:!0}),modulo:ha("%",10),star:ha("*",10),slash:ha("/",10),starstar:new oa("**",{beforeExpr:!0}),coalesce:ha("??",1),_break:da("break"),_case:da("case",la),_catch:da("catch"),_continue:da("continue"),_debugger:da("debugger"),_default:da("default",la),_do:da("do",{isLoop:!0,beforeExpr:!0}),_else:da("else",la),_finally:da("finally"),_for:da("for",{isLoop:!0}),_function:da("function",ca),_if:da("if"),_return:da("return",la),_switch:da("switch"),_throw:da("throw",la),_try:da("try"),_var:da("var"),_const:da("const"),_while:da("while",{isLoop:!0}),_with:da("with"),_new:da("new",{beforeExpr:!0,startsExpr:!0}),_this:da("this",ca),_super:da("super",ca),_class:da("class",ca),_extends:da("extends",la),_export:da("export"),_import:da("import",ca),_null:da("null",ca),_true:da("true",ca),_false:da("false",ca),_in:da("in",{beforeExpr:!0,binop:7}),_instanceof:da("instanceof",{beforeExpr:!0,binop:7}),_typeof:da("typeof",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_void:da("void",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_delete:da("delete",{beforeExpr:!0,prefix:!0,startsExpr:!0})},fa=/\r\n?|\n|\u2028|\u2029/,ma=new RegExp(fa.source,"g");function ga(e){return 10===e||13===e||8232===e||8233===e}function ya(e,t,s){void 0===s&&(s=e.length);for(var i=t;i<s;i++){var n=e.charCodeAt(i);if(ga(n))return i<s-1&&13===n&&10===e.charCodeAt(i+1)?i+2:i+1}return -1}var Ea=/[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/,xa=/(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,va=Object.prototype,ba=va.hasOwnProperty,Sa=va.toString,Aa=Object.hasOwn||function(e,t){return ba.call(e,t)},Pa=Array.isArray||function(e){return "[object Array]"===Sa.call(e)};function ka(e){return new RegExp("^(?:"+e.replace(/ /g,"|")+")$")}var wa=/(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/,Ca=function(e,t){this.line=e,this.column=t;};Ca.prototype.offset=function(e){return new Ca(this.line,this.column+e)};var Ia=function(e,t,s){this.start=t,this.end=s,null!==e.sourceFile&&(this.source=e.sourceFile);};function Na(e,t){for(var s=1,i=0;;){var n=ya(e,i,t);if(n<0)return new Ca(s,t-i);++s,i=n;}}var _a={ecmaVersion:null,sourceType:"script",onInsertedSemicolon:null,onTrailingComma:null,allowReserved:null,allowReturnOutsideFunction:!1,allowImportExportEverywhere:!1,allowAwaitOutsideFunction:null,allowSuperOutsideMethod:null,allowHashBang:!1,locations:!1,onToken:null,onComment:null,ranges:!1,program:null,sourceFile:null,directSourceFile:null,preserveParens:!1},$a=!1;function Ta(e){var t={};for(var s in _a)t[s]=e&&Aa(e,s)?e[s]:_a[s];if("latest"===t.ecmaVersion?t.ecmaVersion=1e8:null==t.ecmaVersion?(!$a&&"object"==typeof console&&console.warn&&($a=!0,console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.")),t.ecmaVersion=11):t.ecmaVersion>=2015&&(t.ecmaVersion-=2009),null==t.allowReserved&&(t.allowReserved=t.ecmaVersion<5),Pa(t.onToken)){var i=t.onToken;t.onToken=function(e){return i.push(e)};}return Pa(t.onComment)&&(t.onComment=function(e,t){return function(s,i,n,r,a,o){var h={type:s?"Block":"Line",value:i,start:n,end:r};e.locations&&(h.loc=new Ia(this,a,o)),e.ranges&&(h.range=[n,r]),t.push(h);}}(t,t.onComment)),t}function Ra(e,t){return 2|(e?4:0)|(t?8:0)}var Ma=function(e,t,s){this.options=e=Ta(e),this.sourceFile=e.sourceFile,this.keywords=ka(Yr[e.ecmaVersion>=6?6:"module"===e.sourceType?"5module":5]);var i="";!0!==e.allowReserved&&(i=Kr[e.ecmaVersion>=6?6:5===e.ecmaVersion?5:3],"module"===e.sourceType&&(i+=" await")),this.reservedWords=ka(i);var n=(i?i+" ":"")+Kr.strict;this.reservedWordsStrict=ka(n),this.reservedWordsStrictBind=ka(n+" "+Kr.strictBind),this.input=String(t),this.containsEsc=!1,s?(this.pos=s,this.lineStart=this.input.lastIndexOf("\n",s-1)+1,this.curLine=this.input.slice(0,this.lineStart).split(fa).length):(this.pos=this.lineStart=0,this.curLine=1),this.type=pa.eof,this.value=null,this.start=this.end=this.pos,this.startLoc=this.endLoc=this.curPosition(),this.lastTokEndLoc=this.lastTokStartLoc=null,this.lastTokStart=this.lastTokEnd=this.pos,this.context=this.initialContext(),this.exprAllowed=!0,this.inModule="module"===e.sourceType,this.strict=this.inModule||this.strictDirective(this.pos),this.potentialArrowAt=-1,this.potentialArrowInForAwait=!1,this.yieldPos=this.awaitPos=this.awaitIdentPos=0,this.labels=[],this.undefinedExports=Object.create(null),0===this.pos&&e.allowHashBang&&"#!"===this.input.slice(0,2)&&this.skipLineComment(2),this.scopeStack=[],this.enterScope(1),this.regexpState=null,this.privateNameStack=[];},Da={inFunction:{configurable:!0},inGenerator:{configurable:!0},inAsync:{configurable:!0},canAwait:{configurable:!0},allowSuper:{configurable:!0},allowDirectSuper:{configurable:!0},treatFunctionsAsVar:{configurable:!0},allowNewDotTarget:{configurable:!0},inClassStaticBlock:{configurable:!0}};Ma.prototype.parse=function(){var e=this.options.program||this.startNode();return this.nextToken(),this.parseTopLevel(e)},Da.inFunction.get=function(){return (2&this.currentVarScope().flags)>0},Da.inGenerator.get=function(){return (8&this.currentVarScope().flags)>0&&!this.currentVarScope().inClassFieldInit},Da.inAsync.get=function(){return (4&this.currentVarScope().flags)>0&&!this.currentVarScope().inClassFieldInit},Da.canAwait.get=function(){for(var e=this.scopeStack.length-1;e>=0;e--){var t=this.scopeStack[e];if(t.inClassFieldInit||256&t.flags)return !1;if(2&t.flags)return (4&t.flags)>0}return this.inModule&&this.options.ecmaVersion>=13||this.options.allowAwaitOutsideFunction},Da.allowSuper.get=function(){var e=this.currentThisScope(),t=e.flags,s=e.inClassFieldInit;return (64&t)>0||s||this.options.allowSuperOutsideMethod},Da.allowDirectSuper.get=function(){return (128&this.currentThisScope().flags)>0},Da.treatFunctionsAsVar.get=function(){return this.treatFunctionsAsVarInScope(this.currentScope())},Da.allowNewDotTarget.get=function(){var e=this.currentThisScope(),t=e.flags,s=e.inClassFieldInit;return (258&t)>0||s},Da.inClassStaticBlock.get=function(){return (256&this.currentVarScope().flags)>0},Ma.extend=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var s=this,i=0;i<e.length;i++)s=e[i](s);return s},Ma.parse=function(e,t){return new this(t,e).parse()},Ma.parseExpressionAt=function(e,t,s){var i=new this(s,e,t);return i.nextToken(),i.parseExpression()},Ma.tokenizer=function(e,t){return new this(t,e)},Object.defineProperties(Ma.prototype,Da);var La=Ma.prototype,Oa=/^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;function Va(){this.shorthandAssign=this.trailingComma=this.parenthesizedAssign=this.parenthesizedBind=this.doubleProto=-1;}La.strictDirective=function(e){for(;;){xa.lastIndex=e,e+=xa.exec(this.input)[0].length;var t=Oa.exec(this.input.slice(e));if(!t)return !1;if("use strict"===(t[1]||t[2])){xa.lastIndex=e+t[0].length;var s=xa.exec(this.input),i=s.index+s[0].length,n=this.input.charAt(i);return ";"===n||"}"===n||fa.test(s[0])&&!(/[(`.[+\-/*%<>=,?^&]/.test(n)||"!"===n&&"="===this.input.charAt(i+1))}e+=t[0].length,xa.lastIndex=e,e+=xa.exec(this.input)[0].length,";"===this.input[e]&&e++;}},La.eat=function(e){return this.type===e&&(this.next(),!0)},La.isContextual=function(e){return this.type===pa.name&&this.value===e&&!this.containsEsc},La.eatContextual=function(e){return !!this.isContextual(e)&&(this.next(),!0)},La.expectContextual=function(e){this.eatContextual(e)||this.unexpected();},La.canInsertSemicolon=function(){return this.type===pa.eof||this.type===pa.braceR||fa.test(this.input.slice(this.lastTokEnd,this.start))},La.insertSemicolon=function(){if(this.canInsertSemicolon())return this.options.onInsertedSemicolon&&this.options.onInsertedSemicolon(this.lastTokEnd,this.lastTokEndLoc),!0},La.semicolon=function(){this.eat(pa.semi)||this.insertSemicolon()||this.unexpected();},La.afterTrailingComma=function(e,t){if(this.type===e)return this.options.onTrailingComma&&this.options.onTrailingComma(this.lastTokStart,this.lastTokStartLoc),t||this.next(),!0},La.expect=function(e){this.eat(e)||this.unexpected();},La.unexpected=function(e){this.raise(null!=e?e:this.start,"Unexpected token");},La.checkPatternErrors=function(e,t){if(e){e.trailingComma>-1&&this.raiseRecoverable(e.trailingComma,"Comma is not permitted after the rest element");var s=t?e.parenthesizedAssign:e.parenthesizedBind;s>-1&&this.raiseRecoverable(s,"Parenthesized pattern");}},La.checkExpressionErrors=function(e,t){if(!e)return !1;var s=e.shorthandAssign,i=e.doubleProto;if(!t)return s>=0||i>=0;s>=0&&this.raise(s,"Shorthand property assignments are valid only in destructuring patterns"),i>=0&&this.raiseRecoverable(i,"Redefinition of __proto__ property");},La.checkYieldAwaitInDefaultParams=function(){this.yieldPos&&(!this.awaitPos||this.yieldPos<this.awaitPos)&&this.raise(this.yieldPos,"Yield expression cannot be a default value"),this.awaitPos&&this.raise(this.awaitPos,"Await expression cannot be a default value");},La.isSimpleAssignTarget=function(e){return "ParenthesizedExpression"===e.type?this.isSimpleAssignTarget(e.expression):"Identifier"===e.type||"MemberExpression"===e.type};var Ba=Ma.prototype;Ba.parseTopLevel=function(e){var t=Object.create(null);for(e.body||(e.body=[]);this.type!==pa.eof;){var s=this.parseStatement(null,!0,t);e.body.push(s);}if(this.inModule)for(var i=0,n=Object.keys(this.undefinedExports);i<n.length;i+=1){var r=n[i];this.raiseRecoverable(this.undefinedExports[r].start,"Export '"+r+"' is not defined");}return this.adaptDirectivePrologue(e.body),this.next(),e.sourceType=this.options.sourceType,this.finishNode(e,"Program")};var Fa={kind:"loop"},za={kind:"switch"};Ba.isLet=function(e){if(this.options.ecmaVersion<6||!this.isContextual("let"))return !1;xa.lastIndex=this.pos;var t=xa.exec(this.input),s=this.pos+t[0].length,i=this.input.charCodeAt(s);if(91===i||92===i||i>55295&&i<56320)return !0;if(e)return !1;if(123===i)return !0;if(ra(i,!0)){for(var n=s+1;aa(i=this.input.charCodeAt(n),!0);)++n;if(92===i||i>55295&&i<56320)return !0;var r=this.input.slice(s,n);if(!Qr.test(r))return !0}return !1},Ba.isAsyncFunction=function(){if(this.options.ecmaVersion<8||!this.isContextual("async"))return !1;xa.lastIndex=this.pos;var e,t=xa.exec(this.input),s=this.pos+t[0].length;return !(fa.test(this.input.slice(this.pos,s))||"function"!==this.input.slice(s,s+8)||s+8!==this.input.length&&(aa(e=this.input.charCodeAt(s+8))||e>55295&&e<56320))},Ba.parseStatement=function(e,t,s){var i,n=this.type,r=this.startNode();switch(this.isLet(e)&&(n=pa._var,i="let"),n){case pa._break:case pa._continue:return this.parseBreakContinueStatement(r,n.keyword);case pa._debugger:return this.parseDebuggerStatement(r);case pa._do:return this.parseDoStatement(r);case pa._for:return this.parseForStatement(r);case pa._function:return e&&(this.strict||"if"!==e&&"label"!==e)&&this.options.ecmaVersion>=6&&this.unexpected(),this.parseFunctionStatement(r,!1,!e);case pa._class:return e&&this.unexpected(),this.parseClass(r,!0);case pa._if:return this.parseIfStatement(r);case pa._return:return this.parseReturnStatement(r);case pa._switch:return this.parseSwitchStatement(r);case pa._throw:return this.parseThrowStatement(r);case pa._try:return this.parseTryStatement(r);case pa._const:case pa._var:return i=i||this.value,e&&"var"!==i&&this.unexpected(),this.parseVarStatement(r,i);case pa._while:return this.parseWhileStatement(r);case pa._with:return this.parseWithStatement(r);case pa.braceL:return this.parseBlock(!0,r);case pa.semi:return this.parseEmptyStatement(r);case pa._export:case pa._import:if(this.options.ecmaVersion>10&&n===pa._import){xa.lastIndex=this.pos;var a=xa.exec(this.input),o=this.pos+a[0].length,h=this.input.charCodeAt(o);if(40===h||46===h)return this.parseExpressionStatement(r,this.parseExpression())}return this.options.allowImportExportEverywhere||(t||this.raise(this.start,"'import' and 'export' may only appear at the top level"),this.inModule||this.raise(this.start,"'import' and 'export' may appear only with 'sourceType: module'")),n===pa._import?this.parseImport(r):this.parseExport(r,s);default:if(this.isAsyncFunction())return e&&this.unexpected(),this.next(),this.parseFunctionStatement(r,!0,!e);var l=this.value,c=this.parseExpression();return n===pa.name&&"Identifier"===c.type&&this.eat(pa.colon)?this.parseLabeledStatement(r,l,c,e):this.parseExpressionStatement(r,c)}},Ba.parseBreakContinueStatement=function(e,t){var s="break"===t;this.next(),this.eat(pa.semi)||this.insertSemicolon()?e.label=null:this.type!==pa.name?this.unexpected():(e.label=this.parseIdent(),this.semicolon());for(var i=0;i<this.labels.length;++i){var n=this.labels[i];if(null==e.label||n.name===e.label.name){if(null!=n.kind&&(s||"loop"===n.kind))break;if(e.label&&s)break}}return i===this.labels.length&&this.raise(e.start,"Unsyntactic "+t),this.finishNode(e,s?"BreakStatement":"ContinueStatement")},Ba.parseDebuggerStatement=function(e){return this.next(),this.semicolon(),this.finishNode(e,"DebuggerStatement")},Ba.parseDoStatement=function(e){return this.next(),this.labels.push(Fa),e.body=this.parseStatement("do"),this.labels.pop(),this.expect(pa._while),e.test=this.parseParenExpression(),this.options.ecmaVersion>=6?this.eat(pa.semi):this.semicolon(),this.finishNode(e,"DoWhileStatement")},Ba.parseForStatement=function(e){this.next();var t=this.options.ecmaVersion>=9&&this.canAwait&&this.eatContextual("await")?this.lastTokStart:-1;if(this.labels.push(Fa),this.enterScope(0),this.expect(pa.parenL),this.type===pa.semi)return t>-1&&this.unexpected(t),this.parseFor(e,null);var s=this.isLet();if(this.type===pa._var||this.type===pa._const||s){var i=this.startNode(),n=s?"let":this.value;return this.next(),this.parseVar(i,!0,n),this.finishNode(i,"VariableDeclaration"),(this.type===pa._in||this.options.ecmaVersion>=6&&this.isContextual("of"))&&1===i.declarations.length?(this.options.ecmaVersion>=9&&(this.type===pa._in?t>-1&&this.unexpected(t):e.await=t>-1),this.parseForIn(e,i)):(t>-1&&this.unexpected(t),this.parseFor(e,i))}var r=this.isContextual("let"),a=!1,o=new Va,h=this.parseExpression(!(t>-1)||"await",o);return this.type===pa._in||(a=this.options.ecmaVersion>=6&&this.isContextual("of"))?(this.options.ecmaVersion>=9&&(this.type===pa._in?t>-1&&this.unexpected(t):e.await=t>-1),r&&a&&this.raise(h.start,"The left-hand side of a for-of loop may not start with 'let'."),this.toAssignable(h,!1,o),this.checkLValPattern(h),this.parseForIn(e,h)):(this.checkExpressionErrors(o,!0),t>-1&&this.unexpected(t),this.parseFor(e,h))},Ba.parseFunctionStatement=function(e,t,s){return this.next(),this.parseFunction(e,Ua|(s?0:ja),!1,t)},Ba.parseIfStatement=function(e){return this.next(),e.test=this.parseParenExpression(),e.consequent=this.parseStatement("if"),e.alternate=this.eat(pa._else)?this.parseStatement("if"):null,this.finishNode(e,"IfStatement")},Ba.parseReturnStatement=function(e){return this.inFunction||this.options.allowReturnOutsideFunction||this.raise(this.start,"'return' outside of function"),this.next(),this.eat(pa.semi)||this.insertSemicolon()?e.argument=null:(e.argument=this.parseExpression(),this.semicolon()),this.finishNode(e,"ReturnStatement")},Ba.parseSwitchStatement=function(e){var t;this.next(),e.discriminant=this.parseParenExpression(),e.cases=[],this.expect(pa.braceL),this.labels.push(za),this.enterScope(0);for(var s=!1;this.type!==pa.braceR;)if(this.type===pa._case||this.type===pa._default){var i=this.type===pa._case;t&&this.finishNode(t,"SwitchCase"),e.cases.push(t=this.startNode()),t.consequent=[],this.next(),i?t.test=this.parseExpression():(s&&this.raiseRecoverable(this.lastTokStart,"Multiple default clauses"),s=!0,t.test=null),this.expect(pa.colon);}else t||this.unexpected(),t.consequent.push(this.parseStatement(null));return this.exitScope(),t&&this.finishNode(t,"SwitchCase"),this.next(),this.labels.pop(),this.finishNode(e,"SwitchStatement")},Ba.parseThrowStatement=function(e){return this.next(),fa.test(this.input.slice(this.lastTokEnd,this.start))&&this.raise(this.lastTokEnd,"Illegal newline after throw"),e.argument=this.parseExpression(),this.semicolon(),this.finishNode(e,"ThrowStatement")};var Wa=[];Ba.parseTryStatement=function(e){if(this.next(),e.block=this.parseBlock(),e.handler=null,this.type===pa._catch){var t=this.startNode();if(this.next(),this.eat(pa.parenL)){t.param=this.parseBindingAtom();var s="Identifier"===t.param.type;this.enterScope(s?32:0),this.checkLValPattern(t.param,s?4:2),this.expect(pa.parenR);}else this.options.ecmaVersion<10&&this.unexpected(),t.param=null,this.enterScope(0);t.body=this.parseBlock(!1),this.exitScope(),e.handler=this.finishNode(t,"CatchClause");}return e.finalizer=this.eat(pa._finally)?this.parseBlock():null,e.handler||e.finalizer||this.raise(e.start,"Missing catch or finally clause"),this.finishNode(e,"TryStatement")},Ba.parseVarStatement=function(e,t){return this.next(),this.parseVar(e,!1,t),this.semicolon(),this.finishNode(e,"VariableDeclaration")},Ba.parseWhileStatement=function(e){return this.next(),e.test=this.parseParenExpression(),this.labels.push(Fa),e.body=this.parseStatement("while"),this.labels.pop(),this.finishNode(e,"WhileStatement")},Ba.parseWithStatement=function(e){return this.strict&&this.raise(this.start,"'with' in strict mode"),this.next(),e.object=this.parseParenExpression(),e.body=this.parseStatement("with"),this.finishNode(e,"WithStatement")},Ba.parseEmptyStatement=function(e){return this.next(),this.finishNode(e,"EmptyStatement")},Ba.parseLabeledStatement=function(e,t,s,i){for(var n=0,r=this.labels;n<r.length;n+=1){r[n].name===t&&this.raise(s.start,"Label '"+t+"' is already declared");}for(var a=this.type.isLoop?"loop":this.type===pa._switch?"switch":null,o=this.labels.length-1;o>=0;o--){var h=this.labels[o];if(h.statementStart!==e.start)break;h.statementStart=this.start,h.kind=a;}return this.labels.push({name:t,kind:a,statementStart:this.start}),e.body=this.parseStatement(i?-1===i.indexOf("label")?i+"label":i:"label"),this.labels.pop(),e.label=s,this.finishNode(e,"LabeledStatement")},Ba.parseExpressionStatement=function(e,t){return e.expression=t,this.semicolon(),this.finishNode(e,"ExpressionStatement")},Ba.parseBlock=function(e,t,s){for(void 0===e&&(e=!0),void 0===t&&(t=this.startNode()),t.body=[],this.expect(pa.braceL),e&&this.enterScope(0);this.type!==pa.braceR;){var i=this.parseStatement(null);t.body.push(i);}return s&&(this.strict=!1),this.next(),e&&this.exitScope(),this.finishNode(t,"BlockStatement")},Ba.parseFor=function(e,t){return e.init=t,this.expect(pa.semi),e.test=this.type===pa.semi?null:this.parseExpression(),this.expect(pa.semi),e.update=this.type===pa.parenR?null:this.parseExpression(),this.expect(pa.parenR),e.body=this.parseStatement("for"),this.exitScope(),this.labels.pop(),this.finishNode(e,"ForStatement")},Ba.parseForIn=function(e,t){var s=this.type===pa._in;return this.next(),"VariableDeclaration"===t.type&&null!=t.declarations[0].init&&(!s||this.options.ecmaVersion<8||this.strict||"var"!==t.kind||"Identifier"!==t.declarations[0].id.type)&&this.raise(t.start,(s?"for-in":"for-of")+" loop variable declaration may not have an initializer"),e.left=t,e.right=s?this.parseExpression():this.parseMaybeAssign(),this.expect(pa.parenR),e.body=this.parseStatement("for"),this.exitScope(),this.labels.pop(),this.finishNode(e,s?"ForInStatement":"ForOfStatement")},Ba.parseVar=function(e,t,s){for(e.declarations=[],e.kind=s;;){var i=this.startNode();if(this.parseVarId(i,s),this.eat(pa.eq)?i.init=this.parseMaybeAssign(t):"const"!==s||this.type===pa._in||this.options.ecmaVersion>=6&&this.isContextual("of")?"Identifier"===i.id.type||t&&(this.type===pa._in||this.isContextual("of"))?i.init=null:this.raise(this.lastTokEnd,"Complex binding patterns require an initialization value"):this.unexpected(),e.declarations.push(this.finishNode(i,"VariableDeclarator")),!this.eat(pa.comma))break}return e},Ba.parseVarId=function(e,t){e.id=this.parseBindingAtom(),this.checkLValPattern(e.id,"var"===t?1:2,!1);};var Ua=1,ja=2;function Ga(e,t){var s=t.key.name,i=e[s],n="true";return "MethodDefinition"!==t.type||"get"!==t.kind&&"set"!==t.kind||(n=(t.static?"s":"i")+t.kind),"iget"===i&&"iset"===n||"iset"===i&&"iget"===n||"sget"===i&&"sset"===n||"sset"===i&&"sget"===n?(e[s]="true",!1):!!i||(e[s]=n,!1)}function Ha(e,t){var s=e.computed,i=e.key;return !s&&("Identifier"===i.type&&i.name===t||"Literal"===i.type&&i.value===t)}Ba.parseFunction=function(e,t,s,i,n){this.initFunction(e),(this.options.ecmaVersion>=9||this.options.ecmaVersion>=6&&!i)&&(this.type===pa.star&&t&ja&&this.unexpected(),e.generator=this.eat(pa.star)),this.options.ecmaVersion>=8&&(e.async=!!i),t&Ua&&(e.id=4&t&&this.type!==pa.name?null:this.parseIdent(),!e.id||t&ja||this.checkLValSimple(e.id,this.strict||e.generator||e.async?this.treatFunctionsAsVar?1:2:3));var r=this.yieldPos,a=this.awaitPos,o=this.awaitIdentPos;return this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,this.enterScope(Ra(e.async,e.generator)),t&Ua||(e.id=this.type===pa.name?this.parseIdent():null),this.parseFunctionParams(e),this.parseFunctionBody(e,s,!1,n),this.yieldPos=r,this.awaitPos=a,this.awaitIdentPos=o,this.finishNode(e,t&Ua?"FunctionDeclaration":"FunctionExpression")},Ba.parseFunctionParams=function(e){this.expect(pa.parenL),e.params=this.parseBindingList(pa.parenR,!1,this.options.ecmaVersion>=8),this.checkYieldAwaitInDefaultParams();},Ba.parseClass=function(e,t){this.next();var s=this.strict;this.strict=!0,this.parseClassId(e,t),this.parseClassSuper(e);var i=this.enterClassBody(),n=this.startNode(),r=!1;for(n.body=[],this.expect(pa.braceL);this.type!==pa.braceR;){var a=this.parseClassElement(null!==e.superClass);a&&(n.body.push(a),"MethodDefinition"===a.type&&"constructor"===a.kind?(r&&this.raise(a.start,"Duplicate constructor in the same class"),r=!0):a.key&&"PrivateIdentifier"===a.key.type&&Ga(i,a)&&this.raiseRecoverable(a.key.start,"Identifier '#"+a.key.name+"' has already been declared"));}return this.strict=s,this.next(),e.body=this.finishNode(n,"ClassBody"),this.exitClassBody(),this.finishNode(e,t?"ClassDeclaration":"ClassExpression")},Ba.parseClassElement=function(e){if(this.eat(pa.semi))return null;var t=this.options.ecmaVersion,s=this.startNode(),i="",n=!1,r=!1,a="method",o=!1;if(this.eatContextual("static")){if(t>=13&&this.eat(pa.braceL))return this.parseClassStaticBlock(s),s;this.isClassElementNameStart()||this.type===pa.star?o=!0:i="static";}if(s.static=o,!i&&t>=8&&this.eatContextual("async")&&(!this.isClassElementNameStart()&&this.type!==pa.star||this.canInsertSemicolon()?i="async":r=!0),!i&&(t>=9||!r)&&this.eat(pa.star)&&(n=!0),!i&&!r&&!n){var h=this.value;(this.eatContextual("get")||this.eatContextual("set"))&&(this.isClassElementNameStart()?a=h:i=h);}if(i?(s.computed=!1,s.key=this.startNodeAt(this.lastTokStart,this.lastTokStartLoc),s.key.name=i,this.finishNode(s.key,"Identifier")):this.parseClassElementName(s),t<13||this.type===pa.parenL||"method"!==a||n||r){var l=!s.static&&Ha(s,"constructor"),c=l&&e;l&&"method"!==a&&this.raise(s.key.start,"Constructor can't have get/set modifier"),s.kind=l?"constructor":a,this.parseClassMethod(s,n,r,c);}else this.parseClassField(s);return s},Ba.isClassElementNameStart=function(){return this.type===pa.name||this.type===pa.privateId||this.type===pa.num||this.type===pa.string||this.type===pa.bracketL||this.type.keyword},Ba.parseClassElementName=function(e){this.type===pa.privateId?("constructor"===this.value&&this.raise(this.start,"Classes can't have an element named '#constructor'"),e.computed=!1,e.key=this.parsePrivateIdent()):this.parsePropertyName(e);},Ba.parseClassMethod=function(e,t,s,i){var n=e.key;"constructor"===e.kind?(t&&this.raise(n.start,"Constructor can't be a generator"),s&&this.raise(n.start,"Constructor can't be an async method")):e.static&&Ha(e,"prototype")&&this.raise(n.start,"Classes may not have a static property named prototype");var r=e.value=this.parseMethod(t,s,i);return "get"===e.kind&&0!==r.params.length&&this.raiseRecoverable(r.start,"getter should have no params"),"set"===e.kind&&1!==r.params.length&&this.raiseRecoverable(r.start,"setter should have exactly one param"),"set"===e.kind&&"RestElement"===r.params[0].type&&this.raiseRecoverable(r.params[0].start,"Setter cannot use rest params"),this.finishNode(e,"MethodDefinition")},Ba.parseClassField=function(e){if(Ha(e,"constructor")?this.raise(e.key.start,"Classes can't have a field named 'constructor'"):e.static&&Ha(e,"prototype")&&this.raise(e.key.start,"Classes can't have a static field named 'prototype'"),this.eat(pa.eq)){var t=this.currentThisScope(),s=t.inClassFieldInit;t.inClassFieldInit=!0,e.value=this.parseMaybeAssign(),t.inClassFieldInit=s;}else e.value=null;return this.semicolon(),this.finishNode(e,"PropertyDefinition")},Ba.parseClassStaticBlock=function(e){e.body=[];var t=this.labels;for(this.labels=[],this.enterScope(320);this.type!==pa.braceR;){var s=this.parseStatement(null);e.body.push(s);}return this.next(),this.exitScope(),this.labels=t,this.finishNode(e,"StaticBlock")},Ba.parseClassId=function(e,t){this.type===pa.name?(e.id=this.parseIdent(),t&&this.checkLValSimple(e.id,2,!1)):(!0===t&&this.unexpected(),e.id=null);},Ba.parseClassSuper=function(e){e.superClass=this.eat(pa._extends)?this.parseExprSubscripts(!1):null;},Ba.enterClassBody=function(){var e={declared:Object.create(null),used:[]};return this.privateNameStack.push(e),e.declared},Ba.exitClassBody=function(){for(var e=this.privateNameStack.pop(),t=e.declared,s=e.used,i=this.privateNameStack.length,n=0===i?null:this.privateNameStack[i-1],r=0;r<s.length;++r){var a=s[r];Aa(t,a.name)||(n?n.used.push(a):this.raiseRecoverable(a.start,"Private field '#"+a.name+"' must be declared in an enclosing class"));}},Ba.parseExport=function(e,t){if(this.next(),this.eat(pa.star))return this.options.ecmaVersion>=11&&(this.eatContextual("as")?(e.exported=this.parseModuleExportName(),this.checkExport(t,e.exported.name,this.lastTokStart)):e.exported=null),this.expectContextual("from"),this.type!==pa.string&&this.unexpected(),e.source=this.parseExprAtom(),this.semicolon(),this.finishNode(e,"ExportAllDeclaration");if(this.eat(pa._default)){var s;if(this.checkExport(t,"default",this.lastTokStart),this.type===pa._function||(s=this.isAsyncFunction())){var i=this.startNode();this.next(),s&&this.next(),e.declaration=this.parseFunction(i,4|Ua,!1,s);}else if(this.type===pa._class){var n=this.startNode();e.declaration=this.parseClass(n,"nullableID");}else e.declaration=this.parseMaybeAssign(),this.semicolon();return this.finishNode(e,"ExportDefaultDeclaration")}if(this.shouldParseExportStatement())e.declaration=this.parseStatement(null),"VariableDeclaration"===e.declaration.type?this.checkVariableExport(t,e.declaration.declarations):this.checkExport(t,e.declaration.id.name,e.declaration.id.start),e.specifiers=[],e.source=null;else {if(e.declaration=null,e.specifiers=this.parseExportSpecifiers(t),this.eatContextual("from"))this.type!==pa.string&&this.unexpected(),e.source=this.parseExprAtom();else {for(var r=0,a=e.specifiers;r<a.length;r+=1){var o=a[r];this.checkUnreserved(o.local),this.checkLocalExport(o.local),"Literal"===o.local.type&&this.raise(o.local.start,"A string literal cannot be used as an exported binding without `from`.");}e.source=null;}this.semicolon();}return this.finishNode(e,"ExportNamedDeclaration")},Ba.checkExport=function(e,t,s){e&&(Aa(e,t)&&this.raiseRecoverable(s,"Duplicate export '"+t+"'"),e[t]=!0);},Ba.checkPatternExport=function(e,t){var s=t.type;if("Identifier"===s)this.checkExport(e,t.name,t.start);else if("ObjectPattern"===s)for(var i=0,n=t.properties;i<n.length;i+=1){var r=n[i];this.checkPatternExport(e,r);}else if("ArrayPattern"===s)for(var a=0,o=t.elements;a<o.length;a+=1){var h=o[a];h&&this.checkPatternExport(e,h);}else "Property"===s?this.checkPatternExport(e,t.value):"AssignmentPattern"===s?this.checkPatternExport(e,t.left):"RestElement"===s?this.checkPatternExport(e,t.argument):"ParenthesizedExpression"===s&&this.checkPatternExport(e,t.expression);},Ba.checkVariableExport=function(e,t){if(e)for(var s=0,i=t;s<i.length;s+=1){var n=i[s];this.checkPatternExport(e,n.id);}},Ba.shouldParseExportStatement=function(){return "var"===this.type.keyword||"const"===this.type.keyword||"class"===this.type.keyword||"function"===this.type.keyword||this.isLet()||this.isAsyncFunction()},Ba.parseExportSpecifiers=function(e){var t=[],s=!0;for(this.expect(pa.braceL);!this.eat(pa.braceR);){if(s)s=!1;else if(this.expect(pa.comma),this.afterTrailingComma(pa.braceR))break;var i=this.startNode();i.local=this.parseModuleExportName(),i.exported=this.eatContextual("as")?this.parseModuleExportName():i.local,this.checkExport(e,i.exported["Identifier"===i.exported.type?"name":"value"],i.exported.start),t.push(this.finishNode(i,"ExportSpecifier"));}return t},Ba.parseImport=function(e){return this.next(),this.type===pa.string?(e.specifiers=Wa,e.source=this.parseExprAtom()):(e.specifiers=this.parseImportSpecifiers(),this.expectContextual("from"),e.source=this.type===pa.string?this.parseExprAtom():this.unexpected()),this.semicolon(),this.finishNode(e,"ImportDeclaration")},Ba.parseImportSpecifiers=function(){var e=[],t=!0;if(this.type===pa.name){var s=this.startNode();if(s.local=this.parseIdent(),this.checkLValSimple(s.local,2),e.push(this.finishNode(s,"ImportDefaultSpecifier")),!this.eat(pa.comma))return e}if(this.type===pa.star){var i=this.startNode();return this.next(),this.expectContextual("as"),i.local=this.parseIdent(),this.checkLValSimple(i.local,2),e.push(this.finishNode(i,"ImportNamespaceSpecifier")),e}for(this.expect(pa.braceL);!this.eat(pa.braceR);){if(t)t=!1;else if(this.expect(pa.comma),this.afterTrailingComma(pa.braceR))break;var n=this.startNode();n.imported=this.parseModuleExportName(),this.eatContextual("as")?n.local=this.parseIdent():(this.checkUnreserved(n.imported),n.local=n.imported),this.checkLValSimple(n.local,2),e.push(this.finishNode(n,"ImportSpecifier"));}return e},Ba.parseModuleExportName=function(){if(this.options.ecmaVersion>=13&&this.type===pa.string){var e=this.parseLiteral(this.value);return wa.test(e.value)&&this.raise(e.start,"An export name cannot include a lone surrogate."),e}return this.parseIdent(!0)},Ba.adaptDirectivePrologue=function(e){for(var t=0;t<e.length&&this.isDirectiveCandidate(e[t]);++t)e[t].directive=e[t].expression.raw.slice(1,-1);},Ba.isDirectiveCandidate=function(e){return "ExpressionStatement"===e.type&&"Literal"===e.expression.type&&"string"==typeof e.expression.value&&('"'===this.input[e.start]||"'"===this.input[e.start])};var qa=Ma.prototype;qa.toAssignable=function(e,t,s){if(this.options.ecmaVersion>=6&&e)switch(e.type){case"Identifier":this.inAsync&&"await"===e.name&&this.raise(e.start,"Cannot use 'await' as identifier inside an async function");break;case"ObjectPattern":case"ArrayPattern":case"AssignmentPattern":case"RestElement":break;case"ObjectExpression":e.type="ObjectPattern",s&&this.checkPatternErrors(s,!0);for(var i=0,n=e.properties;i<n.length;i+=1){var r=n[i];this.toAssignable(r,t),"RestElement"!==r.type||"ArrayPattern"!==r.argument.type&&"ObjectPattern"!==r.argument.type||this.raise(r.argument.start,"Unexpected token");}break;case"Property":"init"!==e.kind&&this.raise(e.key.start,"Object pattern can't contain getter or setter"),this.toAssignable(e.value,t);break;case"ArrayExpression":e.type="ArrayPattern",s&&this.checkPatternErrors(s,!0),this.toAssignableList(e.elements,t);break;case"SpreadElement":e.type="RestElement",this.toAssignable(e.argument,t),"AssignmentPattern"===e.argument.type&&this.raise(e.argument.start,"Rest elements cannot have a default value");break;case"AssignmentExpression":"="!==e.operator&&this.raise(e.left.end,"Only '=' operator can be used for specifying default value."),e.type="AssignmentPattern",delete e.operator,this.toAssignable(e.left,t);break;case"ParenthesizedExpression":this.toAssignable(e.expression,t,s);break;case"ChainExpression":this.raiseRecoverable(e.start,"Optional chaining cannot appear in left-hand side");break;case"MemberExpression":if(!t)break;default:this.raise(e.start,"Assigning to rvalue");}else s&&this.checkPatternErrors(s,!0);return e},qa.toAssignableList=function(e,t){for(var s=e.length,i=0;i<s;i++){var n=e[i];n&&this.toAssignable(n,t);}if(s){var r=e[s-1];6===this.options.ecmaVersion&&t&&r&&"RestElement"===r.type&&"Identifier"!==r.argument.type&&this.unexpected(r.argument.start);}return e},qa.parseSpread=function(e){var t=this.startNode();return this.next(),t.argument=this.parseMaybeAssign(!1,e),this.finishNode(t,"SpreadElement")},qa.parseRestBinding=function(){var e=this.startNode();return this.next(),6===this.options.ecmaVersion&&this.type!==pa.name&&this.unexpected(),e.argument=this.parseBindingAtom(),this.finishNode(e,"RestElement")},qa.parseBindingAtom=function(){if(this.options.ecmaVersion>=6)switch(this.type){case pa.bracketL:var e=this.startNode();return this.next(),e.elements=this.parseBindingList(pa.bracketR,!0,!0),this.finishNode(e,"ArrayPattern");case pa.braceL:return this.parseObj(!0)}return this.parseIdent()},qa.parseBindingList=function(e,t,s){for(var i=[],n=!0;!this.eat(e);)if(n?n=!1:this.expect(pa.comma),t&&this.type===pa.comma)i.push(null);else {if(s&&this.afterTrailingComma(e))break;if(this.type===pa.ellipsis){var r=this.parseRestBinding();this.parseBindingListItem(r),i.push(r),this.type===pa.comma&&this.raise(this.start,"Comma is not permitted after the rest element"),this.expect(e);break}var a=this.parseMaybeDefault(this.start,this.startLoc);this.parseBindingListItem(a),i.push(a);}return i},qa.parseBindingListItem=function(e){return e},qa.parseMaybeDefault=function(e,t,s){if(s=s||this.parseBindingAtom(),this.options.ecmaVersion<6||!this.eat(pa.eq))return s;var i=this.startNodeAt(e,t);return i.left=s,i.right=this.parseMaybeAssign(),this.finishNode(i,"AssignmentPattern")},qa.checkLValSimple=function(e,t,s){void 0===t&&(t=0);var i=0!==t;switch(e.type){case"Identifier":this.strict&&this.reservedWordsStrictBind.test(e.name)&&this.raiseRecoverable(e.start,(i?"Binding ":"Assigning to ")+e.name+" in strict mode"),i&&(2===t&&"let"===e.name&&this.raiseRecoverable(e.start,"let is disallowed as a lexically bound name"),s&&(Aa(s,e.name)&&this.raiseRecoverable(e.start,"Argument name clash"),s[e.name]=!0),5!==t&&this.declareName(e.name,t,e.start));break;case"ChainExpression":this.raiseRecoverable(e.start,"Optional chaining cannot appear in left-hand side");break;case"MemberExpression":i&&this.raiseRecoverable(e.start,"Binding member expression");break;case"ParenthesizedExpression":return i&&this.raiseRecoverable(e.start,"Binding parenthesized expression"),this.checkLValSimple(e.expression,t,s);default:this.raise(e.start,(i?"Binding":"Assigning to")+" rvalue");}},qa.checkLValPattern=function(e,t,s){switch(void 0===t&&(t=0),e.type){case"ObjectPattern":for(var i=0,n=e.properties;i<n.length;i+=1){var r=n[i];this.checkLValInnerPattern(r,t,s);}break;case"ArrayPattern":for(var a=0,o=e.elements;a<o.length;a+=1){var h=o[a];h&&this.checkLValInnerPattern(h,t,s);}break;default:this.checkLValSimple(e,t,s);}},qa.checkLValInnerPattern=function(e,t,s){switch(void 0===t&&(t=0),e.type){case"Property":this.checkLValInnerPattern(e.value,t,s);break;case"AssignmentPattern":this.checkLValPattern(e.left,t,s);break;case"RestElement":this.checkLValPattern(e.argument,t,s);break;default:this.checkLValPattern(e,t,s);}};var Ka=function(e,t,s,i,n){this.token=e,this.isExpr=!!t,this.preserveSpace=!!s,this.override=i,this.generator=!!n;},Xa={b_stat:new Ka("{",!1),b_expr:new Ka("{",!0),b_tmpl:new Ka("${",!1),p_stat:new Ka("(",!1),p_expr:new Ka("(",!0),q_tmpl:new Ka("`",!0,!0,(function(e){return e.tryReadTemplateToken()})),f_stat:new Ka("function",!1),f_expr:new Ka("function",!0),f_expr_gen:new Ka("function",!0,!1,null,!0),f_gen:new Ka("function",!1,!1,null,!0)},Ya=Ma.prototype;Ya.initialContext=function(){return [Xa.b_stat]},Ya.curContext=function(){return this.context[this.context.length-1]},Ya.braceIsBlock=function(e){var t=this.curContext();return t===Xa.f_expr||t===Xa.f_stat||(e!==pa.colon||t!==Xa.b_stat&&t!==Xa.b_expr?e===pa._return||e===pa.name&&this.exprAllowed?fa.test(this.input.slice(this.lastTokEnd,this.start)):e===pa._else||e===pa.semi||e===pa.eof||e===pa.parenR||e===pa.arrow||(e===pa.braceL?t===Xa.b_stat:e!==pa._var&&e!==pa._const&&e!==pa.name&&!this.exprAllowed):!t.isExpr)},Ya.inGeneratorContext=function(){for(var e=this.context.length-1;e>=1;e--){var t=this.context[e];if("function"===t.token)return t.generator}return !1},Ya.updateContext=function(e){var t,s=this.type;s.keyword&&e===pa.dot?this.exprAllowed=!1:(t=s.updateContext)?t.call(this,e):this.exprAllowed=s.beforeExpr;},Ya.overrideContext=function(e){this.curContext()!==e&&(this.context[this.context.length-1]=e);},pa.parenR.updateContext=pa.braceR.updateContext=function(){if(1!==this.context.length){var e=this.context.pop();e===Xa.b_stat&&"function"===this.curContext().token&&(e=this.context.pop()),this.exprAllowed=!e.isExpr;}else this.exprAllowed=!0;},pa.braceL.updateContext=function(e){this.context.push(this.braceIsBlock(e)?Xa.b_stat:Xa.b_expr),this.exprAllowed=!0;},pa.dollarBraceL.updateContext=function(){this.context.push(Xa.b_tmpl),this.exprAllowed=!0;},pa.parenL.updateContext=function(e){var t=e===pa._if||e===pa._for||e===pa._with||e===pa._while;this.context.push(t?Xa.p_stat:Xa.p_expr),this.exprAllowed=!0;},pa.incDec.updateContext=function(){},pa._function.updateContext=pa._class.updateContext=function(e){!e.beforeExpr||e===pa._else||e===pa.semi&&this.curContext()!==Xa.p_stat||e===pa._return&&fa.test(this.input.slice(this.lastTokEnd,this.start))||(e===pa.colon||e===pa.braceL)&&this.curContext()===Xa.b_stat?this.context.push(Xa.f_stat):this.context.push(Xa.f_expr),this.exprAllowed=!1;},pa.backQuote.updateContext=function(){this.curContext()===Xa.q_tmpl?this.context.pop():this.context.push(Xa.q_tmpl),this.exprAllowed=!1;},pa.star.updateContext=function(e){if(e===pa._function){var t=this.context.length-1;this.context[t]===Xa.f_expr?this.context[t]=Xa.f_expr_gen:this.context[t]=Xa.f_gen;}this.exprAllowed=!0;},pa.name.updateContext=function(e){var t=!1;this.options.ecmaVersion>=6&&e!==pa.dot&&("of"===this.value&&!this.exprAllowed||"yield"===this.value&&this.inGeneratorContext())&&(t=!0),this.exprAllowed=t;};var Qa=Ma.prototype;function Za(e){return "MemberExpression"===e.type&&"PrivateIdentifier"===e.property.type||"ChainExpression"===e.type&&Za(e.expression)}Qa.checkPropClash=function(e,t,s){if(!(this.options.ecmaVersion>=9&&"SpreadElement"===e.type||this.options.ecmaVersion>=6&&(e.computed||e.method||e.shorthand))){var i,n=e.key;switch(n.type){case"Identifier":i=n.name;break;case"Literal":i=String(n.value);break;default:return}var r=e.kind;if(this.options.ecmaVersion>=6)"__proto__"===i&&"init"===r&&(t.proto&&(s?s.doubleProto<0&&(s.doubleProto=n.start):this.raiseRecoverable(n.start,"Redefinition of __proto__ property")),t.proto=!0);else {var a=t[i="$"+i];if(a)("init"===r?this.strict&&a.init||a.get||a.set:a.init||a[r])&&this.raiseRecoverable(n.start,"Redefinition of property");else a=t[i]={init:!1,get:!1,set:!1};a[r]=!0;}}},Qa.parseExpression=function(e,t){var s=this.start,i=this.startLoc,n=this.parseMaybeAssign(e,t);if(this.type===pa.comma){var r=this.startNodeAt(s,i);for(r.expressions=[n];this.eat(pa.comma);)r.expressions.push(this.parseMaybeAssign(e,t));return this.finishNode(r,"SequenceExpression")}return n},Qa.parseMaybeAssign=function(e,t,s){if(this.isContextual("yield")){if(this.inGenerator)return this.parseYield(e);this.exprAllowed=!1;}var i=!1,n=-1,r=-1,a=-1;t?(n=t.parenthesizedAssign,r=t.trailingComma,a=t.doubleProto,t.parenthesizedAssign=t.trailingComma=-1):(t=new Va,i=!0);var o=this.start,h=this.startLoc;this.type!==pa.parenL&&this.type!==pa.name||(this.potentialArrowAt=this.start,this.potentialArrowInForAwait="await"===e);var l=this.parseMaybeConditional(e,t);if(s&&(l=s.call(this,l,o,h)),this.type.isAssign){var c=this.startNodeAt(o,h);return c.operator=this.value,this.type===pa.eq&&(l=this.toAssignable(l,!1,t)),i||(t.parenthesizedAssign=t.trailingComma=t.doubleProto=-1),t.shorthandAssign>=l.start&&(t.shorthandAssign=-1),this.type===pa.eq?this.checkLValPattern(l):this.checkLValSimple(l),c.left=l,this.next(),c.right=this.parseMaybeAssign(e),a>-1&&(t.doubleProto=a),this.finishNode(c,"AssignmentExpression")}return i&&this.checkExpressionErrors(t,!0),n>-1&&(t.parenthesizedAssign=n),r>-1&&(t.trailingComma=r),l},Qa.parseMaybeConditional=function(e,t){var s=this.start,i=this.startLoc,n=this.parseExprOps(e,t);if(this.checkExpressionErrors(t))return n;if(this.eat(pa.question)){var r=this.startNodeAt(s,i);return r.test=n,r.consequent=this.parseMaybeAssign(),this.expect(pa.colon),r.alternate=this.parseMaybeAssign(e),this.finishNode(r,"ConditionalExpression")}return n},Qa.parseExprOps=function(e,t){var s=this.start,i=this.startLoc,n=this.parseMaybeUnary(t,!1,!1,e);return this.checkExpressionErrors(t)||n.start===s&&"ArrowFunctionExpression"===n.type?n:this.parseExprOp(n,s,i,-1,e)},Qa.parseExprOp=function(e,t,s,i,n){var r=this.type.binop;if(null!=r&&(!n||this.type!==pa._in)&&r>i){var a=this.type===pa.logicalOR||this.type===pa.logicalAND,o=this.type===pa.coalesce;o&&(r=pa.logicalAND.binop);var h=this.value;this.next();var l=this.start,c=this.startLoc,u=this.parseExprOp(this.parseMaybeUnary(null,!1,!1,n),l,c,r,n),d=this.buildBinary(t,s,e,u,h,a||o);return (a&&this.type===pa.coalesce||o&&(this.type===pa.logicalOR||this.type===pa.logicalAND))&&this.raiseRecoverable(this.start,"Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses"),this.parseExprOp(d,t,s,i,n)}return e},Qa.buildBinary=function(e,t,s,i,n,r){"PrivateIdentifier"===i.type&&this.raise(i.start,"Private identifier can only be left side of binary expression");var a=this.startNodeAt(e,t);return a.left=s,a.operator=n,a.right=i,this.finishNode(a,r?"LogicalExpression":"BinaryExpression")},Qa.parseMaybeUnary=function(e,t,s,i){var n,r=this.start,a=this.startLoc;if(this.isContextual("await")&&this.canAwait)n=this.parseAwait(i),t=!0;else if(this.type.prefix){var o=this.startNode(),h=this.type===pa.incDec;o.operator=this.value,o.prefix=!0,this.next(),o.argument=this.parseMaybeUnary(null,!0,h,i),this.checkExpressionErrors(e,!0),h?this.checkLValSimple(o.argument):this.strict&&"delete"===o.operator&&"Identifier"===o.argument.type?this.raiseRecoverable(o.start,"Deleting local variable in strict mode"):"delete"===o.operator&&Za(o.argument)?this.raiseRecoverable(o.start,"Private fields can not be deleted"):t=!0,n=this.finishNode(o,h?"UpdateExpression":"UnaryExpression");}else if(t||this.type!==pa.privateId){if(n=this.parseExprSubscripts(e,i),this.checkExpressionErrors(e))return n;for(;this.type.postfix&&!this.canInsertSemicolon();){var l=this.startNodeAt(r,a);l.operator=this.value,l.prefix=!1,l.argument=n,this.checkLValSimple(n),this.next(),n=this.finishNode(l,"UpdateExpression");}}else (i||0===this.privateNameStack.length)&&this.unexpected(),n=this.parsePrivateIdent(),this.type!==pa._in&&this.unexpected();return s||!this.eat(pa.starstar)?n:t?void this.unexpected(this.lastTokStart):this.buildBinary(r,a,n,this.parseMaybeUnary(null,!1,!1,i),"**",!1)},Qa.parseExprSubscripts=function(e,t){var s=this.start,i=this.startLoc,n=this.parseExprAtom(e,t);if("ArrowFunctionExpression"===n.type&&")"!==this.input.slice(this.lastTokStart,this.lastTokEnd))return n;var r=this.parseSubscripts(n,s,i,!1,t);return e&&"MemberExpression"===r.type&&(e.parenthesizedAssign>=r.start&&(e.parenthesizedAssign=-1),e.parenthesizedBind>=r.start&&(e.parenthesizedBind=-1),e.trailingComma>=r.start&&(e.trailingComma=-1)),r},Qa.parseSubscripts=function(e,t,s,i,n){for(var r=this.options.ecmaVersion>=8&&"Identifier"===e.type&&"async"===e.name&&this.lastTokEnd===e.end&&!this.canInsertSemicolon()&&e.end-e.start==5&&this.potentialArrowAt===e.start,a=!1;;){var o=this.parseSubscript(e,t,s,i,r,a,n);if(o.optional&&(a=!0),o===e||"ArrowFunctionExpression"===o.type){if(a){var h=this.startNodeAt(t,s);h.expression=o,o=this.finishNode(h,"ChainExpression");}return o}e=o;}},Qa.parseSubscript=function(e,t,s,i,n,r,a){var o=this.options.ecmaVersion>=11,h=o&&this.eat(pa.questionDot);i&&h&&this.raise(this.lastTokStart,"Optional chaining cannot appear in the callee of new expressions");var l=this.eat(pa.bracketL);if(l||h&&this.type!==pa.parenL&&this.type!==pa.backQuote||this.eat(pa.dot)){var c=this.startNodeAt(t,s);c.object=e,l?(c.property=this.parseExpression(),this.expect(pa.bracketR)):this.type===pa.privateId&&"Super"!==e.type?c.property=this.parsePrivateIdent():c.property=this.parseIdent("never"!==this.options.allowReserved),c.computed=!!l,o&&(c.optional=h),e=this.finishNode(c,"MemberExpression");}else if(!i&&this.eat(pa.parenL)){var u=new Va,d=this.yieldPos,p=this.awaitPos,f=this.awaitIdentPos;this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0;var m=this.parseExprList(pa.parenR,this.options.ecmaVersion>=8,!1,u);if(n&&!h&&!this.canInsertSemicolon()&&this.eat(pa.arrow))return this.checkPatternErrors(u,!1),this.checkYieldAwaitInDefaultParams(),this.awaitIdentPos>0&&this.raise(this.awaitIdentPos,"Cannot use 'await' as identifier inside an async function"),this.yieldPos=d,this.awaitPos=p,this.awaitIdentPos=f,this.parseArrowExpression(this.startNodeAt(t,s),m,!0,a);this.checkExpressionErrors(u,!0),this.yieldPos=d||this.yieldPos,this.awaitPos=p||this.awaitPos,this.awaitIdentPos=f||this.awaitIdentPos;var g=this.startNodeAt(t,s);g.callee=e,g.arguments=m,o&&(g.optional=h),e=this.finishNode(g,"CallExpression");}else if(this.type===pa.backQuote){(h||r)&&this.raise(this.start,"Optional chaining cannot appear in the tag of tagged template expressions");var y=this.startNodeAt(t,s);y.tag=e,y.quasi=this.parseTemplate({isTagged:!0}),e=this.finishNode(y,"TaggedTemplateExpression");}return e},Qa.parseExprAtom=function(e,t){this.type===pa.slash&&this.readRegexp();var s,i=this.potentialArrowAt===this.start;switch(this.type){case pa._super:return this.allowSuper||this.raise(this.start,"'super' keyword outside a method"),s=this.startNode(),this.next(),this.type!==pa.parenL||this.allowDirectSuper||this.raise(s.start,"super() call outside constructor of a subclass"),this.type!==pa.dot&&this.type!==pa.bracketL&&this.type!==pa.parenL&&this.unexpected(),this.finishNode(s,"Super");case pa._this:return s=this.startNode(),this.next(),this.finishNode(s,"ThisExpression");case pa.name:var n=this.start,r=this.startLoc,a=this.containsEsc,o=this.parseIdent(!1);if(this.options.ecmaVersion>=8&&!a&&"async"===o.name&&!this.canInsertSemicolon()&&this.eat(pa._function))return this.overrideContext(Xa.f_expr),this.parseFunction(this.startNodeAt(n,r),0,!1,!0,t);if(i&&!this.canInsertSemicolon()){if(this.eat(pa.arrow))return this.parseArrowExpression(this.startNodeAt(n,r),[o],!1,t);if(this.options.ecmaVersion>=8&&"async"===o.name&&this.type===pa.name&&!a&&(!this.potentialArrowInForAwait||"of"!==this.value||this.containsEsc))return o=this.parseIdent(!1),!this.canInsertSemicolon()&&this.eat(pa.arrow)||this.unexpected(),this.parseArrowExpression(this.startNodeAt(n,r),[o],!0,t)}return o;case pa.regexp:var h=this.value;return (s=this.parseLiteral(h.value)).regex={pattern:h.pattern,flags:h.flags},s;case pa.num:case pa.string:return this.parseLiteral(this.value);case pa._null:case pa._true:case pa._false:return (s=this.startNode()).value=this.type===pa._null?null:this.type===pa._true,s.raw=this.type.keyword,this.next(),this.finishNode(s,"Literal");case pa.parenL:var l=this.start,c=this.parseParenAndDistinguishExpression(i,t);return e&&(e.parenthesizedAssign<0&&!this.isSimpleAssignTarget(c)&&(e.parenthesizedAssign=l),e.parenthesizedBind<0&&(e.parenthesizedBind=l)),c;case pa.bracketL:return s=this.startNode(),this.next(),s.elements=this.parseExprList(pa.bracketR,!0,!0,e),this.finishNode(s,"ArrayExpression");case pa.braceL:return this.overrideContext(Xa.b_expr),this.parseObj(!1,e);case pa._function:return s=this.startNode(),this.next(),this.parseFunction(s,0);case pa._class:return this.parseClass(this.startNode(),!1);case pa._new:return this.parseNew();case pa.backQuote:return this.parseTemplate();case pa._import:return this.options.ecmaVersion>=11?this.parseExprImport():this.unexpected();default:this.unexpected();}},Qa.parseExprImport=function(){var e=this.startNode();this.containsEsc&&this.raiseRecoverable(this.start,"Escape sequence in keyword import");var t=this.parseIdent(!0);switch(this.type){case pa.parenL:return this.parseDynamicImport(e);case pa.dot:return e.meta=t,this.parseImportMeta(e);default:this.unexpected();}},Qa.parseDynamicImport=function(e){if(this.next(),e.source=this.parseMaybeAssign(),!this.eat(pa.parenR)){var t=this.start;this.eat(pa.comma)&&this.eat(pa.parenR)?this.raiseRecoverable(t,"Trailing comma is not allowed in import()"):this.unexpected(t);}return this.finishNode(e,"ImportExpression")},Qa.parseImportMeta=function(e){this.next();var t=this.containsEsc;return e.property=this.parseIdent(!0),"meta"!==e.property.name&&this.raiseRecoverable(e.property.start,"The only valid meta property for import is 'import.meta'"),t&&this.raiseRecoverable(e.start,"'import.meta' must not contain escaped characters"),"module"===this.options.sourceType||this.options.allowImportExportEverywhere||this.raiseRecoverable(e.start,"Cannot use 'import.meta' outside a module"),this.finishNode(e,"MetaProperty")},Qa.parseLiteral=function(e){var t=this.startNode();return t.value=e,t.raw=this.input.slice(this.start,this.end),110===t.raw.charCodeAt(t.raw.length-1)&&(t.bigint=t.raw.slice(0,-1).replace(/_/g,"")),this.next(),this.finishNode(t,"Literal")},Qa.parseParenExpression=function(){this.expect(pa.parenL);var e=this.parseExpression();return this.expect(pa.parenR),e},Qa.parseParenAndDistinguishExpression=function(e,t){var s,i=this.start,n=this.startLoc,r=this.options.ecmaVersion>=8;if(this.options.ecmaVersion>=6){this.next();var a,o=this.start,h=this.startLoc,l=[],c=!0,u=!1,d=new Va,p=this.yieldPos,f=this.awaitPos;for(this.yieldPos=0,this.awaitPos=0;this.type!==pa.parenR;){if(c?c=!1:this.expect(pa.comma),r&&this.afterTrailingComma(pa.parenR,!0)){u=!0;break}if(this.type===pa.ellipsis){a=this.start,l.push(this.parseParenItem(this.parseRestBinding())),this.type===pa.comma&&this.raise(this.start,"Comma is not permitted after the rest element");break}l.push(this.parseMaybeAssign(!1,d,this.parseParenItem));}var m=this.lastTokEnd,g=this.lastTokEndLoc;if(this.expect(pa.parenR),e&&!this.canInsertSemicolon()&&this.eat(pa.arrow))return this.checkPatternErrors(d,!1),this.checkYieldAwaitInDefaultParams(),this.yieldPos=p,this.awaitPos=f,this.parseParenArrowList(i,n,l,t);l.length&&!u||this.unexpected(this.lastTokStart),a&&this.unexpected(a),this.checkExpressionErrors(d,!0),this.yieldPos=p||this.yieldPos,this.awaitPos=f||this.awaitPos,l.length>1?((s=this.startNodeAt(o,h)).expressions=l,this.finishNodeAt(s,"SequenceExpression",m,g)):s=l[0];}else s=this.parseParenExpression();if(this.options.preserveParens){var y=this.startNodeAt(i,n);return y.expression=s,this.finishNode(y,"ParenthesizedExpression")}return s},Qa.parseParenItem=function(e){return e},Qa.parseParenArrowList=function(e,t,s,i){return this.parseArrowExpression(this.startNodeAt(e,t),s,!1,i)};var Ja=[];Qa.parseNew=function(){this.containsEsc&&this.raiseRecoverable(this.start,"Escape sequence in keyword new");var e=this.startNode(),t=this.parseIdent(!0);if(this.options.ecmaVersion>=6&&this.eat(pa.dot)){e.meta=t;var s=this.containsEsc;return e.property=this.parseIdent(!0),"target"!==e.property.name&&this.raiseRecoverable(e.property.start,"The only valid meta property for new is 'new.target'"),s&&this.raiseRecoverable(e.start,"'new.target' must not contain escaped characters"),this.allowNewDotTarget||this.raiseRecoverable(e.start,"'new.target' can only be used in functions and class static block"),this.finishNode(e,"MetaProperty")}var i=this.start,n=this.startLoc,r=this.type===pa._import;return e.callee=this.parseSubscripts(this.parseExprAtom(),i,n,!0,!1),r&&"ImportExpression"===e.callee.type&&this.raise(i,"Cannot use new with import()"),this.eat(pa.parenL)?e.arguments=this.parseExprList(pa.parenR,this.options.ecmaVersion>=8,!1):e.arguments=Ja,this.finishNode(e,"NewExpression")},Qa.parseTemplateElement=function(e){var t=e.isTagged,s=this.startNode();return this.type===pa.invalidTemplate?(t||this.raiseRecoverable(this.start,"Bad escape sequence in untagged template literal"),s.value={raw:this.value,cooked:null}):s.value={raw:this.input.slice(this.start,this.end).replace(/\r\n?/g,"\n"),cooked:this.value},this.next(),s.tail=this.type===pa.backQuote,this.finishNode(s,"TemplateElement")},Qa.parseTemplate=function(e){void 0===e&&(e={});var t=e.isTagged;void 0===t&&(t=!1);var s=this.startNode();this.next(),s.expressions=[];var i=this.parseTemplateElement({isTagged:t});for(s.quasis=[i];!i.tail;)this.type===pa.eof&&this.raise(this.pos,"Unterminated template literal"),this.expect(pa.dollarBraceL),s.expressions.push(this.parseExpression()),this.expect(pa.braceR),s.quasis.push(i=this.parseTemplateElement({isTagged:t}));return this.next(),this.finishNode(s,"TemplateLiteral")},Qa.isAsyncProp=function(e){return !e.computed&&"Identifier"===e.key.type&&"async"===e.key.name&&(this.type===pa.name||this.type===pa.num||this.type===pa.string||this.type===pa.bracketL||this.type.keyword||this.options.ecmaVersion>=9&&this.type===pa.star)&&!fa.test(this.input.slice(this.lastTokEnd,this.start))},Qa.parseObj=function(e,t){var s=this.startNode(),i=!0,n={};for(s.properties=[],this.next();!this.eat(pa.braceR);){if(i)i=!1;else if(this.expect(pa.comma),this.options.ecmaVersion>=5&&this.afterTrailingComma(pa.braceR))break;var r=this.parseProperty(e,t);e||this.checkPropClash(r,n,t),s.properties.push(r);}return this.finishNode(s,e?"ObjectPattern":"ObjectExpression")},Qa.parseProperty=function(e,t){var s,i,n,r,a=this.startNode();if(this.options.ecmaVersion>=9&&this.eat(pa.ellipsis))return e?(a.argument=this.parseIdent(!1),this.type===pa.comma&&this.raise(this.start,"Comma is not permitted after the rest element"),this.finishNode(a,"RestElement")):(this.type===pa.parenL&&t&&(t.parenthesizedAssign<0&&(t.parenthesizedAssign=this.start),t.parenthesizedBind<0&&(t.parenthesizedBind=this.start)),a.argument=this.parseMaybeAssign(!1,t),this.type===pa.comma&&t&&t.trailingComma<0&&(t.trailingComma=this.start),this.finishNode(a,"SpreadElement"));this.options.ecmaVersion>=6&&(a.method=!1,a.shorthand=!1,(e||t)&&(n=this.start,r=this.startLoc),e||(s=this.eat(pa.star)));var o=this.containsEsc;return this.parsePropertyName(a),!e&&!o&&this.options.ecmaVersion>=8&&!s&&this.isAsyncProp(a)?(i=!0,s=this.options.ecmaVersion>=9&&this.eat(pa.star),this.parsePropertyName(a,t)):i=!1,this.parsePropertyValue(a,e,s,i,n,r,t,o),this.finishNode(a,"Property")},Qa.parsePropertyValue=function(e,t,s,i,n,r,a,o){if((s||i)&&this.type===pa.colon&&this.unexpected(),this.eat(pa.colon))e.value=t?this.parseMaybeDefault(this.start,this.startLoc):this.parseMaybeAssign(!1,a),e.kind="init";else if(this.options.ecmaVersion>=6&&this.type===pa.parenL)t&&this.unexpected(),e.kind="init",e.method=!0,e.value=this.parseMethod(s,i);else if(t||o||!(this.options.ecmaVersion>=5)||e.computed||"Identifier"!==e.key.type||"get"!==e.key.name&&"set"!==e.key.name||this.type===pa.comma||this.type===pa.braceR||this.type===pa.eq)this.options.ecmaVersion>=6&&!e.computed&&"Identifier"===e.key.type?((s||i)&&this.unexpected(),this.checkUnreserved(e.key),"await"!==e.key.name||this.awaitIdentPos||(this.awaitIdentPos=n),e.kind="init",t?e.value=this.parseMaybeDefault(n,r,this.copyNode(e.key)):this.type===pa.eq&&a?(a.shorthandAssign<0&&(a.shorthandAssign=this.start),e.value=this.parseMaybeDefault(n,r,this.copyNode(e.key))):e.value=this.copyNode(e.key),e.shorthand=!0):this.unexpected();else {(s||i)&&this.unexpected(),e.kind=e.key.name,this.parsePropertyName(e),e.value=this.parseMethod(!1);var h="get"===e.kind?0:1;if(e.value.params.length!==h){var l=e.value.start;"get"===e.kind?this.raiseRecoverable(l,"getter should have no params"):this.raiseRecoverable(l,"setter should have exactly one param");}else "set"===e.kind&&"RestElement"===e.value.params[0].type&&this.raiseRecoverable(e.value.params[0].start,"Setter cannot use rest params");}},Qa.parsePropertyName=function(e){if(this.options.ecmaVersion>=6){if(this.eat(pa.bracketL))return e.computed=!0,e.key=this.parseMaybeAssign(),this.expect(pa.bracketR),e.key;e.computed=!1;}return e.key=this.type===pa.num||this.type===pa.string?this.parseExprAtom():this.parseIdent("never"!==this.options.allowReserved)},Qa.initFunction=function(e){e.id=null,this.options.ecmaVersion>=6&&(e.generator=e.expression=!1),this.options.ecmaVersion>=8&&(e.async=!1);},Qa.parseMethod=function(e,t,s){var i=this.startNode(),n=this.yieldPos,r=this.awaitPos,a=this.awaitIdentPos;return this.initFunction(i),this.options.ecmaVersion>=6&&(i.generator=e),this.options.ecmaVersion>=8&&(i.async=!!t),this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,this.enterScope(64|Ra(t,i.generator)|(s?128:0)),this.expect(pa.parenL),i.params=this.parseBindingList(pa.parenR,!1,this.options.ecmaVersion>=8),this.checkYieldAwaitInDefaultParams(),this.parseFunctionBody(i,!1,!0,!1),this.yieldPos=n,this.awaitPos=r,this.awaitIdentPos=a,this.finishNode(i,"FunctionExpression")},Qa.parseArrowExpression=function(e,t,s,i){var n=this.yieldPos,r=this.awaitPos,a=this.awaitIdentPos;return this.enterScope(16|Ra(s,!1)),this.initFunction(e),this.options.ecmaVersion>=8&&(e.async=!!s),this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,e.params=this.toAssignableList(t,!0),this.parseFunctionBody(e,!0,!1,i),this.yieldPos=n,this.awaitPos=r,this.awaitIdentPos=a,this.finishNode(e,"ArrowFunctionExpression")},Qa.parseFunctionBody=function(e,t,s,i){var n=t&&this.type!==pa.braceL,r=this.strict,a=!1;if(n)e.body=this.parseMaybeAssign(i),e.expression=!0,this.checkParams(e,!1);else {var o=this.options.ecmaVersion>=7&&!this.isSimpleParamList(e.params);r&&!o||(a=this.strictDirective(this.end))&&o&&this.raiseRecoverable(e.start,"Illegal 'use strict' directive in function with non-simple parameter list");var h=this.labels;this.labels=[],a&&(this.strict=!0),this.checkParams(e,!r&&!a&&!t&&!s&&this.isSimpleParamList(e.params)),this.strict&&e.id&&this.checkLValSimple(e.id,5),e.body=this.parseBlock(!1,void 0,a&&!r),e.expression=!1,this.adaptDirectivePrologue(e.body.body),this.labels=h;}this.exitScope();},Qa.isSimpleParamList=function(e){for(var t=0,s=e;t<s.length;t+=1){if("Identifier"!==s[t].type)return !1}return !0},Qa.checkParams=function(e,t){for(var s=Object.create(null),i=0,n=e.params;i<n.length;i+=1){var r=n[i];this.checkLValInnerPattern(r,1,t?null:s);}},Qa.parseExprList=function(e,t,s,i){for(var n=[],r=!0;!this.eat(e);){if(r)r=!1;else if(this.expect(pa.comma),t&&this.afterTrailingComma(e))break;var a=void 0;s&&this.type===pa.comma?a=null:this.type===pa.ellipsis?(a=this.parseSpread(i),i&&this.type===pa.comma&&i.trailingComma<0&&(i.trailingComma=this.start)):a=this.parseMaybeAssign(!1,i),n.push(a);}return n},Qa.checkUnreserved=function(e){var t=e.start,s=e.end,i=e.name;(this.inGenerator&&"yield"===i&&this.raiseRecoverable(t,"Cannot use 'yield' as identifier inside a generator"),this.inAsync&&"await"===i&&this.raiseRecoverable(t,"Cannot use 'await' as identifier inside an async function"),this.currentThisScope().inClassFieldInit&&"arguments"===i&&this.raiseRecoverable(t,"Cannot use 'arguments' in class field initializer"),!this.inClassStaticBlock||"arguments"!==i&&"await"!==i||this.raise(t,"Cannot use "+i+" in class static initialization block"),this.keywords.test(i)&&this.raise(t,"Unexpected keyword '"+i+"'"),this.options.ecmaVersion<6&&-1!==this.input.slice(t,s).indexOf("\\"))||(this.strict?this.reservedWordsStrict:this.reservedWords).test(i)&&(this.inAsync||"await"!==i||this.raiseRecoverable(t,"Cannot use keyword 'await' outside an async function"),this.raiseRecoverable(t,"The keyword '"+i+"' is reserved"));},Qa.parseIdent=function(e,t){var s=this.startNode();return this.type===pa.name?s.name=this.value:this.type.keyword?(s.name=this.type.keyword,"class"!==s.name&&"function"!==s.name||this.lastTokEnd===this.lastTokStart+1&&46===this.input.charCodeAt(this.lastTokStart)||this.context.pop()):this.unexpected(),this.next(!!e),this.finishNode(s,"Identifier"),e||(this.checkUnreserved(s),"await"!==s.name||this.awaitIdentPos||(this.awaitIdentPos=s.start)),s},Qa.parsePrivateIdent=function(){var e=this.startNode();return this.type===pa.privateId?e.name=this.value:this.unexpected(),this.next(),this.finishNode(e,"PrivateIdentifier"),0===this.privateNameStack.length?this.raise(e.start,"Private field '#"+e.name+"' must be declared in an enclosing class"):this.privateNameStack[this.privateNameStack.length-1].used.push(e),e},Qa.parseYield=function(e){this.yieldPos||(this.yieldPos=this.start);var t=this.startNode();return this.next(),this.type===pa.semi||this.canInsertSemicolon()||this.type!==pa.star&&!this.type.startsExpr?(t.delegate=!1,t.argument=null):(t.delegate=this.eat(pa.star),t.argument=this.parseMaybeAssign(e)),this.finishNode(t,"YieldExpression")},Qa.parseAwait=function(e){this.awaitPos||(this.awaitPos=this.start);var t=this.startNode();return this.next(),t.argument=this.parseMaybeUnary(null,!0,!1,e),this.finishNode(t,"AwaitExpression")};var eo=Ma.prototype;eo.raise=function(e,t){var s=Na(this.input,e);t+=" ("+s.line+":"+s.column+")";var i=new SyntaxError(t);throw i.pos=e,i.loc=s,i.raisedAt=this.pos,i},eo.raiseRecoverable=eo.raise,eo.curPosition=function(){if(this.options.locations)return new Ca(this.curLine,this.pos-this.lineStart)};var to=Ma.prototype,so=function(e){this.flags=e,this.var=[],this.lexical=[],this.functions=[],this.inClassFieldInit=!1;};to.enterScope=function(e){this.scopeStack.push(new so(e));},to.exitScope=function(){this.scopeStack.pop();},to.treatFunctionsAsVarInScope=function(e){return 2&e.flags||!this.inModule&&1&e.flags},to.declareName=function(e,t,s){var i=!1;if(2===t){var n=this.currentScope();i=n.lexical.indexOf(e)>-1||n.functions.indexOf(e)>-1||n.var.indexOf(e)>-1,n.lexical.push(e),this.inModule&&1&n.flags&&delete this.undefinedExports[e];}else if(4===t){this.currentScope().lexical.push(e);}else if(3===t){var r=this.currentScope();i=this.treatFunctionsAsVar?r.lexical.indexOf(e)>-1:r.lexical.indexOf(e)>-1||r.var.indexOf(e)>-1,r.functions.push(e);}else for(var a=this.scopeStack.length-1;a>=0;--a){var o=this.scopeStack[a];if(o.lexical.indexOf(e)>-1&&!(32&o.flags&&o.lexical[0]===e)||!this.treatFunctionsAsVarInScope(o)&&o.functions.indexOf(e)>-1){i=!0;break}if(o.var.push(e),this.inModule&&1&o.flags&&delete this.undefinedExports[e],259&o.flags)break}i&&this.raiseRecoverable(s,"Identifier '"+e+"' has already been declared");},to.checkLocalExport=function(e){-1===this.scopeStack[0].lexical.indexOf(e.name)&&-1===this.scopeStack[0].var.indexOf(e.name)&&(this.undefinedExports[e.name]=e);},to.currentScope=function(){return this.scopeStack[this.scopeStack.length-1]},to.currentVarScope=function(){for(var e=this.scopeStack.length-1;;e--){var t=this.scopeStack[e];if(259&t.flags)return t}},to.currentThisScope=function(){for(var e=this.scopeStack.length-1;;e--){var t=this.scopeStack[e];if(259&t.flags&&!(16&t.flags))return t}};var io=function(e,t,s){this.type="",this.start=t,this.end=0,e.options.locations&&(this.loc=new Ia(e,s)),e.options.directSourceFile&&(this.sourceFile=e.options.directSourceFile),e.options.ranges&&(this.range=[t,0]);},no=Ma.prototype;function ro(e,t,s,i){return e.type=t,e.end=s,this.options.locations&&(e.loc.end=i),this.options.ranges&&(e.range[1]=s),e}no.startNode=function(){return new io(this,this.start,this.startLoc)},no.startNodeAt=function(e,t){return new io(this,e,t)},no.finishNode=function(e,t){return ro.call(this,e,t,this.lastTokEnd,this.lastTokEndLoc)},no.finishNodeAt=function(e,t,s,i){return ro.call(this,e,t,s,i)},no.copyNode=function(e){var t=new io(this,e.start,this.startLoc);for(var s in e)t[s]=e[s];return t};var ao="ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS",oo=ao+" Extended_Pictographic",ho=oo+" EBase EComp EMod EPres ExtPict",lo={9:ao,10:oo,11:oo,12:ho,13:"ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS Extended_Pictographic EBase EComp EMod EPres ExtPict"},co="Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu",uo="Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb",po=uo+" Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd",fo=po+" Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho",mo=fo+" Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi",go={9:uo,10:po,11:fo,12:mo,13:"Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith"},yo={};function Eo(e){var t=yo[e]={binary:ka(lo[e]+" "+co),nonBinary:{General_Category:ka(co),Script:ka(go[e])}};t.nonBinary.Script_Extensions=t.nonBinary.Script,t.nonBinary.gc=t.nonBinary.General_Category,t.nonBinary.sc=t.nonBinary.Script,t.nonBinary.scx=t.nonBinary.Script_Extensions;}for(var xo=0,vo=[9,10,11,12,13];xo<vo.length;xo+=1){Eo(vo[xo]);}var bo=Ma.prototype,So=function(e){this.parser=e,this.validFlags="gim"+(e.options.ecmaVersion>=6?"uy":"")+(e.options.ecmaVersion>=9?"s":"")+(e.options.ecmaVersion>=13?"d":""),this.unicodeProperties=yo[e.options.ecmaVersion>=13?13:e.options.ecmaVersion],this.source="",this.flags="",this.start=0,this.switchU=!1,this.switchN=!1,this.pos=0,this.lastIntValue=0,this.lastStringValue="",this.lastAssertionIsQuantifiable=!1,this.numCapturingParens=0,this.maxBackReference=0,this.groupNames=[],this.backReferenceNames=[];};function Ao(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(55296+(e>>10),56320+(1023&e)))}function Po(e){return 36===e||e>=40&&e<=43||46===e||63===e||e>=91&&e<=94||e>=123&&e<=125}function ko(e){return e>=65&&e<=90||e>=97&&e<=122}function wo(e){return ko(e)||95===e}function Co(e){return wo(e)||Io(e)}function Io(e){return e>=48&&e<=57}function No(e){return e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102}function _o(e){return e>=65&&e<=70?e-65+10:e>=97&&e<=102?e-97+10:e-48}function $o(e){return e>=48&&e<=55}So.prototype.reset=function(e,t,s){var i=-1!==s.indexOf("u");this.start=0|e,this.source=t+"",this.flags=s,this.switchU=i&&this.parser.options.ecmaVersion>=6,this.switchN=i&&this.parser.options.ecmaVersion>=9;},So.prototype.raise=function(e){this.parser.raiseRecoverable(this.start,"Invalid regular expression: /"+this.source+"/: "+e);},So.prototype.at=function(e,t){void 0===t&&(t=!1);var s=this.source,i=s.length;if(e>=i)return -1;var n=s.charCodeAt(e);if(!t&&!this.switchU||n<=55295||n>=57344||e+1>=i)return n;var r=s.charCodeAt(e+1);return r>=56320&&r<=57343?(n<<10)+r-56613888:n},So.prototype.nextIndex=function(e,t){void 0===t&&(t=!1);var s=this.source,i=s.length;if(e>=i)return i;var n,r=s.charCodeAt(e);return !t&&!this.switchU||r<=55295||r>=57344||e+1>=i||(n=s.charCodeAt(e+1))<56320||n>57343?e+1:e+2},So.prototype.current=function(e){return void 0===e&&(e=!1),this.at(this.pos,e)},So.prototype.lookahead=function(e){return void 0===e&&(e=!1),this.at(this.nextIndex(this.pos,e),e)},So.prototype.advance=function(e){void 0===e&&(e=!1),this.pos=this.nextIndex(this.pos,e);},So.prototype.eat=function(e,t){return void 0===t&&(t=!1),this.current(t)===e&&(this.advance(t),!0)},bo.validateRegExpFlags=function(e){for(var t=e.validFlags,s=e.flags,i=0;i<s.length;i++){var n=s.charAt(i);-1===t.indexOf(n)&&this.raise(e.start,"Invalid regular expression flag"),s.indexOf(n,i+1)>-1&&this.raise(e.start,"Duplicate regular expression flag");}},bo.validateRegExpPattern=function(e){this.regexp_pattern(e),!e.switchN&&this.options.ecmaVersion>=9&&e.groupNames.length>0&&(e.switchN=!0,this.regexp_pattern(e));},bo.regexp_pattern=function(e){e.pos=0,e.lastIntValue=0,e.lastStringValue="",e.lastAssertionIsQuantifiable=!1,e.numCapturingParens=0,e.maxBackReference=0,e.groupNames.length=0,e.backReferenceNames.length=0,this.regexp_disjunction(e),e.pos!==e.source.length&&(e.eat(41)&&e.raise("Unmatched ')'"),(e.eat(93)||e.eat(125))&&e.raise("Lone quantifier brackets")),e.maxBackReference>e.numCapturingParens&&e.raise("Invalid escape");for(var t=0,s=e.backReferenceNames;t<s.length;t+=1){var i=s[t];-1===e.groupNames.indexOf(i)&&e.raise("Invalid named capture referenced");}},bo.regexp_disjunction=function(e){for(this.regexp_alternative(e);e.eat(124);)this.regexp_alternative(e);this.regexp_eatQuantifier(e,!0)&&e.raise("Nothing to repeat"),e.eat(123)&&e.raise("Lone quantifier brackets");},bo.regexp_alternative=function(e){for(;e.pos<e.source.length&&this.regexp_eatTerm(e););},bo.regexp_eatTerm=function(e){return this.regexp_eatAssertion(e)?(e.lastAssertionIsQuantifiable&&this.regexp_eatQuantifier(e)&&e.switchU&&e.raise("Invalid quantifier"),!0):!!(e.switchU?this.regexp_eatAtom(e):this.regexp_eatExtendedAtom(e))&&(this.regexp_eatQuantifier(e),!0)},bo.regexp_eatAssertion=function(e){var t=e.pos;if(e.lastAssertionIsQuantifiable=!1,e.eat(94)||e.eat(36))return !0;if(e.eat(92)){if(e.eat(66)||e.eat(98))return !0;e.pos=t;}if(e.eat(40)&&e.eat(63)){var s=!1;if(this.options.ecmaVersion>=9&&(s=e.eat(60)),e.eat(61)||e.eat(33))return this.regexp_disjunction(e),e.eat(41)||e.raise("Unterminated group"),e.lastAssertionIsQuantifiable=!s,!0}return e.pos=t,!1},bo.regexp_eatQuantifier=function(e,t){return void 0===t&&(t=!1),!!this.regexp_eatQuantifierPrefix(e,t)&&(e.eat(63),!0)},bo.regexp_eatQuantifierPrefix=function(e,t){return e.eat(42)||e.eat(43)||e.eat(63)||this.regexp_eatBracedQuantifier(e,t)},bo.regexp_eatBracedQuantifier=function(e,t){var s=e.pos;if(e.eat(123)){var i=0,n=-1;if(this.regexp_eatDecimalDigits(e)&&(i=e.lastIntValue,e.eat(44)&&this.regexp_eatDecimalDigits(e)&&(n=e.lastIntValue),e.eat(125)))return -1!==n&&n<i&&!t&&e.raise("numbers out of order in {} quantifier"),!0;e.switchU&&!t&&e.raise("Incomplete quantifier"),e.pos=s;}return !1},bo.regexp_eatAtom=function(e){return this.regexp_eatPatternCharacters(e)||e.eat(46)||this.regexp_eatReverseSolidusAtomEscape(e)||this.regexp_eatCharacterClass(e)||this.regexp_eatUncapturingGroup(e)||this.regexp_eatCapturingGroup(e)},bo.regexp_eatReverseSolidusAtomEscape=function(e){var t=e.pos;if(e.eat(92)){if(this.regexp_eatAtomEscape(e))return !0;e.pos=t;}return !1},bo.regexp_eatUncapturingGroup=function(e){var t=e.pos;if(e.eat(40)){if(e.eat(63)&&e.eat(58)){if(this.regexp_disjunction(e),e.eat(41))return !0;e.raise("Unterminated group");}e.pos=t;}return !1},bo.regexp_eatCapturingGroup=function(e){if(e.eat(40)){if(this.options.ecmaVersion>=9?this.regexp_groupSpecifier(e):63===e.current()&&e.raise("Invalid group"),this.regexp_disjunction(e),e.eat(41))return e.numCapturingParens+=1,!0;e.raise("Unterminated group");}return !1},bo.regexp_eatExtendedAtom=function(e){return e.eat(46)||this.regexp_eatReverseSolidusAtomEscape(e)||this.regexp_eatCharacterClass(e)||this.regexp_eatUncapturingGroup(e)||this.regexp_eatCapturingGroup(e)||this.regexp_eatInvalidBracedQuantifier(e)||this.regexp_eatExtendedPatternCharacter(e)},bo.regexp_eatInvalidBracedQuantifier=function(e){return this.regexp_eatBracedQuantifier(e,!0)&&e.raise("Nothing to repeat"),!1},bo.regexp_eatSyntaxCharacter=function(e){var t=e.current();return !!Po(t)&&(e.lastIntValue=t,e.advance(),!0)},bo.regexp_eatPatternCharacters=function(e){for(var t=e.pos,s=0;-1!==(s=e.current())&&!Po(s);)e.advance();return e.pos!==t},bo.regexp_eatExtendedPatternCharacter=function(e){var t=e.current();return !(-1===t||36===t||t>=40&&t<=43||46===t||63===t||91===t||94===t||124===t)&&(e.advance(),!0)},bo.regexp_groupSpecifier=function(e){if(e.eat(63)){if(this.regexp_eatGroupName(e))return -1!==e.groupNames.indexOf(e.lastStringValue)&&e.raise("Duplicate capture group name"),void e.groupNames.push(e.lastStringValue);e.raise("Invalid group");}},bo.regexp_eatGroupName=function(e){if(e.lastStringValue="",e.eat(60)){if(this.regexp_eatRegExpIdentifierName(e)&&e.eat(62))return !0;e.raise("Invalid capture group name");}return !1},bo.regexp_eatRegExpIdentifierName=function(e){if(e.lastStringValue="",this.regexp_eatRegExpIdentifierStart(e)){for(e.lastStringValue+=Ao(e.lastIntValue);this.regexp_eatRegExpIdentifierPart(e);)e.lastStringValue+=Ao(e.lastIntValue);return !0}return !1},bo.regexp_eatRegExpIdentifierStart=function(e){var t=e.pos,s=this.options.ecmaVersion>=11,i=e.current(s);return e.advance(s),92===i&&this.regexp_eatRegExpUnicodeEscapeSequence(e,s)&&(i=e.lastIntValue),function(e){return ra(e,!0)||36===e||95===e}(i)?(e.lastIntValue=i,!0):(e.pos=t,!1)},bo.regexp_eatRegExpIdentifierPart=function(e){var t=e.pos,s=this.options.ecmaVersion>=11,i=e.current(s);return e.advance(s),92===i&&this.regexp_eatRegExpUnicodeEscapeSequence(e,s)&&(i=e.lastIntValue),function(e){return aa(e,!0)||36===e||95===e||8204===e||8205===e}(i)?(e.lastIntValue=i,!0):(e.pos=t,!1)},bo.regexp_eatAtomEscape=function(e){return !!(this.regexp_eatBackReference(e)||this.regexp_eatCharacterClassEscape(e)||this.regexp_eatCharacterEscape(e)||e.switchN&&this.regexp_eatKGroupName(e))||(e.switchU&&(99===e.current()&&e.raise("Invalid unicode escape"),e.raise("Invalid escape")),!1)},bo.regexp_eatBackReference=function(e){var t=e.pos;if(this.regexp_eatDecimalEscape(e)){var s=e.lastIntValue;if(e.switchU)return s>e.maxBackReference&&(e.maxBackReference=s),!0;if(s<=e.numCapturingParens)return !0;e.pos=t;}return !1},bo.regexp_eatKGroupName=function(e){if(e.eat(107)){if(this.regexp_eatGroupName(e))return e.backReferenceNames.push(e.lastStringValue),!0;e.raise("Invalid named reference");}return !1},bo.regexp_eatCharacterEscape=function(e){return this.regexp_eatControlEscape(e)||this.regexp_eatCControlLetter(e)||this.regexp_eatZero(e)||this.regexp_eatHexEscapeSequence(e)||this.regexp_eatRegExpUnicodeEscapeSequence(e,!1)||!e.switchU&&this.regexp_eatLegacyOctalEscapeSequence(e)||this.regexp_eatIdentityEscape(e)},bo.regexp_eatCControlLetter=function(e){var t=e.pos;if(e.eat(99)){if(this.regexp_eatControlLetter(e))return !0;e.pos=t;}return !1},bo.regexp_eatZero=function(e){return 48===e.current()&&!Io(e.lookahead())&&(e.lastIntValue=0,e.advance(),!0)},bo.regexp_eatControlEscape=function(e){var t=e.current();return 116===t?(e.lastIntValue=9,e.advance(),!0):110===t?(e.lastIntValue=10,e.advance(),!0):118===t?(e.lastIntValue=11,e.advance(),!0):102===t?(e.lastIntValue=12,e.advance(),!0):114===t&&(e.lastIntValue=13,e.advance(),!0)},bo.regexp_eatControlLetter=function(e){var t=e.current();return !!ko(t)&&(e.lastIntValue=t%32,e.advance(),!0)},bo.regexp_eatRegExpUnicodeEscapeSequence=function(e,t){void 0===t&&(t=!1);var s,i=e.pos,n=t||e.switchU;if(e.eat(117)){if(this.regexp_eatFixedHexDigits(e,4)){var r=e.lastIntValue;if(n&&r>=55296&&r<=56319){var a=e.pos;if(e.eat(92)&&e.eat(117)&&this.regexp_eatFixedHexDigits(e,4)){var o=e.lastIntValue;if(o>=56320&&o<=57343)return e.lastIntValue=1024*(r-55296)+(o-56320)+65536,!0}e.pos=a,e.lastIntValue=r;}return !0}if(n&&e.eat(123)&&this.regexp_eatHexDigits(e)&&e.eat(125)&&((s=e.lastIntValue)>=0&&s<=1114111))return !0;n&&e.raise("Invalid unicode escape"),e.pos=i;}return !1},bo.regexp_eatIdentityEscape=function(e){if(e.switchU)return !!this.regexp_eatSyntaxCharacter(e)||!!e.eat(47)&&(e.lastIntValue=47,!0);var t=e.current();return !(99===t||e.switchN&&107===t)&&(e.lastIntValue=t,e.advance(),!0)},bo.regexp_eatDecimalEscape=function(e){e.lastIntValue=0;var t=e.current();if(t>=49&&t<=57){do{e.lastIntValue=10*e.lastIntValue+(t-48),e.advance();}while((t=e.current())>=48&&t<=57);return !0}return !1},bo.regexp_eatCharacterClassEscape=function(e){var t=e.current();if(function(e){return 100===e||68===e||115===e||83===e||119===e||87===e}(t))return e.lastIntValue=-1,e.advance(),!0;if(e.switchU&&this.options.ecmaVersion>=9&&(80===t||112===t)){if(e.lastIntValue=-1,e.advance(),e.eat(123)&&this.regexp_eatUnicodePropertyValueExpression(e)&&e.eat(125))return !0;e.raise("Invalid property name");}return !1},bo.regexp_eatUnicodePropertyValueExpression=function(e){var t=e.pos;if(this.regexp_eatUnicodePropertyName(e)&&e.eat(61)){var s=e.lastStringValue;if(this.regexp_eatUnicodePropertyValue(e)){var i=e.lastStringValue;return this.regexp_validateUnicodePropertyNameAndValue(e,s,i),!0}}if(e.pos=t,this.regexp_eatLoneUnicodePropertyNameOrValue(e)){var n=e.lastStringValue;return this.regexp_validateUnicodePropertyNameOrValue(e,n),!0}return !1},bo.regexp_validateUnicodePropertyNameAndValue=function(e,t,s){Aa(e.unicodeProperties.nonBinary,t)||e.raise("Invalid property name"),e.unicodeProperties.nonBinary[t].test(s)||e.raise("Invalid property value");},bo.regexp_validateUnicodePropertyNameOrValue=function(e,t){e.unicodeProperties.binary.test(t)||e.raise("Invalid property name");},bo.regexp_eatUnicodePropertyName=function(e){var t=0;for(e.lastStringValue="";wo(t=e.current());)e.lastStringValue+=Ao(t),e.advance();return ""!==e.lastStringValue},bo.regexp_eatUnicodePropertyValue=function(e){var t=0;for(e.lastStringValue="";Co(t=e.current());)e.lastStringValue+=Ao(t),e.advance();return ""!==e.lastStringValue},bo.regexp_eatLoneUnicodePropertyNameOrValue=function(e){return this.regexp_eatUnicodePropertyValue(e)},bo.regexp_eatCharacterClass=function(e){if(e.eat(91)){if(e.eat(94),this.regexp_classRanges(e),e.eat(93))return !0;e.raise("Unterminated character class");}return !1},bo.regexp_classRanges=function(e){for(;this.regexp_eatClassAtom(e);){var t=e.lastIntValue;if(e.eat(45)&&this.regexp_eatClassAtom(e)){var s=e.lastIntValue;!e.switchU||-1!==t&&-1!==s||e.raise("Invalid character class"),-1!==t&&-1!==s&&t>s&&e.raise("Range out of order in character class");}}},bo.regexp_eatClassAtom=function(e){var t=e.pos;if(e.eat(92)){if(this.regexp_eatClassEscape(e))return !0;if(e.switchU){var s=e.current();(99===s||$o(s))&&e.raise("Invalid class escape"),e.raise("Invalid escape");}e.pos=t;}var i=e.current();return 93!==i&&(e.lastIntValue=i,e.advance(),!0)},bo.regexp_eatClassEscape=function(e){var t=e.pos;if(e.eat(98))return e.lastIntValue=8,!0;if(e.switchU&&e.eat(45))return e.lastIntValue=45,!0;if(!e.switchU&&e.eat(99)){if(this.regexp_eatClassControlLetter(e))return !0;e.pos=t;}return this.regexp_eatCharacterClassEscape(e)||this.regexp_eatCharacterEscape(e)},bo.regexp_eatClassControlLetter=function(e){var t=e.current();return !(!Io(t)&&95!==t)&&(e.lastIntValue=t%32,e.advance(),!0)},bo.regexp_eatHexEscapeSequence=function(e){var t=e.pos;if(e.eat(120)){if(this.regexp_eatFixedHexDigits(e,2))return !0;e.switchU&&e.raise("Invalid escape"),e.pos=t;}return !1},bo.regexp_eatDecimalDigits=function(e){var t=e.pos,s=0;for(e.lastIntValue=0;Io(s=e.current());)e.lastIntValue=10*e.lastIntValue+(s-48),e.advance();return e.pos!==t},bo.regexp_eatHexDigits=function(e){var t=e.pos,s=0;for(e.lastIntValue=0;No(s=e.current());)e.lastIntValue=16*e.lastIntValue+_o(s),e.advance();return e.pos!==t},bo.regexp_eatLegacyOctalEscapeSequence=function(e){if(this.regexp_eatOctalDigit(e)){var t=e.lastIntValue;if(this.regexp_eatOctalDigit(e)){var s=e.lastIntValue;t<=3&&this.regexp_eatOctalDigit(e)?e.lastIntValue=64*t+8*s+e.lastIntValue:e.lastIntValue=8*t+s;}else e.lastIntValue=t;return !0}return !1},bo.regexp_eatOctalDigit=function(e){var t=e.current();return $o(t)?(e.lastIntValue=t-48,e.advance(),!0):(e.lastIntValue=0,!1)},bo.regexp_eatFixedHexDigits=function(e,t){var s=e.pos;e.lastIntValue=0;for(var i=0;i<t;++i){var n=e.current();if(!No(n))return e.pos=s,!1;e.lastIntValue=16*e.lastIntValue+_o(n),e.advance();}return !0};var To=function(e){this.type=e.type,this.value=e.value,this.start=e.start,this.end=e.end,e.options.locations&&(this.loc=new Ia(e,e.startLoc,e.endLoc)),e.options.ranges&&(this.range=[e.start,e.end]);},Ro=Ma.prototype;function Mo(e){return "function"!=typeof BigInt?null:BigInt(e.replace(/_/g,""))}function Do(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(55296+(e>>10),56320+(1023&e)))}Ro.next=function(e){!e&&this.type.keyword&&this.containsEsc&&this.raiseRecoverable(this.start,"Escape sequence in keyword "+this.type.keyword),this.options.onToken&&this.options.onToken(new To(this)),this.lastTokEnd=this.end,this.lastTokStart=this.start,this.lastTokEndLoc=this.endLoc,this.lastTokStartLoc=this.startLoc,this.nextToken();},Ro.getToken=function(){return this.next(),new To(this)},"undefined"!=typeof Symbol&&(Ro[Symbol.iterator]=function(){var e=this;return {next:function(){var t=e.getToken();return {done:t.type===pa.eof,value:t}}}}),Ro.nextToken=function(){var e=this.curContext();return e&&e.preserveSpace||this.skipSpace(),this.start=this.pos,this.options.locations&&(this.startLoc=this.curPosition()),this.pos>=this.input.length?this.finishToken(pa.eof):e.override?e.override(this):void this.readToken(this.fullCharCodeAtPos())},Ro.readToken=function(e){return ra(e,this.options.ecmaVersion>=6)||92===e?this.readWord():this.getTokenFromCode(e)},Ro.fullCharCodeAtPos=function(){var e=this.input.charCodeAt(this.pos);if(e<=55295||e>=56320)return e;var t=this.input.charCodeAt(this.pos+1);return t<=56319||t>=57344?e:(e<<10)+t-56613888},Ro.skipBlockComment=function(){var e=this.options.onComment&&this.curPosition(),t=this.pos,s=this.input.indexOf("*/",this.pos+=2);if(-1===s&&this.raise(this.pos-2,"Unterminated comment"),this.pos=s+2,this.options.locations)for(var i=void 0,n=t;(i=ya(this.input,n,this.pos))>-1;)++this.curLine,n=this.lineStart=i;this.options.onComment&&this.options.onComment(!0,this.input.slice(t+2,s),t,this.pos,e,this.curPosition());},Ro.skipLineComment=function(e){for(var t=this.pos,s=this.options.onComment&&this.curPosition(),i=this.input.charCodeAt(this.pos+=e);this.pos<this.input.length&&!ga(i);)i=this.input.charCodeAt(++this.pos);this.options.onComment&&this.options.onComment(!1,this.input.slice(t+e,this.pos),t,this.pos,s,this.curPosition());},Ro.skipSpace=function(){e:for(;this.pos<this.input.length;){var e=this.input.charCodeAt(this.pos);switch(e){case 32:case 160:++this.pos;break;case 13:10===this.input.charCodeAt(this.pos+1)&&++this.pos;case 10:case 8232:case 8233:++this.pos,this.options.locations&&(++this.curLine,this.lineStart=this.pos);break;case 47:switch(this.input.charCodeAt(this.pos+1)){case 42:this.skipBlockComment();break;case 47:this.skipLineComment(2);break;default:break e}break;default:if(!(e>8&&e<14||e>=5760&&Ea.test(String.fromCharCode(e))))break e;++this.pos;}}},Ro.finishToken=function(e,t){this.end=this.pos,this.options.locations&&(this.endLoc=this.curPosition());var s=this.type;this.type=e,this.value=t,this.updateContext(s);},Ro.readToken_dot=function(){var e=this.input.charCodeAt(this.pos+1);if(e>=48&&e<=57)return this.readNumber(!0);var t=this.input.charCodeAt(this.pos+2);return this.options.ecmaVersion>=6&&46===e&&46===t?(this.pos+=3,this.finishToken(pa.ellipsis)):(++this.pos,this.finishToken(pa.dot))},Ro.readToken_slash=function(){var e=this.input.charCodeAt(this.pos+1);return this.exprAllowed?(++this.pos,this.readRegexp()):61===e?this.finishOp(pa.assign,2):this.finishOp(pa.slash,1)},Ro.readToken_mult_modulo_exp=function(e){var t=this.input.charCodeAt(this.pos+1),s=1,i=42===e?pa.star:pa.modulo;return this.options.ecmaVersion>=7&&42===e&&42===t&&(++s,i=pa.starstar,t=this.input.charCodeAt(this.pos+2)),61===t?this.finishOp(pa.assign,s+1):this.finishOp(i,s)},Ro.readToken_pipe_amp=function(e){var t=this.input.charCodeAt(this.pos+1);if(t===e){if(this.options.ecmaVersion>=12)if(61===this.input.charCodeAt(this.pos+2))return this.finishOp(pa.assign,3);return this.finishOp(124===e?pa.logicalOR:pa.logicalAND,2)}return 61===t?this.finishOp(pa.assign,2):this.finishOp(124===e?pa.bitwiseOR:pa.bitwiseAND,1)},Ro.readToken_caret=function(){return 61===this.input.charCodeAt(this.pos+1)?this.finishOp(pa.assign,2):this.finishOp(pa.bitwiseXOR,1)},Ro.readToken_plus_min=function(e){var t=this.input.charCodeAt(this.pos+1);return t===e?45!==t||this.inModule||62!==this.input.charCodeAt(this.pos+2)||0!==this.lastTokEnd&&!fa.test(this.input.slice(this.lastTokEnd,this.pos))?this.finishOp(pa.incDec,2):(this.skipLineComment(3),this.skipSpace(),this.nextToken()):61===t?this.finishOp(pa.assign,2):this.finishOp(pa.plusMin,1)},Ro.readToken_lt_gt=function(e){var t=this.input.charCodeAt(this.pos+1),s=1;return t===e?(s=62===e&&62===this.input.charCodeAt(this.pos+2)?3:2,61===this.input.charCodeAt(this.pos+s)?this.finishOp(pa.assign,s+1):this.finishOp(pa.bitShift,s)):33!==t||60!==e||this.inModule||45!==this.input.charCodeAt(this.pos+2)||45!==this.input.charCodeAt(this.pos+3)?(61===t&&(s=2),this.finishOp(pa.relational,s)):(this.skipLineComment(4),this.skipSpace(),this.nextToken())},Ro.readToken_eq_excl=function(e){var t=this.input.charCodeAt(this.pos+1);return 61===t?this.finishOp(pa.equality,61===this.input.charCodeAt(this.pos+2)?3:2):61===e&&62===t&&this.options.ecmaVersion>=6?(this.pos+=2,this.finishToken(pa.arrow)):this.finishOp(61===e?pa.eq:pa.prefix,1)},Ro.readToken_question=function(){var e=this.options.ecmaVersion;if(e>=11){var t=this.input.charCodeAt(this.pos+1);if(46===t){var s=this.input.charCodeAt(this.pos+2);if(s<48||s>57)return this.finishOp(pa.questionDot,2)}if(63===t){if(e>=12)if(61===this.input.charCodeAt(this.pos+2))return this.finishOp(pa.assign,3);return this.finishOp(pa.coalesce,2)}}return this.finishOp(pa.question,1)},Ro.readToken_numberSign=function(){var e=35;if(this.options.ecmaVersion>=13&&(++this.pos,ra(e=this.fullCharCodeAtPos(),!0)||92===e))return this.finishToken(pa.privateId,this.readWord1());this.raise(this.pos,"Unexpected character '"+Do(e)+"'");},Ro.getTokenFromCode=function(e){switch(e){case 46:return this.readToken_dot();case 40:return ++this.pos,this.finishToken(pa.parenL);case 41:return ++this.pos,this.finishToken(pa.parenR);case 59:return ++this.pos,this.finishToken(pa.semi);case 44:return ++this.pos,this.finishToken(pa.comma);case 91:return ++this.pos,this.finishToken(pa.bracketL);case 93:return ++this.pos,this.finishToken(pa.bracketR);case 123:return ++this.pos,this.finishToken(pa.braceL);case 125:return ++this.pos,this.finishToken(pa.braceR);case 58:return ++this.pos,this.finishToken(pa.colon);case 96:if(this.options.ecmaVersion<6)break;return ++this.pos,this.finishToken(pa.backQuote);case 48:var t=this.input.charCodeAt(this.pos+1);if(120===t||88===t)return this.readRadixNumber(16);if(this.options.ecmaVersion>=6){if(111===t||79===t)return this.readRadixNumber(8);if(98===t||66===t)return this.readRadixNumber(2)}case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return this.readNumber(!1);case 34:case 39:return this.readString(e);case 47:return this.readToken_slash();case 37:case 42:return this.readToken_mult_modulo_exp(e);case 124:case 38:return this.readToken_pipe_amp(e);case 94:return this.readToken_caret();case 43:case 45:return this.readToken_plus_min(e);case 60:case 62:return this.readToken_lt_gt(e);case 61:case 33:return this.readToken_eq_excl(e);case 63:return this.readToken_question();case 126:return this.finishOp(pa.prefix,1);case 35:return this.readToken_numberSign()}this.raise(this.pos,"Unexpected character '"+Do(e)+"'");},Ro.finishOp=function(e,t){var s=this.input.slice(this.pos,this.pos+t);return this.pos+=t,this.finishToken(e,s)},Ro.readRegexp=function(){for(var e,t,s=this.pos;;){this.pos>=this.input.length&&this.raise(s,"Unterminated regular expression");var i=this.input.charAt(this.pos);if(fa.test(i)&&this.raise(s,"Unterminated regular expression"),e)e=!1;else {if("["===i)t=!0;else if("]"===i&&t)t=!1;else if("/"===i&&!t)break;e="\\"===i;}++this.pos;}var n=this.input.slice(s,this.pos);++this.pos;var r=this.pos,a=this.readWord1();this.containsEsc&&this.unexpected(r);var o=this.regexpState||(this.regexpState=new So(this));o.reset(s,n,a),this.validateRegExpFlags(o),this.validateRegExpPattern(o);var h=null;try{h=new RegExp(n,a);}catch(e){}return this.finishToken(pa.regexp,{pattern:n,flags:a,value:h})},Ro.readInt=function(e,t,s){for(var i=this.options.ecmaVersion>=12&&void 0===t,n=s&&48===this.input.charCodeAt(this.pos),r=this.pos,a=0,o=0,h=0,l=null==t?1/0:t;h<l;++h,++this.pos){var c=this.input.charCodeAt(this.pos),u=void 0;if(i&&95===c)n&&this.raiseRecoverable(this.pos,"Numeric separator is not allowed in legacy octal numeric literals"),95===o&&this.raiseRecoverable(this.pos,"Numeric separator must be exactly one underscore"),0===h&&this.raiseRecoverable(this.pos,"Numeric separator is not allowed at the first of digits"),o=c;else {if((u=c>=97?c-97+10:c>=65?c-65+10:c>=48&&c<=57?c-48:1/0)>=e)break;o=c,a=a*e+u;}}return i&&95===o&&this.raiseRecoverable(this.pos-1,"Numeric separator is not allowed at the last of digits"),this.pos===r||null!=t&&this.pos-r!==t?null:a},Ro.readRadixNumber=function(e){var t=this.pos;this.pos+=2;var s=this.readInt(e);return null==s&&this.raise(this.start+2,"Expected number in radix "+e),this.options.ecmaVersion>=11&&110===this.input.charCodeAt(this.pos)?(s=Mo(this.input.slice(t,this.pos)),++this.pos):ra(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number"),this.finishToken(pa.num,s)},Ro.readNumber=function(e){var t=this.pos;e||null!==this.readInt(10,void 0,!0)||this.raise(t,"Invalid number");var s=this.pos-t>=2&&48===this.input.charCodeAt(t);s&&this.strict&&this.raise(t,"Invalid number");var i=this.input.charCodeAt(this.pos);if(!s&&!e&&this.options.ecmaVersion>=11&&110===i){var n=Mo(this.input.slice(t,this.pos));return ++this.pos,ra(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number"),this.finishToken(pa.num,n)}s&&/[89]/.test(this.input.slice(t,this.pos))&&(s=!1),46!==i||s||(++this.pos,this.readInt(10),i=this.input.charCodeAt(this.pos)),69!==i&&101!==i||s||(43!==(i=this.input.charCodeAt(++this.pos))&&45!==i||++this.pos,null===this.readInt(10)&&this.raise(t,"Invalid number")),ra(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number");var r,a=(r=this.input.slice(t,this.pos),s?parseInt(r,8):parseFloat(r.replace(/_/g,"")));return this.finishToken(pa.num,a)},Ro.readCodePoint=function(){var e;if(123===this.input.charCodeAt(this.pos)){this.options.ecmaVersion<6&&this.unexpected();var t=++this.pos;e=this.readHexChar(this.input.indexOf("}",this.pos)-this.pos),++this.pos,e>1114111&&this.invalidStringToken(t,"Code point out of bounds");}else e=this.readHexChar(4);return e},Ro.readString=function(e){for(var t="",s=++this.pos;;){this.pos>=this.input.length&&this.raise(this.start,"Unterminated string constant");var i=this.input.charCodeAt(this.pos);if(i===e)break;92===i?(t+=this.input.slice(s,this.pos),t+=this.readEscapedChar(!1),s=this.pos):8232===i||8233===i?(this.options.ecmaVersion<10&&this.raise(this.start,"Unterminated string constant"),++this.pos,this.options.locations&&(this.curLine++,this.lineStart=this.pos)):(ga(i)&&this.raise(this.start,"Unterminated string constant"),++this.pos);}return t+=this.input.slice(s,this.pos++),this.finishToken(pa.string,t)};var Lo={};Ro.tryReadTemplateToken=function(){this.inTemplateElement=!0;try{this.readTmplToken();}catch(e){if(e!==Lo)throw e;this.readInvalidTemplateToken();}this.inTemplateElement=!1;},Ro.invalidStringToken=function(e,t){if(this.inTemplateElement&&this.options.ecmaVersion>=9)throw Lo;this.raise(e,t);},Ro.readTmplToken=function(){for(var e="",t=this.pos;;){this.pos>=this.input.length&&this.raise(this.start,"Unterminated template");var s=this.input.charCodeAt(this.pos);if(96===s||36===s&&123===this.input.charCodeAt(this.pos+1))return this.pos!==this.start||this.type!==pa.template&&this.type!==pa.invalidTemplate?(e+=this.input.slice(t,this.pos),this.finishToken(pa.template,e)):36===s?(this.pos+=2,this.finishToken(pa.dollarBraceL)):(++this.pos,this.finishToken(pa.backQuote));if(92===s)e+=this.input.slice(t,this.pos),e+=this.readEscapedChar(!0),t=this.pos;else if(ga(s)){switch(e+=this.input.slice(t,this.pos),++this.pos,s){case 13:10===this.input.charCodeAt(this.pos)&&++this.pos;case 10:e+="\n";break;default:e+=String.fromCharCode(s);}this.options.locations&&(++this.curLine,this.lineStart=this.pos),t=this.pos;}else ++this.pos;}},Ro.readInvalidTemplateToken=function(){for(;this.pos<this.input.length;this.pos++)switch(this.input[this.pos]){case"\\":++this.pos;break;case"$":if("{"!==this.input[this.pos+1])break;case"`":return this.finishToken(pa.invalidTemplate,this.input.slice(this.start,this.pos))}this.raise(this.start,"Unterminated template");},Ro.readEscapedChar=function(e){var t=this.input.charCodeAt(++this.pos);switch(++this.pos,t){case 110:return "\n";case 114:return "\r";case 120:return String.fromCharCode(this.readHexChar(2));case 117:return Do(this.readCodePoint());case 116:return "\t";case 98:return "\b";case 118:return "\v";case 102:return "\f";case 13:10===this.input.charCodeAt(this.pos)&&++this.pos;case 10:return this.options.locations&&(this.lineStart=this.pos,++this.curLine),"";case 56:case 57:if(this.strict&&this.invalidStringToken(this.pos-1,"Invalid escape sequence"),e){var s=this.pos-1;return this.invalidStringToken(s,"Invalid escape sequence in template string"),null}default:if(t>=48&&t<=55){var i=this.input.substr(this.pos-1,3).match(/^[0-7]+/)[0],n=parseInt(i,8);return n>255&&(i=i.slice(0,-1),n=parseInt(i,8)),this.pos+=i.length-1,t=this.input.charCodeAt(this.pos),"0"===i&&56!==t&&57!==t||!this.strict&&!e||this.invalidStringToken(this.pos-1-i.length,e?"Octal literal in template string":"Octal literal in strict mode"),String.fromCharCode(n)}return ga(t)?"":String.fromCharCode(t)}},Ro.readHexChar=function(e){var t=this.pos,s=this.readInt(16,e);return null===s&&this.invalidStringToken(t,"Bad character escape sequence"),s},Ro.readWord1=function(){this.containsEsc=!1;for(var e="",t=!0,s=this.pos,i=this.options.ecmaVersion>=6;this.pos<this.input.length;){var n=this.fullCharCodeAtPos();if(aa(n,i))this.pos+=n<=65535?1:2;else {if(92!==n)break;this.containsEsc=!0,e+=this.input.slice(s,this.pos);var r=this.pos;117!==this.input.charCodeAt(++this.pos)&&this.invalidStringToken(this.pos,"Expecting Unicode escape sequence \\uXXXX"),++this.pos;var a=this.readCodePoint();(t?ra:aa)(a,i)||this.invalidStringToken(r,"Invalid Unicode escape"),e+=Do(a),s=this.pos;}t=!1;}return e+this.input.slice(s,this.pos)},Ro.readWord=function(){var e=this.readWord1(),t=pa.name;return this.keywords.test(e)&&(t=ua[e]),this.finishToken(t,e)};Ma.acorn={Parser:Ma,version:"8.7.0",defaultOptions:_a,Position:Ca,SourceLocation:Ia,getLineInfo:Na,Node:io,TokenType:oa,tokTypes:pa,keywordTypes:ua,TokContext:Ka,tokContexts:Xa,isIdentifierChar:aa,isIdentifierStart:ra,Token:To,isNewLine:ga,lineBreak:fa,lineBreakG:ma,nonASCIIwhitespace:Ea};var Zh;!function(e){e[e.ENTRY_CHUNK=0]="ENTRY_CHUNK",e[e.SECONDARY_CHUNK=1]="SECONDARY_CHUNK",e[e.ASSET=2]="ASSET";}(Zh||(Zh={}));

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
        //数组的方法进行拦截  在中间加了一个

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
      var dep = new Dep(); //每一个属性增加一个dep属性

      Object.defineProperty(target, key, {
        get: function get() {
          if (Dep.target) {
            dep.depend(); //属性收集器记住当前的watcher
          }

          return value;
        },
        set: function set(newValue) {
          if (value === newValue) return;
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }
    function observe(data) {
      //只对对象进行属性劫持
      if (_typeof(data) !== 'object' || data == null) return;
      if (data.__ob__ instanceof Observer) return data.__ob__; //被观测过了 直接return

      return new Observer(data);
    } //异步更新的操作

    function initState(vm) {
      var opts = vm.$options;

      if (opts.data) {
        initData(vm);
      }

      if (opts.computed) {
        initComputed(vm);
      }

      if (opts.watch) {
        initWatch(vm);
      }
    }

    function initWatch(vm) {
      var watch = vm.$options.watch;

      for (var key in watch) {
        var handler = watch[key]; //数组、字符串、函数

        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }

    function createWatcher(vm, key, handler) {
      //字符串 数组 函数
      if (typeof handler == 'string') {
        handler = vm[handler];
      }

      return vm.$watch(key, handler);
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
    }

    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {};

      for (var key in computed) {
        var userDef = computed[key]; //值可能是函数也可能是对象 对象要分get和set  函数这是get
        //计算属性也要有一个watcher

        var fn = typeof userDef == 'function' ? userDef : userDef.get;
        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        }); //将属性和watcher对应起来

        defineComputed(vm, key, userDef);
      }
    }

    function defineComputed(target, key, userDef) {
      var setter = userDef.set || function () {}; //可以通过实例拿到对应的属性


      Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
      });
    }

    function createComputedGetter(key) {
      return function () {
        var watcher = this._computedWatchers[key];

        if (watcher.dirty) {
          watcher.evaluate();
        }

        if (Dep.target) {
          //计算属性出栈后还有渲染watcher
          watcher.depend();
        }

        return watcher.value;
      };
    } //首先初始化数据  vue2 兼容ie9以上  vue3抛弃了ie   proxy进行属性劫持
    //一个计算属性对应一个watcher 并且放到实例上

    /* 
        computed就是带有dirty属性的watcher
            两种形式 一个对象 这个函数就是getter setter就是空函数
            属性发生变化的时候
            渲染watcher收集到
        



    */

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        //原型中的this指的都是实例
        var vm = this;
        vm.$options = mergerOptions(this.constructor.options, options); //$表示vue里面的变量  将用户的选项挂载到实例上

        callHook(vm, "beforeCreated"); //初始化数据

        initState(vm);
        callHook(vm, 'created'); //这里面就已经执行了

        if (options.el) {
          vm.$mount(options.el); //实现数据的挂载 第一次合并的时候父亲就是
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


          if (template && el) {
            var render = compileToFunction(template);
            opts.render = render;
          }
        }

        mountComponent(vm, el); //组件的挂载
      };
    } //初始化  状态初始化  data初始化

    function Vue(options) {
      this._init(options);
    }

    Vue.prototype.$nextTick = nextTick;
    initMixin(Vue); //初始化方法   通过方法来进行传递

    initLifeCycle(Vue); //字符串 函数  数组  对象 字符串函数

    Vue.prototype.$watch = function (exprOrFn, cb) {
      //属性的值改变之后 直接执行cb就行
      new Watcher(this, exprOrFn, {
        user: true
      }, cb); //用户自己写的watcher
    };

    initGlobalAPi(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
