//正则表达式
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);  //匹配到的是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //结束标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;


//vue2用的是正则 vue3一个字符一个字符的去判断
function parseHTML(html){ //解析一个删除一个 知道没有解析的为止
    function advance(n){
        html = html.substring(n); //匹配一点截取一点
    }
    function parseStart(){
        const start = html.match(startTagOpen);
        if(start){
            const match = {
                tagName:start[1],   //标签名
                attrs:[]
            }
            advance(start[0].length);
            console.log(match);
        }

        let attr,end;  //赋值的话加一个括号就行 匹配的值
        while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){  //如果标签没有结束就一直匹配
            advance(attr[0].length);
        }

        if(end){
            advance(end[0].length);
        }
        console.log(html);
        return false;
    }
    while(html){
        //如果为0则是标签开始的位置，如果大于0  文本结束的位置
        let textEnd = html.indexOf("<");

        if(textEnd == 0){
            parseStart();



            break;
        }
    }

}

export function compileToFunction(template){
    //将template生成ast抽象语法树
    //生成render函数
    //render函数执行的结果就是 虚拟dom
    let ast = parseHTML(template)
}