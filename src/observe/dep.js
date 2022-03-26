

let id = 0;
class Dep{
    constructor(){
        this.id = id++;
        this.subs = []; //这里存放着属性对应的watcher
    }
    depend(){
        Dep.target.addDep(this);//记录dep  计算属性和清理操作的时候要用
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}


//用到的属性才会收集 没有用到的就不会收集

Dep.target = null;

export default Dep;