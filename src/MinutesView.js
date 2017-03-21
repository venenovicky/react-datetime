'use strict';

var React = require('react'),
	onClickOutside = require('react-onclickoutside');

var DOM = React.DOM;
var DateTimePickerMinutes = onClickOutside(React.createClass({
	
	render: function() {

		var date = this.props.selectedDate || this.props.viewDate;
		var tableChildren;

		tableChildren = [
			DOM.thead({ key: 'head' }, DOM.tr({},
				DOM.th({ className: 'rdtSwitch', colSpan: 4, onClick: this.props.showView( 'hours' ) }, date.format( this.props.dateFormat ) )
			)),
			DOM.tbody({ key: 'minutes' }, this.renderMinutes())
		];

		return DOM.div({ className: 'rdtYears' },
			DOM.table({}, tableChildren )
		);
	},

	renderMinutes: function() {
		var date = this.props.selectedDate ,
			month = this.props.viewDate.month(),
			year = this.props.viewDate.year(),
			day  = this.props.viewDate.date(),
			hour = this.props.viewDate.hour(),
			minute = this.props.viewDate.minute(),
			rows = [],
			i = 0,
			minutes = [],
			renderer = this.props.renderMinute || this.renderMinute,
			classes, props, isDisabled
		;

		var timeConstraints = (this.props.timeConstraints && this.props.timeConstraints.minutes) ? this.props.timeConstraints.minutes : {};
		var	max = timeConstraints.max || 59,
			min = timeConstraints.min || 0;

		while (i < 60) {
			classes = 'rdtMinute';

			isDisabled = (i >= min && i <= max) ? false : true;

			if ( isDisabled )
				classes += ' rdtDisabled';

			if ( date && i === date.minute() && hour === date.hour())
				classes += ' rdtActive';

			props = {
				key: i,
				'data-value': i,
				className: classes
			};
			if ( !isDisabled )
				props.onClick = this.updateSelectedMinute;
			hour = date ? date.hour() : hour;
			minutes.push( renderer( props, i, hour, day, month, year, date && date.clone() ) );

			if ( minutes.length === 4 ) {
				rows.push( DOM.tr({ key: minute + '_' + rows.length }, minutes ) );
				minutes = [];
			}
			i=i+5;
		}

		return rows;
	},

	updateSelectedMinute: function( event ) {
		this.props.updateSelectedDate( event, true );
	},

	renderMinute: function( props, minute, hour ) {
		hour = (hour <10) ? '0' + hour : hour;
		minute = (minute<10) ? ('0' +minute) : minute;
		return DOM.td( props, hour + ':' + minute );
	},

	alwaysValidDate: function() {
		return 1;
	},

	handleClickOutside: function() {
    	this.props.handleClickOutside();
  	}
}));
module.exports = DateTimePickerMinutes;
