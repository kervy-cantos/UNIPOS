import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCartStore } from '../../hooks/zustand/store';
import { FlatList } from 'react-native-gesture-handler';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../constants';

const OrderSummary = ({ change, setChange, cash, setCash, customer, setCustomer }) => {
	const { data: cart, reduceQuantity, addToCart } = useCartStore(state => state);

	const [totalItems, setTotalItems] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);

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

	return (
		<View style={styles.summaryContainer}>
			<View style={styles.summaryHeader}>
				<Text style={styles.summaryHeaderText}>Order Summary</Text>
			</View>
			<View style={styles.headerTexts}>
				<Text style={{ ...styles.items, ...styles.headers }}>Item</Text>
				<Text style={{ ...styles.items, ...styles.headers }}>Quantity</Text>
				<Text style={{ ...styles.items, ...styles.headers }}>Price</Text>
			</View>

			{cart.map((item, index) => (
				<View key={index} style={styles.headerTexts}>
					<Text style={styles.items}>{item.name}</Text>
					<View flexDirection='row' gap={10} style={styles.items} alignItems='center' justifyContent='center'>
						<Pressable onPress={() => reduceQuantity(item.id)}>
							<Icon name='minussquare' type='ant-design' color={COLORS.secondary} size={18} />
						</Pressable>
						<Text>{item.quantity}</Text>
						<Pressable onPress={() => addToCart(item)}>
							<Icon name='plussquare' type='ant-design' color={COLORS.tertiary} size={18} />
						</Pressable>
					</View>
					<Text style={styles.items}>₱ {item.price * item.quantity}</Text>
				</View>
			))}

			<View style={styles.summaryBody}>
				<View style={styles.summaryItem}>
					<Text style={styles.summaryItemText}>Total Items</Text>
					<Text style={styles.summaryItemText}>{totalItems}</Text>
				</View>
				<View style={styles.summaryItem}>
					<Text style={styles.summaryItemText}>Total Price</Text>
					<Text style={styles.summaryItemText}>₱ {totalPrice}</Text>
				</View>
			</View>
			<View>
				<TextInput
					placeholder='Enter Cash'
					onChangeText={value => {
						const numericText = value.replace(/[^0-9]/g, '');
						const finalNumeric = String(numericText).startsWith('0') ? numericText.slice(1) : numericText;
						setCash(finalNumeric);
					}}
					keyboardType='numeric'
					style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 5, marginBottom: 10 }}
				/>
				<TextInput
					placeholder='Enter Customer Name'
					style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 5 }}
					onChangeText={text => {
						setCustomer(text);
					}}
				/>
			</View>
			<View style={styles.summaryBody}>
				<View style={styles.summaryItem}>
					<Text style={{ ...styles.summaryItemText, fontWeight: 'bold', fontSize: 20 }}>
						{change < 0 ? 'To Pay' : 'Change'}
					</Text>
					<Text style={{ ...styles.summaryItemText, fontWeight: 'bold', fontSize: 20 }}>
						₱ {change <= 0 ? change * -1 : change}
					</Text>
				</View>
			</View>
		</View>
	);
};

export default OrderSummary;

const styles = StyleSheet.create({
	summaryContainer: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		marginTop: 20
	},
	summaryHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
		paddingBottom: 10
	},
	summaryHeaderText: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	summaryBody: {
		marginTop: 10
	},
	items: {
		width: '35%',
		textAlign: 'center'
	},
	headerTexts: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20
	},
	summaryItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10
	},
	summaryItemText: {
		fontSize: 16,
		textAlign: 'center'
	},
	headers: {
		fontWeight: 'bold',
		textAlign: 'center'
	}
});
