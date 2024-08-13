import { View, Text, Pressable, TextInput, ToastAndroid, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from '../../constants';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Icon } from '@rneui/themed';
import { useAuthStore } from '../../hooks/zustand/store';
import { useRouter } from 'expo-router';

let signInSchema = yup.object().shape({
	email: yup.string().email().required(),
	password: yup.string().required()
});
export default function SignInForm({ showSignInForm, setShowSignInForm }) {
	const router = useRouter();
	const [hidePassword, setHidePassword] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login, loading, user, loginError } = useAuthStore(state => state);

	const showToast = message => {
		ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
	};

	if (user) router.push('/');
	const handleFormSubmit = async values => {
		setIsSubmitting(true);
		try {
			await login(values.email, values.password);
		} catch (error) {
			console.log(error);
			showToast('Invalid email or password');
		}
		setIsSubmitting(false);
	};

	return (
		<Formik initialValues={{ email: '', password: '' }} onSubmit={handleFormSubmit} validationSchema={signInSchema}>
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
					<View flexDirection='row' justifyContent='space-between' style={{ marginTop: 10 }}>
						<Pressable
							onPress={() => setShowSignInForm(false)}
							style={{ backgroundColor: COLORS.gray2, padding: 10, borderRadius: 15 }}>
							<Text>Cancel</Text>
						</Pressable>
						{isSubmitting ? (
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
