var React = require('react'),
  DaysView = require('./DaysView'),
  MonthsView = require('./MonthsView'),
  YearsView = require('./YearsView'),
  TimeView = require('./TimeView'),
  HoursView = require('./HoursView'),
  MinutesView = require('./MinutesView')
;

var CalendarContainer = React.createClass({
	viewComponents: {
		days: DaysView,
		months: MonthsView,
		years: YearsView,
		time: TimeView,
    hours: HoursView,
    minutes: MinutesView
	},

  render: function() {
    return React.createElement( this.viewComponents[ this.props.view ], this.props.viewProps );
  }
});

module.exports = CalendarContainer;
