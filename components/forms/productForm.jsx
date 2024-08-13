// Formik x React Native example
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	Image,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	ToastAndroid,
	View
} from 'react-native';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import { useCategoriesStore, useProductsStore } from '../../hooks/zustand/store';
import { useRouter } from 'expo-router';
import * as Yup from 'yup';
import { Icon, Input } from '@rneui/themed';
import { COLORS } from '../../constants';
import * as ImagePicker from 'expo-image-picker';

let productSchema = Yup.object().shape({
	name: Yup.string().required('Product name is required'),
	categoryId: Yup.string().required('Category is required'),
	price: Yup.number().required('Price is required').max(1000000, 'Price is too high').min(1, 'Price is too low'),
	stock: Yup.number().required('Stock is required').max(1000000, 'Stock is too high').min(1, 'Stock is too low')
});

const showToast = message => {
	ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
};

const ProductForm = props => {
	const router = useRouter();
	const [image, setImage] = useState(null);
	const [uploading, setUploading] = useState(false);
	const { data: Categories, fetchCategories } = useCategoriesStore(state => state);
	const { addProduct, loading } = useProductsStore(state => state);
	const initialValues = {
		name: '',
		categoryId: '',
		price: 0,
		stock: 0
	};

	const formSubmit = async values => {
		setUploading(true);
		try {
			await addProduct({ ...values, image: image });
			setImage(null);
			setUploading(false);
			router.push('/');
			showToast('Product added successfully');
		} catch (error) {
			Alert.alert('Error', 'An error occurred while adding the product');
		}
	};
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1
		});
		const source = { uri: result.assets[0].uri };
		console.log({ source });
		setImage(source);
	};
	useEffect(() => {
		fetchCategories();
	}, []);

	return (
		<Formik initialValues={initialValues} onSubmit={formSubmit} validationSchema={productSchema}>
			{({
				handleChange,
				handleBlur,
				touched,
				handleSubmit,
				setFieldValue,
				setFieldTouched,
				values,
				isValid,
				errors
			}) => (
				<View style={styles.formView}>
					<View style={styles.centeredForm}>
						<View style={styles.inputContainer}>
							<Picker
								selectedValue={values.categoryId}
								style={styles.inputStyle}
								onBlur={() => setFieldTouched('categoryId')}
								onValueChange={itemValue => setFieldValue('categoryId', itemValue)}>
								<Picker.Item label='Select a category' value='' />
								{Categories.map(category => (
									<Picker.Item key={category.id} label={category.name} value={category.id} />
								))}
							</Picker>
						</View>
						{touched.categoryId && errors.categoryId && (
							<Text style={{ color: 'red' }}>{errors.categoryId}</Text>
						)}

						<Text>Product Name</Text>
						<View style={styles.inputContainer}>
							<TextInput
								onChangeText={handleChange('name')}
								style={styles.inputStyle}
								onBlur={() => setFieldTouched('name')}
								value={values.name}
							/>
						</View>
						{touched.name && errors.name && <Text style={{ color: 'red' }}>{errors.name}</Text>}
						<Text>Set Price</Text>
						<View style={{ ...styles.inputContainer }}>
							<Input
								onChangeText={value => {
									const numericText = value.replace(/[^0-9]/g, '');
									const finalNumeric = String(numericText).startsWith('0')
										? numericText.slice(1)
										: numericText;
									setFieldValue('price', finalNumeric);
								}}
								keyboardType='numeric'
								style={{ borderBottomWidth: 0 }}
								leftIcon={{ type: 'material-community', name: 'currency-php' }}
								onBlur={() => setFieldTouched('price')}
								value={values.price}
							/>
						</View>

						{touched.price && errors.price && <Text style={{ color: 'red' }}>{errors.price}</Text>}
						<Text>Set Stock</Text>
						<View style={styles.inputContainer}>
							<TextInput
								onChangeText={value => {
									const numericText = value.replace(/[^0-9]/g, '');
									const finalNumeric = String(numericText).startsWith('0')
										? numericText.slice(1)
										: numericText;
									setFieldValue('stock', finalNumeric);
								}}
								keyboardType='numeric'
								style={styles.inputStyle}
								onBlur={() => setFieldTouched('stock')}
								value={values.stock}
							/>
						</View>
						{touched.stock && errors.stock && <Text style={{ color: 'red' }}>{errors.stock}</Text>}
						<View>
							<Text style={{ textAlign: 'center' }}>Uploaded Image</Text>
							<View
								style={{
									alignItems: 'center',
									width: 225,
									height: 200,
									borderWidth: 1,
									borderStyle: 'dotted',
									borderRadius: 10
								}}>
								{!image && (
									<View>
										<Image
											source={require('../../assets/images/no-image.png')}
											style={{
												width: 224,
												height: 199,
												position: 'absolute',
												right: -50,
												top: 0,
												borderRadius: 10
											}}
										/>
										<Text style={{ textAlign: 'center', marginTop: 80, fontWeight: 'bold' }}>
											No image uploaded
										</Text>
									</View>
								)}
								<Image source={image} style={{ width: 224, height: 199, borderRadius: 10 }} />
							</View>

							<Pressable style={styles.uploadButton} onPress={() => pickImage()}>
								<Text style={styles.buttonText}>
									<Icon type='font-awesome' name='upload' size={18} color='white' />{' '}
									{image ? 'Change' : 'Upload'} Photo
								</Text>
							</Pressable>
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
								onPress={() => router.push('/')}
								title='Cancel'
								color={COLORS.gray}
							/>
						</View>
					</View>
				</View>
			)}
		</Formik>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		borderWidth: 1,
		borderColor: COLORS.tertiary,
		borderRadius: 10
	},
	pressable: {
		backgroundColor: COLORS.primary,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		borderRadius: 5,
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
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center'
	},
	centeredForm: {
		marginBottom: 20,
		width: '95%',
		fontSize: 20,
		backgroundColor: 'white',
		padding: 40,
		borderRadius: 5,
		boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
	},
	inputStyle: {
		borderRadius: 5,
		fontSize: 20,
		padding: 5,
		marginBottom: 10
	},
	formButtonContainer: {
		color: '#fff',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: 20,
		paddingLeft: 50,
		paddingRight: 50,
		marginTop: 20,
		borderRadius: 5
	}
});

export default ProductForm;
