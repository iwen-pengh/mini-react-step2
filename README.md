---
# 主题列表：juejin, github, smartblue, cyanosis, channing-cyan, fancy, hydrogen, condensed-night-purple, greenwillow, v-green, vue-pro, healer-readable, mk-cute, jzman, geek-black, awesome-green, qklhk-chocolate
# 贡献主题：https://github.com/xitu/juejin-markdown-themes
theme: juejin
highlight:
---
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa3dd0adf6164fb4975bfa07ed78f935~tplv-k3u1fbpfcp-watermark.image)
> ####  走起，来吧少年 

上一篇文章讲到，
JSX是什么，[虚拟DOM是什么，JSX如何转成虚拟dom
虚拟DOM如何转成真是dom](https://juejin.cn/user/624178336133256/posts),
接着上一篇开始总结下：
- React组件的实现
- React组件里面的生命周期实现
### 1、React 组件的实现
回顾一下上一篇文章中，我们传入ReactDOM.render的第一个参数是JSX的虚拟dom，我们现在将他改成class组件
```js
// index.js
import React from 'react';
import ReactDOM from 'react-dom'
//如果是jsx对象
const JSX = (
    <div className="active" title="123">
        hello,<span>mini react</span>
    </div>
)
//如果是class
class Comp extends React.Component {
    render() {
        return (
            <div className="active" title="123">
                hello,<span>mini react</span>
            </div>
        )
    }
}
ReactDOM.render(<Comp />, document.querySelector('#app'));
```
可以看到 `Comp` 需要继承`React.Component`
### 2、React.Component
```js
// react/Component.js
class Component {
    constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
}
export default Component;
```
```js
import Component from './Component'
// ...
const React = {
    createElement,
    Component
}
export default React
```
- ` React.Component `先这么写上
### 3、分析下 ReactDOM.render 第一个参数变成`<Comp />`后的结果
- babel `transform-react-jsx`转译class的时候输出的类容，我们验证下是什么？[babel测试直达地址](https://babeljs.io/repl#?browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=MYGwhgzhAEDCD2BbADtApgDwC5oHYBMYAlNMYLAOgRXlzy2gG8AoaN6AJz3zQ4AoAlE1btRXLAFcOuaHxGiF0ADz4AlgDdooSBAByYRGgC8AIjJYNaE9AtYQxkwEYATAGYTAPnmKfACzQgIPAANEoQyGC4HoiquKqcpORKAPThkV4-Cilq6hk-At4AvszFwLQQ8PYUQQDmfErUqLb2pi7u0MkeAkA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.13.9&externalPlugins=)
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2ce224c53a640c682daf224ece4a18d~tplv-k3u1fbpfcp-watermark.image)

蓝色框框里面看到`React.createElement`收的第一个参数不是dom节点了，变成一个组件，第二个参数就是传入class组件里面的props。
```js
function createElement (tag, attrs, ...child) {
    return {
        tag, //组件
        attrs, // 组件的props
        child // 子节点或者子组件
    }
}
```
### 4、升级render，tag是否是函数
> 如果tag是一个函数，就需要
- 创建组件
- 设置组件的属性（props）
```js
function render( vnode ) {

    // ...
	//如果是函数 ，则渲染组件
    if ( typeof vnode.tag === 'function' ) {

        //1 创建组件
        const component = createComponent( vnode.tag, vnode.attrs );

        //2 设置组件的属性（props）
        setComponentProps( component, vnode.attrs );

    } else {
      // ...
    }
    
  	 // ...
}
```
如上代码，我们需要在实现`createComponent` 和 `setComponentProps` 两个方法
```js
// 创建组件，返回的是一个组件的实例对象，组件内部如果是函数组件，则需要扩展成类组件
function createComponent( component, props ) {

    let inst;
    // 如果是类定义组件，则直接返回实例
    if ( component.prototype && component.prototype.render ) {
        inst = new component( props );
    // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
        inst = new Component( props );
        inst.constructor = component;
        inst.render = function() {
            return this.constructor( props );
        }
    }

    return inst;
}
```
`setComponentProps`方法
```js
function setComponentProps (comp, props, container) {
    comp.props = props;
    renderComponent(comp, container)
}
//导出，方便后面setState函数使用
export function renderComponent (comp, container) {
    //真实dom
    const renderer = comp.render();
    console.log(renderer, container);
    render(renderer, container);
    comp._dom = container;
}
```
此时我们的组件就可以正常渲染出来了

### 5、生命周期的实现
`setComponentProps` 添加
```
function setComponentProps (comp, props, container) {
    if(!comp._dom) {
        //实例对象的 constructor === 我们的class组件
        const fun = comp.constructor;
        if(fun.getDerivedStateFromProps) {
            fun.getDerivedStateFromProps(props, comp.state);
        }
    }
    //...
}
```
 `renderComponent` 修改添加
```js
function renderComponent (comp, container) {
    if ( comp._dom ) {
        //comp 是react 类的实例。实例的constructor是就是react类
        const fun = comp.constructor; 
        if ( fun.getDerivedStateFromProps ) fun.getDerivedStateFromProps(comp.props, comp.state);
        if ( comp.shouldComponentUpdate ) {
           const isReload = comp.shouldComponentUpdate()
           if(!isReload) {
                return null;
           }
        }
    }
    const renderer = comp.render();
    render(renderer, container);
    if(!comp._dom) {
        //在render后触发 componentDidMount
        if ( comp.componentDidMount ) comp.componentDidMount();
        // getSnapshotBeforeUpdate componentDidUpdate componentWillUnmount实现思路是和上面是一样
    }
    comp._dom = container;
}
ReactDom
```
写个 `Counter`类传入传入到 `render`里面
```js
class Counter extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            num: 0
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        console.log('getDerivedStateFromProps', nextProps, prevState);
        return null;
    }


    shouldComponentUpdate() {
        console.log( 'shouldComponentUpdate' );
        return true;
    }


    handerClick() {
        this.setState( { num: this.state.num + 1 } );
    }

    render() {
        return (
             <div className="active" title="123" id="test">
                hello,<span>mini react</span> {this.state.num}
                <button onClick={ () => {
                    this.handerClick();
                }}>add</button>
            </div>
        );
    }

    componentDidMount () {
        console.log('组件挂载');
        const dom = document.getElementById('test')
        console.log('dom', dom);
        
    }
}

```
然后执行`parcel index.html` 此时页面的生命周期就可以渲染出来
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/baaafde0b5744ce3ac27ed5941460bbd~tplv-k3u1fbpfcp-watermark.image)

