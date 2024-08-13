import { useState } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { COLORS, icons, images, SIZES } from '../constants';
import { ScreenHeaderBtn, Welcome } from '../components';
import ProductForm from '../components/forms/productForm';
export default function AddProduct() {
	const router = useRouter();
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						flex: 1,
						padding: SIZES.medium
					}}>
					<ProductForm />
				</View>
			</ScrollView>
			<View style={styles.footer}>
				<Text style={styles.footerText}>CopyRight 2024</Text>
			</View>
		</SafeAreaView>
	);
}
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
	}
});
