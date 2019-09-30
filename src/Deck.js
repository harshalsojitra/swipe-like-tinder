import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
//if user sipe till 0.25% (25% screen swipe) then picture consider as a liked. 
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;   
//animation time when a card swipe out (in milli seconds).
const SWIPE_OUT_DURATION = 250;

//extra comments..
//at line 150) --> we use reverse beacuse stack works as last in and first out. so element as last show-up as first. so simply reverse all code.
//at line 169) --> //if we apply position absolute that allow use to donot show app as list and show us as stack.
class Deck extends Component{
	static defaultProps = {
		onSwipeRight: () => {}, 
		onSwipeLeft: () => {}
	};

	constructor(props)
	{
		super(props);

		const position = new Animated.ValueXY();

		//an instance of panresponder👇
		const panResponder =  PanResponder.create({
			//execute anytime user taps on the screen. 
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (event, gesture) => {
			// the value of x and y after user move finger on it.here gesture know position and update by serValue to the animation. 
				position.setValue( {x: gesture.dx, Y: gesture.dy} );
			},
			onPanResponderRelease: (event, gesture) => {
				if(gesture.dx > SWIPE_THRESHOLD)
				{	
				//insted of right or left we just made an forceSwipe that parameter is right.
					this.forceSwipe('right');
				}

				else if(gesture.dx < -SWIPE_THRESHOLD)
				{
					this.forceSwipe('left');
				}

				else
				{
					this.resetPosition();
				}
			}
		});

		//everytime we assign an panresponder we have to use👇
		this.state = { panResponder, position , index: 0};
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.data !== this.props.data)
		{
			this.setState( {index: 0} );
		}
	}

	componentWillUpdate()
	{
		UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		LayoutAnimation.spring();	
	}

	forceSwipe(direction)
	{	
	//If direction === 'right' is true then we return SCREEN_WIDTH otherwise return -SCREEN_WIDTH (turnary expression)
		const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
		//same as Animate.spring but we have to use timing and pass the value of duration.
		Animated.timing(this.state.position, {
			toValue: { x, y: 0 },
			duration: SWIPE_OUT_DURATION
			//after 250ms time then we want next card to be display on screen
		}).start( () => this.onSwipeComplete(direction));
	}

	onSwipeComplete(direction)
	{	
		const { onSwipeLeft, onSwipeRight, data } = this.props;
		//we are taking data from props and see that state where we put index as 0.
		const item = data[this.state.index];

		direction === 'right'? onSwipeRight(item) : onSwipeLeft(item);
		//when card got swipe we want forcibly to set the value as 0 and 0. so another card can render on screen.
		this.state.position.setValue( {x: 0, y:0 } );	
		//we setState index +1 after completion of 1'st image.
		this.setState( {index: this.state.index + 1} );
	}

	// forceSwipeLeft()
	// {
	// 	//same as Animate.spring but we have to use timing and pass the value of duration.
	// 	Animated.timing(this.state.position, {
	// 		toValue: { x: -SCREEN_WIDTH , y: 0 },
	// 		duration: SWIPE_OUT_DURATION
	// 	}).start();
	// }

	resetPosition()
	{
		Animated.spring(this.state.position, {
			toValue: {x: 0, y: 0}
		}).start();
	}

	getCardStyle()
	{
		//just destruture by making const { position } so we dont have to specity each time we use position👇
		const { position } = this.state;
		//down the position stand for Animated.ValueXY();

		const rotate = position.x.interpolate({
		//input here is -SCREEN_WIDTH when user touches anyhing it goes to input and according to that input it output the range. like if input (user select) -300 then animation should be -90deg (which is perform device itself). 
			inputRange: [ -SCREEN_WIDTH*1.5, 0, SCREEN_WIDTH*	1.5],
		//animation was faster than we expected. so 1.5 assure it have to move 1.5 slow then usual.
			outputRange: ['-120deg', '0deg' , '120deg']
		});

		return {
			...position.getLayout(),
			transform: [{ rotate }]
		};
	}

	renderCards()
	{
		//when every card got rendered and none of card needs to saw on the screen then use this.
		if( this.state.index >= this.props.data.length)
		{
			return this.props.renderNoMoreCards();
		}

		//i is an index of App.js
		return this.props.data.map(( item, i) => {
			//if i is < than this.state.index. then simply return null;
			if(i < this.state.index)
			{
				return null;
			}

			//but if i that come from App is equals to this.state.index them return all the animation card and stuff on screen.
 			if(i === this.state.index)
			{
				return(
					<Animated.View
						key = {item.id}						
						style = {[this.getCardStyle() , styles.cardStyle, { zIndex: 99 }]}
						{ ...this.state.panResponder.panHandlers}
					>

						{ this.props.renderCard(item)}
					</Animated.View>
					); 
			}

			return ( 
				<Animated.View 
					key= {item.id} 
					 style={[styles.cardStyle, { top: 10 * (i - this.state.index),zIndex: i * -10 }]}
					  >
					{ this.props.renderCard(item) }
				</Animated.View>					
				);
		});
	}

	render()
	{
		return (
			<View>
				{this.renderCards()}
			</View>
			);
	}
}

const styles = {
	cardStyle: {
		position: 'absolute',
		width: SCREEN_WIDTH
	}
};

export default Deck;