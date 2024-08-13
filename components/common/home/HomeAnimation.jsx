import { useRef, useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function HomeAnimation() {
	const animation = useRef(null);
	useEffect(() => {}, []);

	return (
		<View style={styles.animationContainer}>
			<LottieView
				autoPlay
				ref={animation}
				style={{
					width: 200,
					height: 200,
					backgroundColor: 'transparent'
				}}
				// Find more Lottie files at https://lottiefiles.com/featured
				source={require('../../../assets/gradientBall.json')}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	animationContainer: {
		backgroundColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1
	},
	buttonContainer: {
		paddingTop: 20
	}
});
