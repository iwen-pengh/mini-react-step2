
### 1、工程搭建
我们选择零配置打包工具 parcel
```js
npm install -g parcel-bundler
```
官方有详细教程，此处就不介绍了 [parcel](https://zh.parceljs.org/getting_started.html) 

注意下[babel](https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#removing-unused-react-imports)的配置，React 17后 JSX 不会转换为 React.createElement
```html
<!--index.html-->
<!doctype html>
<html>
  <head>
    <title>mini-react</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
  <script src="./index.js"></script>
</html>

```
```js
//inex.js
import React from 'react';
import ReactDOM from 'react-dom'
//如果是jsx对象
const JSX = (
    <div className="active" title="123">
        hello,<span>mini react</span>
    </div>
)

ReactDOM.render(JSX, document.querySelector('#app'));
```

### 2、然后就要开始写代码了，首先分析下。实现一个迷你版的react需要哪些步骤
- JSX是什么，虚拟DOM是什么，JSX如何转成虚拟dom
- 虚拟DOM如何转成真是dom
- React组件的实现
- React组件里面的生命周期实现
- React更新的时候diff算法
- React setState

### 3、JSX是什么，虚拟DOM是什么，JSX如何转成虚拟dom

- 1).React 使用 JSX 来替代常规的 JavaScript。JSX 是一个看起来很像 XML 的 JavaScript 语法扩展。
- 2）在浏览器中无法直接使用 JSX，所以大多数 React 开发者需依靠 Babel 来将 JSX 代码转换为 JavaScript
```js
  const JSX = (
      <div className="active" title="123">
          hello,<span>mini react</span>
      </div>
  )
```
这段代码就是我们经常写的JSX，经过[babel-plugin-transform-react-jsx](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&spec=false&loose=false&code_lz=ATDGHsDsGcBdgFIGUAawC8wAUAoE_gAeAEwEsA3MAGwENpoA5GgWwFN0AiG0WC1j4L1hV2HAIwAmAMwcAfHgKKAFqypVwAGkLQADjUizmpSKWAAnVt1iEA9Lv3zFRG2XKPgASiA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact&prettier=false&targets=&version=7.13.8&externalPlugins=)转换后，变成了
```js
const JSX = React.createElement("div", {
  className: "active",
  title: "123"
}, "hello,", React.createElement("span", null, "mini react"));
```
可以看到jsx经过babel后会自动调用`React.createElement`，因此我们的React里面一定有一个`createElement`方法
```js
// 根目录建react文件夹， react/index.js
function createElement (tag, attrs, ...child) {
    return {
        tag, //外层的标签 eg：div
        attrs, // 标签的属性 eg：{ className: 'active', title: '123'}
        child // 子节点
    }
}
const React = {
    createElement,
}
export default React
```
此处可以看到`createElement` 返回的是一个描述html的js对象，称为虚拟dom

### 4、虚拟DOM如何转成真是dom
```
ReactDOM.render(JSX, document.querySelector('#app'));
```
可以看到`ReactDOM`里面有一个`render`, 此方法就是将我们的虚拟dom渲染成真实dom的方法
```js
// 根目录建react-dom文件夹， react-dom/index.js
function render (vnode, container) {
	//如果虚拟dom不存在
    if(vnode === undefined || vnode === null || typeof vnode === 'boolean') {
        return '';
    };

    //如果vnode是字符串or数字
    if(typeof vnode === 'string' || typeof vnode === 'number' ) {
        //创建文本节点
        const textNode = document.createTextNode(vnode);
         container.appendChild(textNode);
    }

    //否则虚拟DOM
    const { tag ,attrs, child} = vnode;
    
    //创建节点对象
    let dom = '';
    if(tag) {
        dom = document.createElement(tag)
        container.appendChild(dom);
    }

    //递归渲染子节点
    if(child) {
        child.forEach( c => render(c, dom))
    }
    
}

const ReactDOM = {
    render
}
export default ReactDOM
```
接下来。index.js里面引入刚刚写的 `React` 和 `react-dom`
```js
import React from './react';
import ReactDOM from './react-dom'
```
好了，然后执行`parcel index.html` 此时页面就可以渲染出来
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a287bcdac5c14a6a9953a39970ccbd82~tplv-k3u1fbpfcp-watermark.image)


- 但是我们发现的`className` 和 `title` 没渲染出来，所以我们需要在render方法里面定义下设置属性的方法
```js

  // ...
  
  if( attrs ){
        // 有属性值 key： className="active" title="123"
        Object.keys(attrs).forEach( key => {
            const value = attrs[key];
            setAttribute(dom, key, value); //定义下 setAttribute方法
        })
    }
    
    //...
```

```js

//设置属性
function setAttribute(dom, key, value) {
    
    //将calssName 转成class
    if( key === 'className') {
        key = 'class'
    }

    //如果是事件 eg： onClick onBlur 
    if(/on\w/.test(key)) {
        //转小写
        key = key.toLowerCase();
        dom[key] = value || '';
    }

    if(key === 'style') {
        if(!value || typeof value === 'string') {
            //style 的值是字符串
            dom.style.cssText = value || ''
        } else if(value || typeof value === 'object'){
            //style 的值是对象
            for(let k in value) {
                if(typeof value[k] === 'number') {
                    dom.style[key] = value[key] + 'px';
                }else {
                    dom.style[key] = value[key];
                }
            }
        }
    }else {
        //其他属性
        if( key in dom ) {
            // console.log('key', key, dom);
            dom[key] = value || ''
        }else if(value) {
            //更新值
            dom.setAttribute(key, value)
        }else {
            dom.removeAttribute(key)
        }
    }

    
}
```
接下来。我们发现属性 `className` 和 `title` 就可以渲染出来了
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eeeaed3ae557448f9d5ce3b587f2cdcd~tplv-k3u1fbpfcp-watermark.image)

下篇文章继续介绍剩下的内容：
- React组件的实现
- React组件里面的生命周期实现
- React更新的时候diff算法
- React setState

### 5、结语
感谢各位老铁，点赞加关注

完整代码
[github](https://github.com/iwen-pengh/mini-react-step1)