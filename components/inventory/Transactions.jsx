import {
	View,
	Text,
	FlatList,
	Pressable,
	Alert,
	StyleSheet,
	Modal,
	ActivityIndicator,
	Button,
	ToastAndroid,
	RefreshControl
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuthStore, useProductsStore, useTransactionStore } from '../../hooks/zustand/store';
import moment from 'moment';
import { ScrollView } from 'react-native';
import { COLORS } from '../../constants';
import { FAB, Icon } from '@rneui/themed';
import Dialog from 'react-native-dialog';
import { connectPrinter } from '../../utils/print';
import { TextInput } from 'react-native';

export default function Transactions() {
	const {
		data: transactionData,
		fetchTransactions,
		loading,
		deleteTransaction
	} = useTransactionStore(state => state);
	const { userProfile } = useAuthStore(state => state);
	const [selected, setSelected] = useState(null);
	const [alertVisible, setAlertVisible] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [pinConfirm, setPinConfirm] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [displayedData, setDisplayedData] = useState([]);
	const [page, setPage] = useState(1);
	const [printing, setPrinting] = useState(false);

	const limit = 10;
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		fetchTransactions();
		setRefreshing(false);
	}, []);

	useEffect(() => {
		fetchTransactions();
	}, []);

	const totalPages = Math.ceil(transactionData.length / limit);

	const pagesOptions = Array.from({ length: totalPages }, (_, index) => index + 1);

	useEffect(() => {
		const data = transactionData.slice((page - 1) * limit, page * limit);
		setDisplayedData(data);
	}, [transactionData, page]);

	const getTotalItemCount = data => {
		let total = 0;
		data.products.forEach(item => {
			total += item.quantity;
		});
		return total;
	};

	if (loading) {
		return (
			<View alignItems='center' justifyContent='center'>
				<ActivityIndicator size='large' />
			</View>
		);
	}
	const showToast = message => {
		return ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
	};
	const handleReprint = async () => {
		try {
			setPrinting(true);
			await connectPrinter(selected, userProfile);
			setPrinting(false);
		} catch (error) {
			setPrinting(false);
			alert('Error printing');
		}
	};

	const totalSales = transactionData.reduce((acc, item) => acc + item.total, 0);

	return (
		<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
			{selected && (
				<Modal
					animationType='slide'
					transparent={true}
					visible={alertVisible}
					onRequestClose={() => {
						Alert.alert('Modal has been closed.');
						setAlertVisible(!alertVisible);
					}}>
					<View style={styles.centeredView}>
						<Dialog.Container visible={showDeleteConfirm} contentStyle={{ borderRadius: 15 }}>
							<Dialog.Title style={{ color: 'black' }}>Confirm Delete</Dialog.Title>
							<Dialog.Description style={{ color: 'black' }}>
								Enter your PIN to confirm
							</Dialog.Description>
							<TextInput
								style={{
									borderWidth: 1,
									borderColor: 'black',
									borderRadius: 5,
									padding: 5,
									marginBottom: 10
								}}
								onChangeText={text => setPinConfirm(text)}
								secureTextEntry={true}
							/>
							<View flexDirection='row' justifyContent='space-between'>
								<Button title='Close' onPress={() => setShowDeleteConfirm(false)} />
								{loading ? (
									<ActivityIndicator size='small' color='red' />
								) : (
									<Button
										title='Delete'
										onPress={async () => {
											if (pinConfirm == userProfile.pin || !userProfile.pin) {
												try {
													await deleteTransaction(selected.id);
													setShowDeleteConfirm(false);
													setAlertVisible(false);
													showToast('Transaction Deleted');
												} catch (error) {
													console.log(error);
												}
											} else {
												setShowDeleteConfirm(false);
												setAlertVisible(false);
												showToast('Invalid PIN');
											}
										}}
										color={'red'}
									/>
								)}
							</View>
						</Dialog.Container>
						<View style={styles.modalView}>
							<View>
								<Text style={styles.modalText}>Transaction Summary</Text>
								<Text style={styles.modalTextHeader}>Transaction ID: {selected?.id}</Text>
								<Text style={styles.modalTextHeader}>
									Date: {moment(selected?.date).format('MMMM DD, YYYY')}
								</Text>
								<Text style={styles.modalTextHeader}>
									Total:
									<Text style={{ color: COLORS.tertiary, fontSize: 18 }}>₱ {selected?.total}</Text>
								</Text>
								<Text style={styles.modalTextHeader}>Items: {getTotalItemCount(selected)}</Text>
								<Text style={styles.modalTextHeader}>
									Customer:
									{selected.customer && selected.customer != '' ? selected.customer : 'Not Set'}
								</Text>
							</View>
							<View style={{ borderBottomWidth: 1, borderStyle: 'dotted', marginBottom: 10 }}></View>
							<View>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
									<Text style={styles.modalTextHeader}>Items</Text>
									<Text style={styles.modalTextHeader}>Quantity</Text>
									<Text style={styles.modalTextHeader}>SubTotal</Text>
								</View>
								{selected?.products.map((item, index) => (
									<View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
										<Text style={styles.modalText}>{item.name}</Text>
										<Text style={styles.modalText}>{item.quantity}</Text>
										<Text style={styles.modalText}>₱ {item.price * item.quantity}</Text>
									</View>
								))}
							</View>
							<View flexDirection='row' justifyContent='space-between'>
								<Pressable
									style={[styles.button, styles.buttonClose]}
									onPress={() => setAlertVisible(!alertVisible)}>
									<Text style={styles.textStyle}>Close</Text>
								</Pressable>
								<Pressable
									style={{
										backgroundColor: 'red',
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										paddingVertical: 10,
										paddingHorizontal: 20,
										borderRadius: 20,
										justifyContent: 'center'
									}}
									onPress={() => setShowDeleteConfirm(true)}>
									<Icon name='trash' type='font-awesome' color={'white'} size={16} />
								</Pressable>
								{printing ? (
									<ActivityIndicator size='small' color={COLORS.tertiary} />
								) : (
									<Pressable
										style={[styles.button, styles.buttonOpen]}
										onPress={() => handleReprint(selected)}>
										<Text style={styles.textStyle}>Print</Text>
									</Pressable>
								)}
							</View>
						</View>
					</View>
				</Modal>
			)}
			<View>
				<Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>
					Transactions
				</Text>
			</View>
			<View style={{ marginLeft: 5, marginBottom: 5 }}>
				<Text>Recent Transactions: </Text>
			</View>
			<View style={{ minHeight: 550 }}>
				{displayedData.length > 0 &&
					displayedData.map(item => (
						<View
							style={{
								height: 50,
								borderWidth: 1,
								alignItems: 'center',
								paddingHorizontal: 5,
								marginBottom: 5,
								marginHorizontal: 5,
								flexDirection: 'row',
								justifyContent: 'space-between'
							}}
							key={item.id}>
							<Text>
								{moment(item.date).format('MMMM DD, YYYY') == 'Invalid date'
									? 'No Date'
									: moment(item.date).format('MMMM DD, YYYY')}
							</Text>
							<View justifyContent='center' alignItems='center' style={{ width: 100 }}>
								<Text>₱ {item.total ?? 0}</Text>
							</View>

							<Pressable
								style={{
									backgroundColor: COLORS.primary,
									padding: 5,
									borderRadius: 5,
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									gap: 10
								}}
								onPress={() => {
									setSelected(item);
									setAlertVisible(true);
								}}>
								<Icon name='eye' type='font-awesome' size={14} color='white' />
								<Text style={{ color: 'white' }}>View</Text>
							</Pressable>
						</View>
					))}
			</View>

			<ScrollView horizontal style={{ marginLeft: 'auto', marginRight: 'auto', gap: 10, marginVertical: 10 }}>
				{pagesOptions.length > 0 &&
					pagesOptions.map((_, index) => (
						<FAB
							key={index}
							size='small'
							color={page - 1 == index ? COLORS.tertiary : COLORS.gray2}
							title={`${index + 1}`}
							onPress={() => setPage(index + 1)}
							style={{ marginHorizontal: 10 }}
						/>
					))}
			</ScrollView>
			<View flexDirection='row' justifyContent='space-between' style={{ padding: 10 }}>
				<Text
					style={{ textAlign: 'left', fontSize: 16, fontWeight: 'bold', marginVertical: 10, marginLeft: 10 }}>
					Total Sales: ₱ {totalSales}
				</Text>
				<Text
					style={{ textAlign: 'left', fontSize: 16, fontWeight: 'bold', marginVertical: 10, marginLeft: 10 }}>
					Total Transactions: {transactionData.length}
				</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		width: '80%',
		borderRadius: 20,
		padding: 35,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2
	},
	buttonOpen: {
		backgroundColor: COLORS.tertiary
	},
	buttonClose: {
		backgroundColor: COLORS.primary
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center'
	},
	modalTextHeader: {
		fontWeight: 'bold',
		marginBottom: 15,
		textAlign: 'center'
	}
});
