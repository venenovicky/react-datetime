var DateTime = require('../DateTime.js');
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(
  React.createElement(DateTime, {
    dateFormat: true,
    timeFormat: true,
    disableManualEdit: true,
    timeConstraints: {
    	hours: {
    		min: 10,
    		max: 16
    	},
    	minutes: {
    		min: 20,
    		max: 50
    	}
    },
    isValidDate: function(current) {
      return true;
    }
  }),
  document.getElementById('datetime')
);