### 5、结语
感谢各位老铁，点赞加关注

整理了下代码
```js
//react-dom/index.js
function render (vnode, container) {
    if(typeof vnode.tag === 'function' ) {
    	//渲染组件
        _renderComp(vnode, container);
    }else {
    	//渲染虚拟dom
        const _dom = _renderVnode(vnode);
        container.appendChild(_dom);
    }
}

//render组件
function _renderComp(vnode, container) {
    // 1：创建组件
    const comp = createComponent(vnode.tag, vnode.attrs)
    // 2: 设置组件属性
    setComponentProps(comp, vnode.attrs, vnode.tag);
    // 3: 组件渲染的节点对象返回
    container.appendChild(comp._dom);
}

//render虚拟dom
function _renderVnode (vnode) {
    //如果虚拟dom不存在
    if(vnode === undefined || vnode === null || typeof vnode === 'boolean') {
        return '';
    };

    //如果vnode是字符串or数字
    if(typeof vnode === 'string' || typeof vnode === 'number' ) {
        //创建文本节点
        const textNode = document.createTextNode(vnode);
        return textNode
    }

     //否则虚拟DOM
     const { tag ,attrs} = vnode;
            
     //创建节点对象
     let dom = '';
     if(tag) {
         dom = document.createElement(tag)
        
     }

     if( attrs ){
         // 有属性值 key： className="active" title="123"
         Object.keys(attrs).forEach( key => {
             const value = attrs[key];
             setAttribute(dom, key, value)
         })
     }

     //递归渲染子节点
     if(vnode.child) {
         vnode.child.forEach( c => render(c, dom))
     }
     
     return dom;
}
//创建组件
function createComponent (comp, props) {
    let inst;
    // 如果是类定义组件，则直接返回实例, 此处暂不考虑hooks
    if ( comp.prototype && comp.prototype.render ) {
        inst = new comp( props );
    } else {
        // 如果是函数定义组件，则将其扩展为类定义组件
        inst = new React.Component( props );
        inst.constructor = comp;
        inst.render = function() {
            return this.constructor( props );
        }
    }

    return inst;
}

function setComponentProps (comp, props) {
    if(!comp._dom) {
        //实例对象的 constructor === 我们的class组件
        const fun = comp.constructor;
        if(fun.getDerivedStateFromProps) {
            fun.getDerivedStateFromProps(props, comp.state);
        }
    }
    comp.props = props;
    renderComponent(comp)
}

export function renderComponent (comp) {
    let _dom;
    if ( comp._dom ) {
        //comp 是react 类的实例。实例的constructor是就是react类
        const fun = comp.constructor; 
        if ( fun.getDerivedStateFromProps ) fun.getDerivedStateFromProps(comp.props, comp.state);
        if ( comp.shouldComponentUpdate ) {
           const isReload = comp.shouldComponentUpdate()
           if(!isReload) {
                return null;
           }
        }
    }
    //获取虚拟dom
    const vnode = comp.render();
    console.log('vnode', vnode);
    _dom = _renderVnode(vnode);

    if ( comp._dom && comp._dom.parentNode ) {
        comp._dom.parentNode.replaceChild( _dom, comp._dom );
    }

    if(!comp._dom) {
        //在render后触发 componentDidMount
        if ( comp.componentDidMount ) comp.componentDidMount();
        // getSnapshotBeforeUpdate componentDidUpdate componentWillUnmount实现思路是和上面是一样
    }
    comp._dom = _dom;
}



//设置属性
export function setAttribute(dom, key, value) {
    
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

const ReactDOM = {
    render
}
export default ReactDOM
```
demo地址[github](https://github.com/iwen-pengh/mini-react-step2) 

下篇文章继续介绍剩下的内容：
- React setState
- React更新的时候diff算法







