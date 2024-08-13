import React, { useCallback, useEffect } from 'react';
import {
	ActivityIndicator,
	Button,
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	View
} from 'react-native';
import { useCategoriesStore, useProductsStore } from '../../hooks/zustand/store';
import { COLORS } from '../../constants';
import { ScrollView } from 'react-native';
import { Alert } from 'react-native';
import Dialog from 'react-native-dialog';
import { FAB, Icon } from '@rneui/themed';

import EditProductForm from '../forms/editProductForm';
import { useRouter } from 'expo-router';

const InventoryList = () => {
	const router = useRouter();
	const { selectedInventoryData, setSelectedInventoryData, loading } = useCategoriesStore(state => state);
	const { deleteProduct, loading: productsLoading } = useProductsStore(state => state);
	const [dialogVisible, setDialogVisible] = React.useState(false);
	const [refreshing, setRefreshing] = React.useState(false);
	const [selected, setSelected] = React.useState(null);
	const [image, setImage] = React.useState(null);
	const [page, setPage] = React.useState(1);
	const [perPageData, setPerPageData] = React.useState([]);

	const limit = 7;

	useEffect(() => {
		setPerPageData(selectedInventoryData.slice((page - 1) * limit, page * limit));
	}, [page, selectedInventoryData, limit]);

	const totalPages = Math.ceil(selectedInventoryData.length / limit);

	const pagesOptions = Array.from({ length: totalPages }, (_, index) => index + 1);

	const showDeleteAlert = item => {
		Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
			{
				text: 'Cancel',
				onPress: () => {},
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: async () => {
					try {
						await deleteProduct(item.id);
						setSelectedInventoryData(item.categoryId);
						setSelected(null);
					} catch (error) {
						console.error('Error deleting product:', error);
					}
				}
			}
		]);
	};
	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color={COLORS.primary} />
			</View>
		);
	}
	if (!loading && selectedInventoryData.length === 0) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
				<Text>No product listed in this category.</Text>
				<Button onPress={() => router.push('/AddProduct')} color={COLORS.tertiary} title='Add Product' />
			</View>
		);
	}

	return (
		<ScrollView>
			{selected && (
				<View>
					<Dialog.Container visible={dialogVisible} contentStyle={{ borderRadius: 15 }}>
						<Dialog.Title style={{ color: COLORS.primary }}>Edit Product</Dialog.Title>
						<Dialog.Description>Edit Product</Dialog.Description>
						<EditProductForm
							product={selected}
							setDialogVisible={setDialogVisible}
							setSelected={setSelected}
						/>
					</Dialog.Container>
				</View>
			)}

			<View style={styles.InventoryHeading}>
				<Text style={styles.inventoryHeader}>Action</Text>
				<Text style={styles.inventoryHeader}>Name</Text>
				<Text style={styles.inventoryHeader}>Stocks</Text>
				<Text style={styles.inventoryHeader}>Price</Text>
			</View>
			{perPageData.length > 0 &&
				perPageData.map(item => (
					<View style={styles.listView} key={item.id}>
						<View style={styles.tableContainer}>
							{!productsLoading ? (
								<Icon
									color={COLORS.tertiary}
									name='edit'
									onPress={() => {
										setSelected(item);
										setDialogVisible(true);
									}}
								/>
							) : (
								<ActivityIndicator size='small' color={COLORS.tertiary} />
							)}
							{!productsLoading ? (
								<Icon color={COLORS.secondary} name='delete' onPress={() => showDeleteAlert(item)} />
							) : (
								<ActivityIndicator size='small' color={COLORS.secondary} />
							)}
						</View>
						<View style={styles.tableContainer}>
							<Text>{item.name}</Text>
						</View>
						<View style={styles.tableContainer}>
							<Pressable style={styles.pressable}>
								<Text style={styles.editable}>{item.stock}</Text>
							</Pressable>
						</View>
						<View style={styles.tableContainer}>
							<Pressable style={styles.pressable}>
								<Text style={styles.editable}>₱ {item.price}</Text>
							</Pressable>
						</View>
					</View>
				))}
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
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	editable: {
		color: COLORS.secondary,
		borderWidth: 1,
		padding: 5,
		fontSize: 16
	},
	tableContainer: {
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'flex-start'
	},
	pressable: {
		textAlign: 'center'
	},
	listView: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.lightGray,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	inventoryHeader: {
		color: COLORS.lightWhite,
		fontSize: 20
	},
	InventoryHeading: {
		backgroundColor: COLORS.secondary,
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 10,
		marginBottom: 10
	}
});

export default InventoryList;
