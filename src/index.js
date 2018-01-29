import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import React from "react";
import ReactDOM from "react-dom";
import { Card, CardBody } from "react-simple-card";
import axios from "axios";

const GenerateCard = ({ title, questType, points }) => {
    return (
        <div>
            <button style={{width:'100%'}}>
                <Card>
                    <CardBody>
                        <h2>{title}</h2>
                        <table style={{width: '100%'}}>
                            <tbody>
                                <tr>
                                    <td className="questType">{questType}</td>
                                    <td className="points">{points}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </button>
        </div>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            quests: [],

        }
    }

    componentWillMount() {
        axios
          .get('http://localhost:3001/api/quests')
          .then(response => {
            this.setState({ quests: response.data })
          })
      }

    render() {
        return (
        <div>
            {this.state.quests.map(quest => <GenerateCard
                key={quest.id}
                title={quest.name}
                questType={quest.type}
                points={quest.points}
            />)}
        </div>
        )
    }
};

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
