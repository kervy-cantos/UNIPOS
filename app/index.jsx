import { useState, useEffect } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, PermissionsAndroid } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { COLORS, icons, images, SIZES } from '../constants';
import { ScreenHeaderBtn, Welcome } from '../components';
import { Icon } from '@rneui/themed';
import NetInfo from '@react-native-community/netinfo';
import { syncData } from '../utils/syncUtils';
import { useAuthStore, useCartStore } from '../hooks/zustand/store';
import Slider from '../components/common/slideToConfirm/slider';

const requestBluetoothPermission = async () => {
	try {
		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
			title: 'Cool Photo App Camera Permission',
			message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
			buttonNeutral: 'Ask Me Later',
			buttonNegative: 'Cancel',
			buttonPositive: 'OK'
		});
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log('You can use the camera');
		} else {
			console.log('Camera permission denied');
		}
	} catch (err) {
		console.warn(err);
	}
};
const requestBluetoothScanPermission = async () => {
	try {
		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
			title: 'Cool Photo App Camera Permission',
			message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
			buttonNeutral: 'Ask Me Later',
			buttonNegative: 'Cancel',
			buttonPositive: 'OK'
		});
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log('You can use the camera');
		} else {
			console.log('Camera permission denied');
		}
	} catch (err) {
		console.warn(err);
	}
};
const requestCoarseLocation = async () => {
	try {
		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
			title: 'Cool Photo App Camera Permission',
			message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
			buttonNeutral: 'Ask Me Later',
			buttonNegative: 'Cancel',
			buttonPositive: 'OK'
		});
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log('You can use the camera');
		} else {
			console.log('Camera permission denied');
		}
	} catch (err) {
		console.warn(err);
	}
};
const requestFineLocation = async () => {
	try {
		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
			title: 'Cool Photo App Camera Permission',
			message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
			buttonNeutral: 'Ask Me Later',
			buttonNegative: 'Cancel',
			buttonPositive: 'OK'
		});
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log('You can use the camera');
		} else {
			console.log('Camera permission denied');
		}
	} catch (err) {
		console.warn(err);
	}
};

export default function Index() {
	const [totalItems, setTotalItems] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);
	const [isGranted, setIsGranted] = useState(false);
	const [sliderState, setSliderState] = useState(false);
	const { user, userProfile } = useAuthStore(state => state);
	const router = useRouter();
	const { data: cart } = useCartStore(state => state);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			if (state.isConnected) {
				syncData();
			}
		});

		return () => unsubscribe();
	}, []);
	useEffect(() => {
		if (!isGranted) {
			const checkPerms = async () => {
				const grantedConnect = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
				const grantedScan = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
				const grantedCoarse = await PermissionsAndroid.check(
					PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
				);
				const grantedFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
				if (!grantedConnect) {
					requestFineLocation();
				}
				if (!grantedScan) {
					requestBluetoothScanPermission();
				}
				if (!grantedCoarse) {
					requestCoarseLocation();
				}
				if (!grantedFine) {
					requestFineLocation();
				}
				if (grantedCoarse && grantedFine && grantedScan && grantedConnect) {
					return true;
				} else {
					return false;
				}
			};
			checkPerms().then(res => setIsGranted(res));
		}
	}, []);

	useEffect(() => {
		let t = 0;
		let p = 0;
		cart.forEach(item => {
			t += item.quantity;
		});
		cart.forEach(item => {
			p += item.quantity * item.price;
		});
		setTotalPrice(p);
		setTotalItems(t);
	}, [JSON.stringify(cart)]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						flex: 1,
						padding: SIZES.medium
					}}>
					<Welcome />
				</View>
			</ScrollView>

			{cart.length > 0 && (
				<View style={styles.total}>
					<View>
						<Slider
							totalItems={totalItems}
							totalPrice={'₱' + ' ' + totalPrice}
							sliderState={sliderState}
							setSliderState={setSliderState}
						/>
					</View>
				</View>
			)}
			<View style={styles.footer}>
				<Text style={styles.footerText}>CopyRight 2024</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	total: {
		position: 'absolute',
		bottom: 50,
		width: '100%',
		height: 80,
		backgroundColor: COLORS.secondary,
		opacity: 0.8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	totalText: {
		color: 'white',
		fontSize: 16
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		height: 60,
		backgroundColor: COLORS.tertiary,
		justifyContent: 'center',
		alignItems: 'center'
	},
	footerText: {
		color: COLORS.lightWhite,
		fontSize: SIZES.font
	}
});
