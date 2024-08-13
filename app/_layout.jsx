import { Stack, useRouter, Slot, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { COLORS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Button, TouchableOpacity, Text, Alert } from 'react-native';

import { app } from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuthStore } from '../hooks/zustand/store';
import Welcome from './Auth/Welcome';
import { Icon } from '@rneui/themed';

export default function RootLayout() {
	const [user, setUser] = useState(null);
	const [authChecked, setAuthChecked] = useState(false); // Track if auth check is completed
	const { setUserProfile, user: userReady } = useAuthStore();
	const firebaseAuth = getAuth(app);
	const router = useRouter(); // Access navigation object
	const { logout } = useAuthStore(state => state);
	const navigation = useNavigation();
	const [fontsLoaded] = useFonts({
		DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
		DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
		DMRegular: require('../assets/fonts/DMSans-Regular.ttf')
	});

	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded) {
			console.log('Fonts loaded, hiding splash screen');
			await SplashScreen.hideAsync();
		} else {
			console.log('Fonts not yet loaded');
		}
	}, [fontsLoaded]);

	useEffect(() => {
		onAuthStateChanged(firebaseAuth, user => {
			setUser(user); // Set user state
			setAuthChecked(true); // Set auth check completed
		});
	}, []);

	useEffect(() => {
		if (user) {
			useAuthStore.setState({ user });
			setUserProfile(user);
		}
	}, [user]);

	if (!fontsLoaded || !authChecked) {
		console.log('Waiting for fonts to load or auth check to complete...');
		return null;
	}

	const handleLogout = async () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{
				text: 'Cancel',
				onPress: () => console.log('Cancel Pressed'),
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: () => {
					signOut(firebaseAuth);
				}
			}
		]);
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
			{!user ? <Welcome /> : null}
			<Drawer
				screenOptions={{
					headerStyle: {
						backgroundColor: COLORS.primary
					},
					headerTintColor: COLORS.white,
					drawerStyle: {
						width: 240,
						backgroundColor: 'transparent' // Make the background transparent to show the gradient
					},
					drawerLabelStyle: {
						fontFamily: 'DMMedium',
						fontSize: 18,
						color: COLORS.white // Ensure text color is white or a visible color against the gradient
					},
					drawerActiveTintColor: COLORS.primary,
					drawerInactiveTintColor: COLORS.darkGray,
					drawerItemStyle: {
						marginVertical: 5
					},
					headerRight: () => (
						<TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
							<Text style={{ color: COLORS.white, fontSize: 16 }}>Logout</Text>
						</TouchableOpacity>
					)
				}}
				drawerContent={props => (
					<LinearGradient
						colors={[COLORS.tertiary, '#ffaf7b']} // Gradient colors
						style={{ flex: 1 }}>
						<DrawerContentScrollView {...props}>
							<DrawerItemList {...props} />
						</DrawerContentScrollView>
					</LinearGradient>
				)}>
				<Drawer.Screen
					name='index'
					options={{
						drawerLabel: 'Home',
						title: 'Home',
						drawerItemStyle: { marginTop: 50 },
						drawerIcon: ({ focused, color, size }) => (
							<Ionicons name='home' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
				<Drawer.Screen
					name='AddCategory'
					options={{
						drawerLabel: 'Add Category',
						title: 'Add Category',
						drawerIcon: ({ focused, color, size }) => (
							<Ionicons name='add' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
				<Drawer.Screen
					name='AddProduct'
					options={{
						drawerLabel: 'Add Product',
						title: 'Add Product',
						drawerIcon: ({ focused, color, size }) => (
							<Ionicons name='add' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
				<Drawer.Screen
					name='Inventory'
					options={{
						drawerLabel: 'Inventory',
						title: 'Inventory',
						drawerIcon: ({ focused, color, size }) => (
							<Ionicons name='list' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
				<Drawer.Screen
					name='CheckOut'
					options={{
						drawerLabel: 'CheckOut',
						title: 'CheckOut',
						drawerItemStyle: { display: 'none' }
					}}
				/>
				<Drawer.Screen
					name='Auth/Welcome'
					options={{
						drawerLabel: 'null',
						title: 'null',
						drawerItemStyle: { display: 'none' }
					}}
				/>
				<Drawer.Screen
					name='Profile'
					options={{
						drawerLabel: 'Profile',
						title: 'Profile',
						header: () => null,
						drawerIcon: ({ focused, color, size }) => (
							<Icon name='user-circle-o' type='font-awesome' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
				<Drawer.Screen
					name='Printers'
					options={{
						drawerLabel: 'Printers',
						title: 'Printers',

						drawerIcon: ({ focused, color, size }) => (
							<Icon name='printer' type='ant-design' size={size} color={COLORS.lightWhite} />
						)
					}}
				/>
			</Drawer>
		</GestureHandlerRootView>
	);
}
