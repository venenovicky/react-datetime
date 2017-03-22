'use strict';

var React = require('react'),
	onClickOutside = require('react-onclickoutside');
	
var DOM = React.DOM;
var DateTimePickerHours = onClickOutside(React.createClass({
	
	render: function() {

		var date = this.props.selectedDate || this.props.viewDate;
		var tableChildren;

		tableChildren = [
			DOM.thead({ key: 'head' }, DOM.tr({},
				DOM.th({ className: 'rdtSwitch', colSpan: 4, onClick: this.props.dateFormat ? this.props.showView( 'days' ) : null }, this.props.dateFormat ? date.format( this.props.dateFormat ) : date.format( this.props.timeFormat ) )
			)),
			DOM.tbody({ key: 'hours' }, this.renderHours())
		];

		return DOM.div({ className: 'rdtYears' },
			DOM.table({}, tableChildren )
		);
	},

	renderHours: function() {
		var date = this.props.selectedDate,
			month = this.props.viewDate.month(),
			year = this.props.viewDate.year(),
			day  = this.props.viewDate.date(),
			hour = this.props.viewDate.hour(),
			rows = [],
			i = 0,
			hours = [],
			renderer = this.props.renderHour || this.renderHour,		
			classes, props,  isDisabled
		;
		var timeConstraints = (this.props.timeConstraints && this.props.timeConstraints.hours) ? this.props.timeConstraints.hours : {};
		var max = timeConstraints.max || 23,
			min = timeConstraints.min || 0;

		while (i < 24) {
			classes = 'rdtHour';
			
			isDisabled = (i >= min && i <= max) ? false : true;

			if ( isDisabled )
				classes += ' rdtDisabled';

			if ( date && i === date.hour())
				classes += ' rdtActive';

			props = {
				key: i,
				'data-value': i,
				className: classes
			};
			if ( !isDisabled )
				props.onClick = this.updateSelectedHour;

			hours.push( renderer( props, i, day, month, year, date && date.clone() ) );

			if ( hours.length === 4 ) {
				rows.push( DOM.tr({ key: hour + '_' + rows.length }, hours ) );
				hours = [];
			}

			i++;
		}

		return rows;
	},

	updateSelectedHour: function( event ) {
		this.props.updateSelectedDate( event, true );
	},

	renderHour: function( props, hour ) {
		hour = (hour<10) ? ('0' +hour) : hour;
		return DOM.td( props, hour + ':00' );
	},

	alwaysValidDate: function() {
		return 1;
	},

	handleClickOutside: function() {
    	this.props.handleClickOutside();
  	}
}));
module.exports = DateTimePickerHours;
