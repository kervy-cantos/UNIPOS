import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { Card, Icon } from '@rneui/themed';

import { useRouter } from 'expo-router';
import { useCartStore, useProductsStore } from '../../../../hooks/zustand/store';
import { COLORS } from '../../../../constants';

const ProductCard = ({ food }) => {
	const router = useRouter();
	const { addToCart, data: cart, reduceQuantity, removeFromCart } = useCartStore(state => state);
	const { setProductDetails } = useProductsStore(state => state);

	const { image } = food;

	const handleCardPress = id => {
		setProductDetails(id);
		router.push(`/ProductDetails/${id}`);
	};

	const productQuantity = useMemo(() => {
		const cartItem = cart.find(item => item.id === food.id);
		return cartItem ? cartItem.quantity : 0;
	}, [JSON.stringify(cart)]);

	const isSelected = useMemo(() => cart.some(item => item.id === food.id), [JSON.stringify(cart)]);
	const defaultImageUri =
		'https://firebasestorage.googleapis.com/v0/b/pos-shop-19744.appspot.com/o/pos-kervy%2Fsplash.jpeg?alt=media&token=6a1f9696-d9ad-4b94-85cc-934d1b3cb853';

	const isDefaultImage = !food.image || food.image === '';

	return (
		<View>
			<Pressable
				disabled={food.stock - productQuantity <= 0}
				style={({ pressed }) => [
					{
						transform: [{ scale: pressed ? 0.96 : 1 }]
					},
					localStyles.cardContainer
				]}
				onPress={() => {
					addToCart(food);
				}}>
				{isSelected && (
					<View
						flexDirection='row'
						justifyContent='space-between'
						style={{ position: 'absolute', zIndex: 999, top: 5, left: 0 }}>
						<Pressable onPress={() => reduceQuantity(food.id)}>
							<Icon
								name='circle-with-minus'
								type='entypo'
								color='red'
								size={26}
								style={{ marginBottom: 5 }}
							/>
						</Pressable>
					</View>
				)}
				{isSelected && (
					<View
						flexDirection='row'
						justifyContent='space-between'
						style={{ position: 'absolute', zIndex: 999, top: 5, right: 5 }}>
						<Pressable onPress={() => removeFromCart(food.id)}>
							<Icon
								name='trash'
								type='entypo'
								color={COLORS.secondary}
								size={24}
								style={{ marginBottom: 5 }}
							/>
						</Pressable>
					</View>
				)}

				<Card containerStyle={{ ...localStyles.card, borderWidth: isSelected ? 3 : 1 }}>
					{isSelected && (
						<View>
							<Text style={{ textAlign: 'center' }}>Current Stock {food.stock - productQuantity}</Text>
						</View>
					)}
					<View style={localStyles.imageContainer}>
						<Image
							source={{
								uri: isDefaultImage ? defaultImageUri : food.image
							}}
							style={localStyles.image}
						/>
						{!isDefaultImage && (food.stock == 0 || food.stock - productQuantity <= 0) ? (
							<View style={localStyles.overlay}>
								<Text style={{ color: 'white' }}>Out of Stock</Text>
							</View>
						) : null}

						{isDefaultImage && (
							<View style={localStyles.overlay}>
								{food.stock == 0 || food.stock - productQuantity <= 0 ? (
									<Text style={{ color: 'white' }}>Out of Stock</Text>
								) : null}
								<Text style={{ color: 'white' }}>No Image Uploaded</Text>
							</View>
						)}
					</View>

					<Text style={localStyles.productName}>{food.name}</Text>
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
						<Icon type='material-community' name='currency-php' size={14} />
						<Text style={{ color: COLORS.tertiary }}>{food.price}</Text>
						{isSelected && <Text style={{ fontWeight: 'bold' }}> x {productQuantity}</Text>}
					</View>
				</Card>
			</Pressable>
		</View>
	);
};

const localStyles = StyleSheet.create({
	card: {
		minHeight: 125,
		borderColor: '#FF7754', // Orange border color
		borderWidth: 2, // Border width
		borderRadius: 15,
		padding: 10,
		shadowColor: '#FF7754', // Warm orange shadow
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 5
	},
	productName: {
		fontSize: 14,
		marginTop: 5,
		fontWeight: 'bold'
	},
	image: {
		width: '100%',
		height: 80,
		resizeMode: 'cover'
	},
	cardContainer: {
		width: '100%',
		minHeight: 100,
		borderRadius: 15,
		overflow: 'hidden'
	},
	imageContainer: {
		width: '100%',
		height: 80,
		borderRadius: 15,
		overflow: 'hidden'
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0,0,0,0.5)',
		borderRadius: 15
	}
});

export default ProductCard;
