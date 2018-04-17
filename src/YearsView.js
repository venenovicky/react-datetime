'use strict';

var React = require('react'),
	createReactClass = require('create-react-class'),
	onClickOutside = require('react-onclickoutside'),
	DOM = require('react-dom-factories')
;

// var DOM = React.DOM;
var DateTimePickerYears = onClickOutside( createReactClass({
	render: function() {
		var year = parseInt( this.props.viewDate.year() / 10, 10 ) * 10;

		return DOM.div({ className: 'rdtYears' }, [
			DOM.table({ key: 'a' }, DOM.thead({}, DOM.tr({}, [
				DOM.th({ key: 'prev', className: 'rdtPrev' }, DOM.span({ onClick: this.props.subtractTime( 10, 'years' )}, '‹' )),
				DOM.th({ key: 'year', className: 'rdtSwitch', onClick: this.props.showView( 'years' ), colSpan: 2 }, year + '-' + ( year + 9 ) ),
				DOM.th({ key: 'next', className: 'rdtNext' }, DOM.span({ onClick: this.props.addTime( 10, 'years' )}, '›' ))
				]))),
			DOM.table({ key: 'years' }, DOM.tbody( {}, this.renderYears( year )))
		]);
	},

	renderYears: function( year ) {
		var years = [],
			i = -1,
			rows = [],
			renderer = this.props.renderYear || this.renderYear,
			selectedDate = this.props.selectedDate,
			isValid = this.props.isValidDate || this.alwaysValidDate,
			classes, props, currentYear, isDisabled, noOfDaysInYear, daysInYear, validDay,
			// Month and date are irrelevant here because
			// we're only interested in the year
			irrelevantMonth = 0,
			irrelevantDate = 1
		;

		year--;
		while (i < 11) {
			classes = 'rdtYear';
			currentYear = this.props.viewDate.clone().set(
				{ year: year, month: irrelevantMonth, date: irrelevantDate } );

			// Not sure what 'rdtOld' is for, commenting out for now as it's not working properly
			// if ( i === -1 | i === 10 )
				// classes += ' rdtOld';

			noOfDaysInYear = currentYear.endOf( 'year' ).format( 'DDD' );
			daysInYear = Array.from({ length: noOfDaysInYear }, function( e, i ) {
				return i + 1;
			});

			validDay = daysInYear.find(function( d ) {
				var day = currentYear.clone().dayOfYear( d );
				return isValid( day );
			});

			isDisabled = ( validDay === undefined );

			if ( isDisabled )
				classes += ' rdtDisabled';

			if ( selectedDate && selectedDate.year() === year )
				classes += ' rdtActive';

			props = {
				key: year,
				'data-value': year,
				className: classes
			};

			if ( !isDisabled )
				props.onClick = ( this.props.updateOn === 'years' ?
					this.updateSelectedYear : this.props.setDate('year') );

			years.push( renderer( props, year, selectedDate && selectedDate.clone() ));

			if ( years.length === 4 ) {
				rows.push( DOM.tr({ key: i }, years ) );
				years = [];
			}

			year++;
			i++;
		}

		return rows;
	},

	updateSelectedYear: function( event ) {
		this.props.updateSelectedDate( event );
	},

	renderYear: function( props, year ) {
		return DOM.td( props, year );
	},

	alwaysValidDate: function() {
		return 1;
	},

  handleClickOutside: function() {
    this.props.handleClickOutside();
  }
}));

module.exports = DateTimePickerYears;
