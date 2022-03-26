let strats = {};
const LIFECYCLE = [
    "beforeCreated",
    'created'
]
LIFECYCLE.forEach(hook => {
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
    }
})
export function mergerOptions(parent, child) {
    let options = {};
    for (let key in parent) {
        mergeField(key)
    }

    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key];
        }
    }

    return options;
}


//用户的选项和全局的配置合并都一起