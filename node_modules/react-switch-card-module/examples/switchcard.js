/**
 * @authors  (duke 365650070@qq.com)
 * @date    2016-11-21 16:49:09
 * @version $Id$
 */

const React = require('react');
const ReactDOM = require('react-dom');
const SwitchCard = require('react-switch-card-module');

const Test = React.createClass({
  render() {
    return (<div>
      <SwitchCard />
    </div>);
  }
});

ReactDOM.render(<Test />, document.getElementById('__react-content'));
