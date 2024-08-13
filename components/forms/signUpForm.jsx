import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from '../../constants';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Icon } from '@rneui/themed';
import { app } from '../../firebase';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useAuthStore } from '../../hooks/zustand/store';

let signUpSchema = yup.object().shape({
	email: yup.string().email().required(),
	password: yup.string().required(),
	password2: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match')
});
export default function SignUpForm({ showSignUpForm, setShowSignUpForm }) {
	const { signUp } = useAuthStore(state => state);
	const [hidePassword, setHidePassword] = useState(true);
	const [loading, setLoading] = useState(false);
	const firebaseAuth = getAuth(app);
	const handleFormSubmit = async values => {
		setLoading(true);
		try {
			await signUp(values.email, values.password);
		} catch (error) {
			setLoading(false);
			console.log(error);
		}
	};
	return (
		<Formik
			initialValues={{ email: '', password: '', password2: '' }}
			onSubmit={handleFormSubmit}
			validationSchema={signUpSchema}>
			{({ handleChange, touched, handleSubmit, setFieldTouched, values, errors, handleBlur }) => (
				<View>
					<Text style={{ color: COLORS.lightWhite, marginBottom: 10 }}>EMAIL</Text>
					<TextInput
						onChangeText={handleChange('email')}
						onBlur={handleBlur('email')}
						style={{ marginBottom: 10, backgroundColor: COLORS.gray2, padding: 10, borderRadius: 15 }}
						value={values.email}
						placeholder='Enter email'
					/>
					{touched.email && errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
					<Text style={{ color: COLORS.lightWhite, marginBottom: 10 }}>PASSWORD</Text>
					<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
						<TextInput
							onChangeText={handleChange('password')}
							onBlur={handleBlur('password')}
							secureTextEntry={hidePassword}
							style={{
								marginBottom: 10,
								backgroundColor: COLORS.gray2,
								padding: 10,
								borderRadius: 15,
								flex: 1,
								width: '100%'
							}}
							value={values.password}
							placeholder='Enter password'
						/>

						<Pressable onPress={() => setHidePassword(!hidePassword)}>
							<Icon
								name='eye'
								type='font-awesome'
								color={hidePassword ? 'white' : COLORS.tertiary}
								style={{ marginBottom: 10 }}
							/>
						</Pressable>
					</View>
					{touched.password && errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}
					<TextInput
						onChangeText={handleChange('password2')}
						onBlur={handleBlur('password2')}
						secureTextEntry={hidePassword}
						style={{
							marginBottom: 10,
							backgroundColor: COLORS.gray2,
							padding: 10,
							borderRadius: 15,
							flex: 1,
							width: '100%'
						}}
						value={values.password2}
						placeholder='Repeat password'
					/>
					{touched.password2 && errors.password2 && (
						<Text style={{ color: 'red' }}>Passwords do not match!</Text>
					)}
					<View flexDirection='row' justifyContent='space-between' style={{ marginTop: 10 }}>
						<Pressable
							onPress={() => setShowSignUpForm(false)}
							style={{ backgroundColor: COLORS.gray2, padding: 10, borderRadius: 15 }}>
							<Text>Cancel</Text>
						</Pressable>
						{loading ? (
							<ActivityIndicator size={'small'} color={COLORS.tertiary} />
						) : (
							<Pressable
								onPress={handleSubmit}
								style={{ backgroundColor: COLORS.tertiary, padding: 10, borderRadius: 15 }}>
								<Text style={{ color: 'white' }}>Submit</Text>
							</Pressable>
						)}
					</View>
				</View>
			)}
		</Formik>
	);
}
