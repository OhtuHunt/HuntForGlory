/**
 * @authors  (duke 365650070@qq.com)
 * @date    2016-11-21 11:44:01
 * @version $Id$
 */

const React = require('react');
const classNames = require('classnames');
const ReactSwipe = require('react-swipe');

const SwitchCard = React.createClass({
  render() {
    const trimClass = classNames({
      'test': true
    });
    return (
      <div>
        <ReactSwipe className={trimClass} style={{width: '300px', height: '100px'}} swipeOptions={{continuous: false}}>
          <div>PANE 1</div>
          <div>PANE 2</div>
          <div>PANE 3</div>
        </ReactSwipe>
      </div>
    );
  }
});

module.exports = SwitchCard;
