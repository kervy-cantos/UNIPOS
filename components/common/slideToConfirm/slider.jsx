import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import SlideToConfirm from 'rn-slide-to-confirm';

const Slider = ({ totalItems, totalPrice, sliderState, setSliderState }) => {
	const router = useRouter();
	console.log('sliderState', sliderState);
	return (
		<View>
			<Text style={{ textAlign: 'center', fontSize: 16, color: 'white' }}>Slide to Checkout</Text>
			<SlideToConfirm
				unconfimredTipText={`Total Items: ${totalItems} | Total Price: ${totalPrice}`}
				unconfirmedTipTextStyle={{
					color: 'white',
					fontSize: 16
				}}
				confirmedTipText={'Checking Out...'}
				onSlideEnd={() => setSliderState(false)}
				confirmedTipTextStyle={{
					color: 'white',
					fontSize: 18
				}}
				goToBackDuration={100}
				state={sliderState}
				onSlideConfirmed={() => {
					setSliderState(true);
					router.push('/CheckOut');
					setSliderState(false);
				}}
				sliderStyle={{
					justifyContent: 'center',
					width: 400,
					height: 40,
					marginBottom: 20,
					borderRadius: 8,
					borderTopLeftRadius: 15,
					borderBottomLeftRadius: 15,
					overflow: 'hidden'
				}}
			/>
		</View>
	);
};

export default Slider;
