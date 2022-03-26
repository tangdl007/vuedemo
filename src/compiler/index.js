import { parseHTML } from "./prase";


function genProps(attrs){
    let str = "";
    for(let i=0;i<attrs.length;i++){
        let attr = attrs[i];

        if(attr.name == 'style'){  //重写value的值
            let obj = {};
            attr.value.split(";").forEach(item => {
                let [key,value] = item.split(":")
                obj[key] = value
            });
            attr.value = obj;
        }   
        
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`   //去掉最后一个
}


const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node){
    if(node.type == 1){
        return codeGen(node);
    }else{
        let text = node.text;
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})`
        }else{
            let token = [];
            let match;
            defaultTagRE.lastIndex = 0; //每次匹配过后，lastindex会往前加1
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)){
                let index = match.index;
                if(index > lastIndex){
                    token.push(JSON.stringify(text.slice(lastIndex,index))) 
                }
                token.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length;
            } //是起始的位置  lastindex  中间的内容进行截取
            if(lastIndex < text.length){
                token.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${token.join("+")})`
        }

    }
}

function genChildren(children){
    return children.map(child => gen(child)).join(",");   //数组转换为字符串 join  字符串转化为数组 split
}



function codeGen(ast) {
    let children = genChildren(ast.children);


    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : null}${ast.children.length?`,${children}`:''})`);

    return code;
}



//模版引擎的实现原理就是 with +  new Function


export function compileToFunction(template) {
    let ast = parseHTML(template);
    //生成字符串  _c  _v  _s
    let code = codeGen(ast);
    code = `with(this){return ${code}}`
    let render = new Function(code); 

    return render;
}



