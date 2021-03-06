import Component from './Component'
function createElement (tag, attrs, ...child) {
    return {
        tag, //外层的标签 or 组件
        attrs, // 标签的属性 or  组件的props
        child // 子节点 or 子组件
    }
}
const React = {
    createElement,
    Component
}
export default React