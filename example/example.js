var DateTime = require('../DateTime.js');
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(
  React.createElement(DateTime, {
    dateFormat: 'MMM D, YYYY HH:mm',
    isValidDate: function(current) {
      return true;
    }
  }),
  document.getElementById('datetime')
);
