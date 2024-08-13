// Formik x React Native example

import { ActivityIndicator, Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Formik } from 'formik';
import { useCategoriesStore } from '../../hooks/zustand/store';
import { useRouter } from 'expo-router';
import * as Yup from 'yup';
import { COLORS } from '../../constants';

let productSchema = Yup.object().shape({
	name: Yup.string().required('Category name is required')
});

const CategoryForm = props => {
	const router = useRouter();

	const { data: Categories, fetchCategories, loading, addCategory } = useCategoriesStore(state => state);

	const initialValues = {
		name: '',
		description: ''
	};

	const formSubmit = async values => {
		try {
			await addCategory(values);
			Alert.alert('Success', 'Category added successfully');
			router.push('/');
		} catch (error) {
			console.log(error);
			Alert.alert('Error', 'An error occurred while adding the category');
		}
	};

	return (
		<Formik initialValues={initialValues} onSubmit={formSubmit} validationSchema={productSchema}>
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
						{touched.name && errors.name && <Text style={{ color: 'red' }}>{errors.name}</Text>}
						<Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Category Description</Text>
						<View style={styles.inputContainer}>
							<TextInput
								onChangeText={handleChange('description')}
								style={styles.inputStyle}
								onBlur={() => setFieldTouched('description')}
								value={values.description}
								placeholder='Describe the category'
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
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white'
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

export default CategoryForm;
