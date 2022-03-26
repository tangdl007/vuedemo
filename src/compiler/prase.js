//正则表达式
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);  //匹配到的是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //结束标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
const startTagClose = /^\s*(\/?)>/;


//这是语法的转移不是dom的转义   利用栈形结构来构造一棵树  
export function parseHTML(html){ //解析一个删除一个 知道没有解析的为止

    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [];
    let currentParent;
    let root;

    function createASTElement(tag,attrs){
        return {
            tag,
            type:ELEMENT_TYPE,
            children:[],
            attrs,
            parent:null
        }
    }


    function start(tag,attrs){
        let node = createASTElement(tag,attrs);
        if(!root){
            root = node;
        }
        if(currentParent){
            node.parent = currentParent;
            currentParent.children.push(node);
        }
        stack.push(node);
        currentParent = node;
    }

    function chars(text){
        text = text.replace(/\s/g,"");
        text && currentParent.children.push({
            type:TEXT_TYPE,
            text,
            parent:currentParent
        })
    }

    function end(){
        stack.pop();
        currentParent = stack[stack.length - 1];
    }




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

            let attr,end;  //赋值的话加一个括号就行 匹配的值
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){  //如果标签没有结束就一直匹配
                advance(attr[0].length);
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5] || true});
            }
    
            if(end){
                advance(end[0].length);
            }
            return match;
        }

        return false;
    }
    while(html){    
        //如果为0则是标签开始的位置，如果大于0  文本结束的位置
        let textEnd = html.indexOf("<");

        if(textEnd == 0){
            const startTagMatch = parseStart();
            if(startTagMatch){
                start(startTagMatch.tagName,startTagMatch.attrs);
                continue;
            }

            let endTagMatch = html.match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[1])
                continue;
            }

        }

        if(textEnd > 0){
            let text = html.substring(0,textEnd);
            if(text){
                chars(text);
                advance(text.length);
            }
        }
    }
    return root;
}