import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, ToastAndroid, View } from 'react-native';
import { SafeAreaView, ScrollView, Text } from 'react-native';
import { ScreenHeaderBtn } from '../components';
import { COLORS, SIZES, images } from '../constants';
import OrderSummary from '../components/checkout/OrderSummary';
import { useAuthStore, useCartStore, useTransactionStore } from '../hooks/zustand/store';
import { Tooltip } from '@rneui/themed';
import { connectPrinter, printToKitchenPos } from '../utils/print';
import { Icon } from '@rneui/themed';
import { ActivityIndicator } from 'react-native';
import { Modal } from 'react-native-web';

const CheckOut = () => {
	const router = useRouter();
	const { data: cart, clearCart } = useCartStore(state => state);
	const { user, userProfile } = useAuthStore(state => state);
	const { addTransaction, fetchLatestTransaction } = useTransactionStore(state => state);
	const [change, setChange] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);
	const [cash, setCash] = useState(0);
	const [checkingOut, setCheckingOut] = useState(false);
	const [sentToKitchen, setSentToKitchen] = useState(false);
	const [sending, setSending] = useState(false);
	const [customer, setCustomer] = useState('');
	const [isConnected, setIsConnected] = useState(false);

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

	useEffect(() => {
		const c = cash - totalPrice;
		setChange(c);
	}, [totalPrice, cash]);
	const cancelAlert = () =>
		Alert.alert('Cancel Order? ', 'This action will clear current orders', [
			{
				text: 'Cancel',
				onPress: () => {},
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: () => {
					clearCart();
					setChange(0);
					router.push('/');
				}
			}
		]);
	const printAlert = () =>
		Alert.alert('Confirm Order ', 'Press ok to confirm', [
			{
				text: 'Cancel',
				onPress: () => console.log('Cancel Pressed'),
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: async () => {
					await handleSaveTransaction();
					clearCart();
					setChange(0);
					router.push('/');
				}
			}
		]);

	const printToKitchen = async () =>
		Alert.alert('Confirm Order ', 'Press ok to confirm', [
			{
				text: 'Cancel',
				onPress: () => console.log('Cancel Pressed'),
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: async () => {
					let dataToSave = {};
					let transactionId = 1;
					const timeStamp = new Date().toISOString();

					dataToSave['date'] = timeStamp;
					dataToSave['total'] = totalPrice;
					dataToSave['products'] = cart;
					dataToSave['customer'] = customer;
					dataToSave['change'] = change;
					dataToSave['cash'] = cash;
					setSending(true);
					setSentToKitchen(false);
					if (noPrinter) {
						Alert.alert('Error', 'Please set up a printer in your profile settings');
						setSending(false);
						return;
					}
					try {
						const latestTransaction = await fetchLatestTransaction();
						if (latestTransaction) {
							transactionId = parseInt(latestTransaction.number) + 1;
						}
						dataToSave['number'] = transactionId;

						const printed = await printToKitchenPos(dataToSave, userProfile);
						if (printed) {
							setSentToKitchen(true);
							Alert.alert('Success', 'Order sent to kitchen');
						}

						setCheckingOut(false);
					} catch (error) {
						setCheckingOut(false);
						showToast(error.message);
					}

					setSending(false);
				}
			}
		]);
	const showToast = message => {
		return ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
	};

	const handleSaveTransaction = async () => {
		setCheckingOut(true);
		let transactionId = 1;
		let dataToSave = {};
		const timeStamp = new Date().toISOString();
		dataToSave['date'] = timeStamp;
		dataToSave['total'] = totalPrice;
		dataToSave['products'] = cart;
		dataToSave['change'] = change;
		dataToSave['customer'] = customer;
		dataToSave['cash'] = cash;

		try {
			const latestTransaction = await fetchLatestTransaction();
			if (latestTransaction) {
				transactionId = latestTransaction.number + 1;
			}
			if (latestTransaction == null) transactionId = 1;
			dataToSave['number'] = transactionId;
			await addTransaction(dataToSave);
			if (noPrinter) {
				showToast('No printer connected, transaction saved successfully');
				setCheckingOut(false);
				return;
			}
			try {
				await connectPrinter(dataToSave, userProfile);
			} catch (error) {
				showToast(error.message);
			}

			Alert.alert('Success', 'Transaction saved successfully');

			setCheckingOut(false);
		} catch (error) {
			setCheckingOut(false);
			Alert.alert('Error', 'An error occurred while saving the transaction');
		}
	};
	const noPrinter = useMemo(() => {
		if (!userProfile.printer || !userProfile.printer.address) {
			return true;
		}
		return false;
	}, [userProfile]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						flex: 1,
						padding: SIZES.medium
					}}>
					<OrderSummary
						change={change}
						setChange={setChange}
						cash={cash}
						setCash={setCash}
						customer={customer}
						setCustomer={setCustomer}
					/>
				</View>

				{checkingOut || sending ? (
					<ActivityIndicator size='large' color={COLORS.tertiary} />
				) : (
					<View flexDirection='row' justifyContent='space-between'>
						<Pressable style={styles.checkoutBtn} onPress={cancelAlert}>
							<Text style={styles.checkoutText}>Cancel Order</Text>
						</Pressable>
						{change >= 0 && (
							<Tooltip visible={noPrinter} width={200} popover={<Text>Please Connect a Printer</Text>}>
								<Pressable
									style={{
										...styles.cancelBtn,
										backgroundColor: noPrinter ? 'black' : COLORS.tertiary
									}}
									onPress={printToKitchen}
									disabled={noPrinter}>
									<Text style={styles.checkoutText}>Print to Kitchen</Text>
								</Pressable>
							</Tooltip>
						)}
						{change >= 0 && (
							<Pressable style={styles.cancelBtn} onPress={printAlert}>
								<Text style={styles.checkoutText}>Print and Save</Text>
							</Pressable>
						)}
					</View>
				)}
			</ScrollView>

			<View style={styles.footer}>
				<Text style={styles.footerText}>CopyRight 2024</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
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
	},
	checkoutBtn: {
		backgroundColor: COLORS.secondary,
		padding: 10,
		borderRadius: 5,
		margin: 10
	},
	checkoutText: {
		color: COLORS.lightWhite,
		textAlign: 'center'
	},
	cancelBtn: {
		backgroundColor: COLORS.tertiary,
		padding: 10,
		borderRadius: 5,
		margin: 10
	}
});

export default CheckOut;
