(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
      text = text.replace(/\s/g, '');
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
  }
  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
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

      patchProps(vnode.el, {}, data);
      vnode.children.forEach(function (child) {
        //递归进行创建
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el; //真实节点
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //老的有新的没有直接删除 对应的el就是元素本身   尽量复用老的  
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = "";
      }
    }

    for (var _key in oldProps) {
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    } //新的覆盖老的


    for (var _key2 in props) {
      if (_key2 == 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVnode, vnode) {
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      var elm = oldVnode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    } else {
      return patchVnode(oldVnode, vnode);
    }
  }

  function patchVnode(oldVnode, vnode) {
    //不是相同节点
    if (!isSameVnode(oldVnode, vnode)) {
      var _el = createElm(vnode);

      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    } //文本节点还是元素节点


    var el = vnode.el = oldVnode.el;

    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text; //用新的文本替换掉老的文本
      }
    } //是标签比较属性


    patchProps(el, oldVnode.data, vnode.data); //比较儿子 一个有儿子一个没有  两个都有儿子 两个都没有

    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      el.innerHTML = "";
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    //头指针超过尾指针就结束
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      //头指针超过尾指针的时候就结束
      //头头比对
      if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        //尾尾比
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        //交叉比  老的尾与新的头比较 比较完后往前追加
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      }
    }

    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        var anchor = newChildren[newStartIndex + 1] ? newChildren[newStartIndex + 1].el : null;
        el.insertBefore(childEl, anchor); //为null就是appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var oldEl = oldChildren[_i].el;
        el.removeChild(oldEl);
      }
    }
  } //比较虚拟dom 尽可能的服用老的 提升性能
  //节点比较  节点不同 tag和key
  //文本节点  
  //元素节点  props  老的有的新的没有去掉  新的覆盖老的
  //比较儿子  双指针的方式  头指针超过尾指针的时候结束  超过的部分 追加或者去除
  //是一个概念

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
      } //更新


      ob.dep.notify();
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //新增一个属性希望能够更行 $set
      this.dep = new Dep(); //object.defineProperty只能对已经存在的属性进行劫持 对于新增和删除的属性不能进行劫持  $set $delete

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

  function dependArrar(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArrar(current);
      }
    }
  }

  function defineReactive(target, key, value) {
    //闭包 这里的执行栈并没有被销毁 get和set方法能拿到value
    var childOb = observe(value);
    var dep = new Dep(); //每一个属性增加一个dep属性  一起进行依赖的收集

    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); //属性收集器记住当前的watcher

          if (childOb) {
            childOb.dep.depend(); //让数组和对象本身也实现依赖收集

            if (Array.isArray(value)) {
              dependArrar(value);
            }
          }
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
  //不存在的属性监控不到 存在属性重写方法
  //不存在的属性监控不到   存在的属性重写方法
  // 虚拟节点的比对

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
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$watch = function (exprOrFn, cb) {
      //属性的值改变之后 直接执行cb就行
      new Watcher(this, exprOrFn, {
        user: true
      }, cb); //用户自己写的watcher
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

  initMixin(Vue); //初始化方法   通过方法来进行传递

  initLifeCycle(Vue);
  initGlobalAPi(Vue);
  initStateMixin(Vue);
  var render1 = compileToFunction("<ul style=\"color:red\">\n    <li key=\"a\">a</li>\n    <li key=\"b\">b</li>\n    <li key=\"c\">c</li>\n    <li key=\"d\">d</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: "zf"
    }
  });
  var prevVnode = render1.call(vm1); //对象

  var el = createElm(prevVnode);
  document.body.appendChild(el);
  var render2 = compileToFunction("<ul style=\"background:yellow\">\n    <li key=\"d\">d</li>\n    <li key=\"a\">a</li>\n    <li key=\"b\">b</li>\n    <li key=\"c\">c</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: "李寻欢"
    }
  });
  var nextVnode = render2.call(vm2); //对象
  //尽可能的服用老节点  节约性能  平级来进行比较  父亲不一样就不比较儿子

  setTimeout(function () {
    patch(prevVnode, nextVnode);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
