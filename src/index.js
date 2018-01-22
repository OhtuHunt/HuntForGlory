import './index.css';
import registerServiceWorker from './registerServiceWorker';
import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";

const GenerateCard = ({ title, text }) => {
    return (
        <div>
        <Card>
            <CardBody>
                <h2>{title}</h2>
                <p>{text}</p>
            </CardBody>
        </Card>
        </div>
    )
}
const App = () => (
    <div>
        <GenerateCard title="Käy laitoksella" text="Käy laitoksella huoneessa BK112 ja anna taululla lukeva koodi" />
        <GenerateCard title="Käy lounaalla" text="Käy laitoksella kanssaopiskelijan kanssa" />
        <GenerateCard title="Anna Artolle yläfemma" text="You know what to do!" />
    </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();