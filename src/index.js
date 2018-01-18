import './index.css';
import registerServiceWorker from './registerServiceWorker';
import React from 'react'
import ReactDOM from 'react-dom'

const Quest = (props) => {

    const { quests } = props
    const lines = () => quests.map(quest => <a href="localhost:3000"><li key={quest.id}>{quest.content} {quest.done}</li></a>)

    return (
        <div>
            <h1>Tehtävät</h1>
            <ul>
                {lines()}
            </ul>
        </div>
    )
}

const App = () => {
    const quests = [
        {
            id: 1,
            content: 'Käy laitoksella',
            done: true
        },
        {
            id: 2,
            content: 'Syö lounasta',
            done: false
        },
        {
            id: 3,
            content: 'Moikkaa kurssikaveria',
            done: true
        },
    ]  

    return (
        <div>
            <Quest quests={quests} />
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();