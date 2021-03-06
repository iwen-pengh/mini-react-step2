import React from './react';
import ReactDOM from './react-dom'
//如果是jsx对象
const JSX = (
    <div className="active" title="123">
        hello,<span>mini react</span>
    </div>
)

class Comp extends React.Component {
    render() {
        return (
            <div className="active" title="123">
                hello,<span>mini react</span>
            </div>
        )
    }
}


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

function Fun () {
    return (
        <div className="active" title="123">
                hello,<span>mini react</span>
        </div>
    )
}


ReactDOM.render(<Counter abc="123" />, document.querySelector('#app'));