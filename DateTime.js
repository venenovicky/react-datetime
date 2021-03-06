'use strict';

var assign = require('object-assign'),
	moment = require('moment'),
	React = require('react'),
	createReactClass = require('create-react-class'),
	CalendarContainer = require('./src/CalendarContainer'),
	PropTypes = require('prop-types'),
	DOM = require('react-dom-factories')
;

// var PropTypes = React.PropTypes;
var Datetime = createReactClass({
	propTypes: {
		// value: PropTypes.object | PropTypes.string,
		// defaultValue: PropTypes.object | PropTypes.string,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onChange: PropTypes.func,
		locale: PropTypes.string,
		utc: PropTypes.bool,
		input: PropTypes.bool,
		// dateFormat: PropTypes.string | PropTypes.bool,
		// timeFormat: PropTypes.string | PropTypes.bool,
		inputProps: PropTypes.object,
		timeConstraints: PropTypes.object,
		viewMode: PropTypes.oneOf(['years', 'months', 'days', 'time', 'hours', 'minutes']),
		isValidDate: PropTypes.func,
		open: PropTypes.bool,
		strictParsing: PropTypes.bool,
		closeOnSelect: PropTypes.bool,
		closeOnTab: PropTypes.bool
	},

	getDefaultProps: function() {
		var nof = function() {};
		return {
			className: '',
			defaultValue: '',
			inputProps: {},
			input: true,
			onFocus: nof,
			onBlur: nof,
			onChange: nof,
			timeFormat: true,
			timeConstraints: {},
			dateFormat: true,
			strictParsing: true,
			closeOnSelect: false,
			closeOnTab: true,
			utc: false
		};
	},

	getInitialState: function() {
		var state = this.getStateFromProps( this.props );

		if ( state.open === undefined )
			state.open = !this.props.input;

		state.currentView = this.props.dateFormat ? (this.props.viewMode || state.updateOn || 'days') : 'hours';

		return state;
	},

	getStateFromProps: function( props ) {
		var formats = this.getFormats( props ),
			date = props.value || props.defaultValue,
			selectedDate, viewDate, updateOn, inputValue
		;

		if ( date && typeof date === 'string' )
			selectedDate = this.localMoment( date, formats.datetime );
		else if ( date )
			selectedDate = this.localMoment( date );

		if ( selectedDate && !selectedDate.isValid() )
			selectedDate = null;

		viewDate = selectedDate ?
			selectedDate.clone().startOf('month') :
			this.localMoment().startOf('month')
		;

		updateOn = this.getUpdateOn(formats);

		if ( selectedDate )
			inputValue = selectedDate.format(formats.datetime);
		else if ( date.isValid && !date.isValid() )
			inputValue = '';
		else
			inputValue = date || '';

		return {
			updateOn: updateOn,
			inputFormat: formats.datetime,
			viewDate: viewDate,
			selectedDate: selectedDate,
			inputValue: inputValue,
			open: props.open
		};
	},

	getUpdateOn: function( formats ) {
		if ( formats.date.match(/[lLD]/) ) {
			return 'days';
		}
		else if ( formats.date.indexOf('M') !== -1 ) {
			return 'months';
		}
		else if ( formats.date.indexOf('Y') !== -1 ) {
			return 'years';
		}

		return 'days';
	},

	getFormats: function( props ) {
		var formats = {
				date: props.dateFormat || '',
				time: props.timeFormat || ''
			},
			locale = this.localMoment( props.date, null, props ).localeData()
		;

		if ( formats.date === true ) {
			formats.date = locale.longDateFormat('L');
		}
		else if ( this.getUpdateOn(formats) !== 'days' ) {
			formats.time = '';
		}

		if ( formats.time === true ) {
			formats.time = locale.longDateFormat('LT');
		}

		formats.datetime = formats.date && formats.time ?
			formats.date + ' ' + formats.time :
			formats.date || formats.time
		;

		return formats;
	},

	componentWillReceiveProps: function( nextProps ) {
		var formats = this.getFormats( nextProps ),
			updatedState = {}
		;

		if ( nextProps.value !== this.props.value ||
			formats.datetime !== this.getFormats( this.props ).datetime ) {
			updatedState = this.getStateFromProps( nextProps );
		}

		if ( updatedState.open === undefined ) {
			if ( this.props.closeOnSelect && this.state.currentView !== 'time' ) {
				updatedState.open = false;
			} else {
				updatedState.open = this.state.open;
			}
		}

		if ( nextProps.viewMode !== this.props.viewMode ) {
			updatedState.currentView = nextProps.viewMode;
		}

		if ( nextProps.locale !== this.props.locale ) {
			if ( this.state.viewDate ) {
				var updatedViewDate = this.state.viewDate.clone().locale( nextProps.locale );
				updatedState.viewDate = updatedViewDate;
			}
			if ( this.state.selectedDate ) {
				var updatedSelectedDate = this.state.selectedDate.clone().locale( nextProps.locale );
				updatedState.selectedDate = updatedSelectedDate;
				updatedState.inputValue = updatedSelectedDate.format( formats.datetime );
			}
		}

		if ( nextProps.utc !== this.props.utc ) {
			if ( nextProps.utc ) {
				if ( this.state.viewDate )
					updatedState.viewDate = this.state.viewDate.clone().utc();
				if ( this.state.selectedDate ) {
					updatedState.selectedDate = this.state.selectedDate.clone().utc();
					updatedState.inputValue = updatedState.selectedDate.format( formats.datetime );
				}
			} else {
				if ( this.state.viewDate )
					updatedState.viewDate = this.state.viewDate.clone().local();
				if ( this.state.selectedDate ) {
					updatedState.selectedDate = this.state.selectedDate.clone().local();
					updatedState.inputValue = updatedState.selectedDate.format(formats.datetime);
				}
			}
		}

		if ( nextProps.open !== this.state.open ) {
			updatedState.open = nextProps.open;
		}

		this.setState( updatedState );
	},

	onInputChange: function( e ) {
		var value = this.props.disableManualEdit ? this.state.inputValue : (e.target === null ? e : e.target.value),
			localMoment = this.localMoment( value, this.state.inputFormat ),
			update = { inputValue: value }
		;

		if ( localMoment.isValid() && !this.props.value ) {
			update.selectedDate = localMoment;
			update.viewDate = localMoment.clone().startOf('month');
		}
		else {
			update.selectedDate = null;
		}

		return this.setState( update, function() {
			return this.props.onChange( localMoment.isValid() ? localMoment : this.state.inputValue );
		});
	},

	onInputKey: function( e ) {
		if ( e.which === 9 && this.props.closeOnTab ) {
			this.closeCalendar();
		}
	},

	showView: function( view ) {
		var me = this;
		return function() {
			me.setState({ currentView: view });
		};
	},

	setDate: function( type ) {
		var me = this,
			nextViews = {
				month: 'days',
				year: 'months'
			}
		;
		return function( e ) {
			me.setState({
				viewDate: me.state.viewDate.clone()[ type ]( parseInt(e.target.getAttribute('data-value'), 10) ).startOf( type ),
				currentView: nextViews[ type ]
			});
		};
	},

	addTime: function( amount, type, toSelected ) {
		return this.updateTime( 'add', amount, type, toSelected );
	},

	subtractTime: function( amount, type, toSelected ) {
		return this.updateTime( 'subtract', amount, type, toSelected );
	},

	updateTime: function( op, amount, type, toSelected ) {
		var me = this;

		return function() {
			var update = {},
				date = toSelected ? 'selectedDate' : 'viewDate'
			;

			update[ date ] = me.state[ date ].clone()[ op ]( amount, type );

			me.setState( update );
		};
	},

	allowedSetTime: ['hours', 'minutes', 'seconds', 'milliseconds'],
	setTime: function( type, value ) {
		var index = this.allowedSetTime.indexOf( type ) + 1,
			state = this.state,
			date = (state.selectedDate || state.viewDate).clone(),
			nextType
		;

		// It is needed to set all the time properties
		// to not to reset the time
		date[ type ]( value );
		for (; index < this.allowedSetTime.length; index++) {
			nextType = this.allowedSetTime[index];
			date[ nextType ]( date[nextType]() );
		}

		if ( !this.props.value ) {
			this.setState({
				selectedDate: date,
				inputValue: date.format( state.inputFormat )
			});
		}
		this.props.onChange( date );
	},

	updateSelectedDate: function( e, close ) {
		var target = e.target,
			modifier = 0,
			viewDate = this.state.viewDate,
			currentDate = this.state.selectedDate || viewDate,
			date
	    ;
		if (target.className.indexOf('rdtDay') !== -1) {
			if (target.className.indexOf('rdtNew') !== -1)
				modifier = 1;
			else if (target.className.indexOf('rdtOld') !== -1)
				modifier = -1;

			date = viewDate.clone()
				.month( viewDate.month() + modifier )
				.date( parseInt( target.getAttribute('data-value'), 10 ) )
				.hours( currentDate.hours() )
				.minutes( currentDate.minutes() );

		} else if (target.className.indexOf('rdtMonth') !== -1) {
			date = viewDate.clone()
				.month( parseInt( target.getAttribute('data-value'), 10 ) )
				.date( currentDate.date() )
				.hours( currentDate.hours() )
				.minutes( currentDate.minutes() );

		} else if (target.className.indexOf('rdtYear') !== -1) {
			date = viewDate.clone()
				.month( currentDate.month() )
				.date( currentDate.date() )
				.year( parseInt( target.getAttribute('data-value'), 10 ) )
				.hours( currentDate.hours() )
				.minutes( currentDate.minutes() );

		} else if (target.className.indexOf('rdtHour') !== -1) {
			date = viewDate.clone()
				.month( currentDate.month() )
				.date( currentDate.date() )
				.year( currentDate.year() )
				.hours( parseInt( target.getAttribute('data-value'), 10 ))
				.minutes( currentDate.minutes() );

		} else if (target.className.indexOf('rdtMinute') !== -1) {
			date = viewDate.clone()
				.month( currentDate.month() )
				.date( currentDate.date() )
				.year( currentDate.year() )
				.hours( currentDate.hours() )
				.minutes( parseInt( target.getAttribute('data-value'), 10 ) );
				
		}

		date.seconds( currentDate.seconds() )
			.milliseconds( currentDate.milliseconds() );
		
		if ( !this.props.value ) {
			var currentView = (this.props.timeFormat && this.state.currentView==='days') ? 'hours' : this.state.currentView;
			currentView = (this.props.timeFormat && this.state.currentView==='hours') ? 'minutes' : currentView;

			var open = this.props.timeFormat && this.props.dateFormat 
							? (this.state.currentView === 'minutes' ? false : true ) 
							: (this.props.timeFormat 
									?  (this.state.currentView === 'minutes' ? false : true )
									:  false);
			this.setState({
				selectedDate: date,
				viewDate: date.clone().startOf('month'),
				inputValue: date.format( this.state.inputFormat ),
				open: open,
				currentView: currentView				
			},()=>{
				this.props.onChange( date );
			});
		} else {
			if (this.props.timeFormat){
				if(this.state.currentView==='days') {
					this.setState({
						currentView: 'hours',
						selectedDate: date, 
						viewDate: date.clone().startOf('hours'), 
						inputValue: date.format( this.state.inputFormat )
					},()=>{
						this.props.onChange( date );						
					});
				}
				else if (this.state.currentView==='hours') {
					if(this.props.hideMinutes) {
						this.setState({
							open: false,
							selectedDate: date, 
							viewDate: date.clone().startOf('minutes'), 
							inputValue: date.format( this.state.inputFormat )
						},()=>{
							this.props.onChange( date );
							this.props.onBlur( this.state.selectedDate || this.state.inputValue );
						});	
					}
					else{
						this.setState({
							currentView: 'minutes', 
							selectedDate: date, 
							viewDate: date.clone().startOf('minutes'), 
							inputValue: date.format( this.state.inputFormat )
						},()=>{
							this.props.onChange( date );
						});	
					}					
				}
				else if (this.state.currentView==='minutes') {
					this.setState({
						open: false, 
						selectedDate: date, 
						viewDate: date.clone().startOf('seconds'), 
						inputValue: date.format( this.state.inputFormat )
					},()=>{
						this.props.onChange( date );
						this.props.onBlur( this.state.selectedDate || this.state.inputValue );
					});
				}
				else{
					this.props.onChange( date );
				}
			}
			else{
				if(this.state.currentView==='days'){
					this.setState({
						open: false, 
						selectedDate: date, 
						viewDate: date.clone().startOf('hours'), 
						inputValue: date.format( this.state.inputFormat )
					},()=>{
						this.props.onChange( date );
						this.props.onBlur( this.state.selectedDate || this.state.inputValue );
					});		
				}
				else{
					this.props.onChange( date );
				}
			}
		}
	},

	openCalendar: function() {
		if (!this.state.open) {
			this.setState({ open: true }, function() {
				this.props.onFocus();
			});
		}
	},

	closeCalendar: function() {
		this.setState({ open: false }, function () {
			this.props.onBlur( this.state.selectedDate || this.state.inputValue );
		});
	},

	handleClickOutside: function() {
		if ( this.props.input && this.state.open ) {
			this.setState({ open: false }, function() {
				this.props.onBlur( this.state.selectedDate || this.state.inputValue );
			});
		}
	},

	localMoment: function( date, format, props ) {
		props = props || this.props;
		var momentFn = props.utc ? moment.utc : moment;
		var m = momentFn( date, format, props.strictParsing );
		if ( props.locale )
			m.locale( props.locale );
		return m;
	},

	componentProps: {
		fromProps: ['value', 'isValidDate', 'renderDay', 'renderMonth', 'renderYear', 'timeConstraints'],
		fromState: ['viewDate', 'selectedDate', 'updateOn'],
		fromThis: ['setDate', 'setTime', 'showView', 'addTime', 'subtractTime', 'updateSelectedDate', 'localMoment', 'handleClickOutside']
	},

	getComponentProps: function() {
		var me = this,
			formats = this.getFormats( this.props ),
			props = {dateFormat: formats.date, timeFormat: formats.time}
		;

		this.componentProps.fromProps.forEach( function( name ) {
			props[ name ] = me.props[ name ];
		});
		this.componentProps.fromState.forEach( function( name ) {
			props[ name ] = me.state[ name ];
		});
		this.componentProps.fromThis.forEach( function( name ) {
			props[ name ] = me[ name ];
		});

		return props;
	},

	render: function() {
		var className = 'rdt' + (this.props.className ?
                  ( Array.isArray( this.props.className ) ?
                  ' ' + this.props.className.join( ' ' ) : ' ' + this.props.className) : ''),
			children = []
		;

		if ( this.props.input ) {
			children = [ DOM.input( assign({
				key: 'i',
				type: 'text',
				className: 'form-control',
				onFocus: this.openCalendar,
				onChange: this.onInputChange,
				onKeyDown: this.onInputKey,
				value: this.state.inputValue
			}, this.props.inputProps ))];
		} else {
			className += ' rdtStatic';
		}

		if ( this.state.open )
			className += ' rdtOpen';

		return DOM.div({className: className}, children.concat(
			DOM.div(
				{ key: 'dt', className: 'rdtPicker' },
				React.createElement( CalendarContainer, {view: this.state.currentView, viewProps: this.getComponentProps(), onClickOutside: this.handleClickOutside })
			)
		));
	}
});

// Make moment accessible through the Datetime class
Datetime.moment = moment;

module.exports = Datetime;
