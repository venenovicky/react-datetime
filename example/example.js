var DateTime = require('../DateTime.js');
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(
  React.createElement(DateTime, {
    dateFormat: false,
    timeFormat: true,
    value: 1490159333998,
    isValidDate: function(current) {
      return true;
    }
  }),
  document.getElementById('datetime')
);
