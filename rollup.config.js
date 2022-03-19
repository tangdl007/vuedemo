//rollup会到处一个对象 用于打包的配置文件 rollup -cw 用rollup打包并监控文件变化
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve"
export default {
    input:"./src/index.js",
    output:{
        file:"./dist/vue.js",
        name:"Vue",  //全局挂一个属性 global
        format:"umd",   //umd统一模块规范  （兼容common.js amd）
        sourcemap:true  //希望可以调试源代码
    },
    plugins:[
        babel({
            exclude:"node_modules/**"
        }),
        resolve()  //让rollup按照node的格式来进行解析
    ]
}