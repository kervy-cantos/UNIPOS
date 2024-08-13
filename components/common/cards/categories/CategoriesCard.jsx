import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, ActivityIndicator, Button, ToastAndroid } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants';
import { useCartStore, useCategoriesStore, useProductsStore } from '../../../../hooks/zustand/store';
import { FAB } from '@rneui/base';
import Dialog from 'react-native-dialog';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { TextInput } from 'react-native';

let categorySchema = Yup.object().shape({
	name: Yup.string().required('Category name is required')
});

const showToast = message => {
	ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
};

const CategoryCard = ({ categoryName, setHasSelected, isEditing, isDeleting, setIsEditing, setIsDeleting }) => {
	const router = useRouter();
	const { setSelectedInventoryData, selectedInventoryData, loading } = useCategoriesStore(state => state);
	const [editDialogVisible, setEditDialogVisible] = React.useState(false);
	const [selected, setSelected] = React.useState(null);
	const { data: products } = useProductsStore(state => state);

	const initialValues = {
		name: categoryName.name,
		description: categoryName.description ?? ''
	};

	const formSubmit = async values => {
		try {
			await useCategoriesStore.getState().updateCategory(categoryName.id, values);
			setEditDialogVisible(false);
			setIsEditing(false);
			setSelected(null);
			await useCategoriesStore.getState().fetchCategories();
			Alert.alert('Success', 'Category Updated successfully');
		} catch (error) {
			console.log(error);
			Alert.alert('Error', 'An error occurred while updating the category');
		}
	};

	const productCount = useMemo(() => {
		return products.filter(product => product.categoryId === categoryName.id).length;
	}, [products, categoryName]);

	const showDeleteAlert = id => {
		Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
			{
				text: 'Cancel',
				onPress: () => {},
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: async () => {
					try {
						await useCategoriesStore.getState().deleteCategory(id);
						setSelectedInventoryData(categoryName.id);
						setIsDeleting(false);
						setSelected(null);
						showToast('Category deleted successfully');
						await useCategoriesStore.getState().fetchCategories();
					} catch (error) {
						console.error('Error deleting category:', error);
					}
				}
			}
		]);
	};

	return (
		<View>
			{editDialogVisible && (
				<View>
					<Dialog.Container visible={editDialogVisible} contentStyle={{ borderRadius: 15 }}>
						<Dialog.Title style={{ color: COLORS.primary }}>Edit Category</Dialog.Title>
						<Dialog.Description>Edit Category</Dialog.Description>
						<Formik initialValues={initialValues} onSubmit={formSubmit} validationSchema={categorySchema}>
							{({ handleChange, touched, handleSubmit, setFieldTouched, values, errors }) => (
								<View style={styles.formView}>
									<View style={styles.centeredForm}>
										<Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Category Name</Text>
										<View style={styles.inputContainer}>
											<TextInput
												onChangeText={handleChange('name')}
												style={styles.inputStyle}
												onBlur={() => setFieldTouched('name')}
												value={values.name}
												placeholder='Enter category name'
											/>
										</View>
										{touched.name && errors.name && (
											<Text style={{ color: 'red' }}>{errors.name}</Text>
										)}
										<Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
											Category Description
										</Text>
										<View style={styles.inputContainer}>
											<TextInput
												onChangeText={handleChange('description')}
												style={styles.inputStyle}
												onBlur={() => setFieldTouched('description')}
												value={values.description}
											/>
										</View>

										<View style={styles.formButtonContainer}>
											{loading ? (
												<ActivityIndicator size='small' color={COLORS.tertiary} />
											) : (
												<Button
													style={styles.formButton}
													onPress={handleSubmit}
													title='Submit'
													color={COLORS.tertiary}
												/>
											)}

											<Button
												style={styles.formButton}
												onPress={() => {
													setEditDialogVisible(false);
												}}
												title='Cancel'
												color={COLORS.gray}
											/>
										</View>
									</View>
								</View>
							)}
						</Formik>
					</Dialog.Container>
				</View>
			)}

			<View style={{ position: 'absolute', top: 0, zIndex: 10, left: 0, display: isEditing ? 'flex' : 'none' }}>
				<FAB
					visible={true}
					icon={{ name: 'edit', color: 'white' }}
					color={COLORS.primary}
					size='small'
					onPress={() => {
						setSelected(categoryName);
						setEditDialogVisible(true);
					}}
				/>
			</View>
			<View
				style={{
					position: 'absolute',
					bottom: 0,
					zIndex: 10,
					right: 75,
					display: isDeleting ? 'flex' : 'none'
				}}>
				<FAB
					visible={true}
					icon={{ name: 'delete', color: 'red' }}
					color={COLORS.primary}
					size={'small'}
					onPress={() => showDeleteAlert(categoryName.id)}
				/>
			</View>
			<Pressable
				style={({ pressed }) => [
					{
						transform: [{ scale: pressed ? 0.96 : 1 }]
					},
					localStyles.cardContainer
				]}
				onPress={() => {
					setHasSelected(true);
					setSelectedInventoryData(categoryName.id);
				}}>
				<Card containerStyle={{ ...localStyles.card }}>
					<Text style={localStyles.productName}>
						{categoryName.name.charAt(0).toUpperCase() + categoryName.name.slice(1)}
					</Text>
					{productCount == 0 ? (
						<Text>No Product</Text>
					) : (
						<Text>
							{productCount} {productCount == 1 ? 'Product' : 'Products'}
						</Text>
					)}
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
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#FF7754', // Warm orange shadow
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 5
	},
	productName: {
		fontSize: 14,
		marginTop: 5,
		marginBottom: 5,
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
		overflow: 'hidden',
		marginBottom: 20
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center'
	},
	overlayText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold'
	}
});

const styles = StyleSheet.create({
	pressable: {
		backgroundColor: COLORS.primary,
		borderRadius: 5,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#fff',
		height: 35,
		width: 60
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		textAlign: 'center'
	},

	uploadButton: {
		backgroundColor: COLORS.secondary,
		padding: 10,
		borderRadius: 5,
		marginTop: 10
	},
	formView: {
		alignItems: 'center'
	},
	centeredForm: {
		marginBottom: 20,
		width: '80%',
		fontSize: 20,
		backgroundColor: '#f9f9f9',
		padding: 25,
		borderRadius: 5,
		boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
	},
	inputStyle: {
		border: '1px solid #088395',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
		fontSize: 20,
		padding: 5,
		paddingTop: 10,
		marginBottom: 10
	},
	formButtonContainer: {
		color: '#fff',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'space-between',
		fontSize: 20,

		marginTop: 20,
		borderRadius: 5
	},
	inputContainer: {
		borderWidth: 1,
		borderColor: COLORS.tertiary,
		borderRadius: 10,
		marginBottom: 10
	}
});
export default CategoryCard;
