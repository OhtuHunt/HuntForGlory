import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import React from "react";
import ReactDOM from "react-dom";
import { Card, CardBody } from "react-simple-card";

const GenerateCard = ({ title, questType, points }) => {
  return (
    <div>
      <a href="/">
        <Card>
          <CardBody>
            <h2>{title}</h2>
            <table>
              <tbody>
                <tr>
                  <td className="questType">{questType}</td>
                  <td className="points">{points}</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </a>
    </div>
  );
};
const App = () => (
  <div>
    <GenerateCard
      title="Käy laitoksella"
      questType="Solo-quest"
      points="10"
    />
    <GenerateCard
      title="Käy lounaalla"
      questType="team-quest"
      points="10"
    />
    <GenerateCard
      title="Anna Artolle yläfemma"
      questType="You know what to do!"
      points="100"
    />
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
