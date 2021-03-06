function render (vnode, container) {
    if(typeof vnode.tag === 'function' ) {
        _renderComp(vnode, container);
    }else {
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