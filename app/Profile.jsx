import {
	View,
	Text,
	SafeAreaView,
	Pressable,
	Button,
	ActivityIndicator,
	ToastAndroid,
	PermissionsAndroid
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../hooks/zustand/store';
import { COLORS } from '../constants';
import { Avatar, Icon } from '@rneui/themed';
import Dialog from 'react-native-dialog';
import { TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
	const { user, userProfile, updateUserProfile, createUserProfile, loading } = useAuthStore(state => state);
	const router = useRouter();
	const [dialogVisible, setDialogVisible] = useState(false);
	const [selectedField, setSelectedField] = useState({});
	const [editValue, setEditValue] = useState({});
	const [showPin, setShowPin] = useState(false);
	if (!userProfile) router.push('/auth');
	const [initials, setInitials] = useState('F');

	const showToast = message => {
		ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
	};

	console.log('userProfile', userProfile);

	const requestBluetoothPermission = async () => {
		try {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
				title: 'Cool Photo App Camera Permission',
				message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
				buttonNeutral: 'Ask Me Later',
				buttonNegative: 'Cancel',
				buttonPositive: 'OK'
			});
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log('You can use the camera');
			} else {
				console.log('Camera permission denied');
			}
		} catch (err) {
			console.warn(err);
		}
	};

	useEffect(() => {
		const checkBluetoothPermission = async () => {
			const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
			if (!granted) {
				requestBluetoothPermission();
			}
		};
		checkBluetoothPermission();
	}, []);

	useEffect(() => {
		const name = userProfile?.name;
		if (name) {
			const { name } = userProfile;
			if (!name) return;
			const nameArray = name.split(' ');
			if (nameArray.length < 2) return setInitials(nameArray[0].charAt(0).toUpperCase());
			const firstInitial = nameArray[0].charAt(0);
			const lastInitial = nameArray[1].charAt(0);
			setInitials(firstInitial.toUpperCase() + lastInitial.toUpperCase());
		} else {
			const name = userProfile.email.split('@')[0];
			const firstInitial = name.charAt(0);
			const lastInitial = name.charAt(name.length - 1);
			setInitials(firstInitial.toUpperCase() + lastInitial.toUpperCase());
		}
	}, [userProfile]);

	const renderField = ({ name, value }) => {
		if (name === 'pin' || name === 'phone')
			return (
				<TextInput
					style={{ borderWidth: 1, fontSize: 30, marginBottom: 10 }}
					keyboardType='numeric'
					defaultValue={name == 'pin' ? userProfile?.pin : userProfile.phone}
					maxLength={name == 'pin' ? 6 : 15}
					secureTextEntry={name == 'pin' && !showPin}
					onChangeText={value => {
						const numericText = value.replace(/[^0-9]/g, '');

						if (userProfile.id) {
							setEditValue({ id: userProfile.id, [name]: numericText });
						} else {
							setEditValue({
								[name]: finalNumeric,
								name: userProfile.name ?? '',
								email: user.email ?? '',
								store: userProfile.store ?? ''
							});
						}
					}}
				/>
			);
		return (
			<TextInput
				style={{ borderWidth: 1, fontSize: 30, marginBottom: 10 }}
				defaultValue={value}
				maxLength={name == 'address' ? 70 : 40}
				onChangeText={text => {
					if (userProfile.id) {
						setEditValue({ id: userProfile.id, [name]: text });
					} else {
						setEditValue({
							[name]: text,
							pin: userProfile.pin ?? '',
							name: userProfile.name ?? '',
							email: user.email ?? '',
							store: userProfile.store ?? ''
						});
					}
				}}
			/>
		);
	};

	const fieldTitle = name => {
		switch (name) {
			case 'pin':
				return 'PIN';
			case 'phone':
				return 'Phone Number';
			case 'name':
				return 'Name';
			case 'store':
				return 'Store Name';
			case 'address':
				return 'Store Address';
			default:
				return;
		}
	};

	return (
		<SafeAreaView style={{ padding: 5, backgroundColor: COLORS.primary, height: '100%' }}>
			<View>
				<Dialog.Container visible={dialogVisible} contentStyle={{ borderRadius: 15 }}>
					<Dialog.Title style={{ color: COLORS.primary }}>
						<Text>
							{selectedField.value ? 'Edit' : 'Add'} {fieldTitle(selectedField.name)}
						</Text>
					</Dialog.Title>
					<View flexDirection='row' justifyContent='flex-end' alignItems='center'>
						<Pressable
							style={{
								gap: 10,
								backgroundColor: COLORS.tertiary,
								flexDirection: 'row',
								alignItems: 'center',
								padding: 5,
								marginBottom: 10,
								borderRadius: 5
							}}
							onPress={() => setShowPin(!showPin)}>
							<Icon name='eye' type='font-awesome' color={!showPin ? COLORS.lightWhite : 'blue'} />
							<Text style={{ color: !showPin ? COLORS.lightWhite : 'blue' }}>
								{!showPin ? 'Show' : 'Hide'}
							</Text>
						</Pressable>
					</View>

					{renderField(selectedField)}
					<View justifyContent='space-between' flexDirection='row'>
						<Button
							title='Close'
							color={COLORS.gray}
							onPress={() => {
								setDialogVisible(false);
								setSelectedField({});
							}}
						/>
						{loading ? (
							<ActivityIndicator size={'small'} color={COLORS.tertiary} />
						) : (
							<Button
								title='Save'
								color={COLORS.tertiary}
								onPress={async () => {
									try {
										if (editValue.id) {
											await updateUserProfile(editValue);
										} else {
											await createUserProfile(editValue);
										}
										showToast('Updated Successfully');
										setDialogVisible(false);
									} catch (error) {
										showToast('Failed to update');
										setDialogVisible(false);
									}
								}}
							/>
						)}
					</View>
				</Dialog.Container>
			</View>
			<View>
				<View justifyContent='center' alignItems='center' style={{ marginTop: 100 }}>
					<Avatar
						size={200}
						rounded
						title={initials}
						titleStyle={{ color: COLORS.primary }}
						containerStyle={{ backgroundColor: COLORS.lightWhite }}
					/>
					<View flexDirection='row'>
						<Text style={{ color: COLORS.lightWhite, fontSize: 14, marginTop: 10 }}>
							PIN: {userProfile?.pin ? userProfile?.pin.charAt(0) : '*'}*****
						</Text>
						<Pressable
							onPress={() => {
								setSelectedField({ name: 'pin', value: userProfile.pin ?? '' });
								setDialogVisible(true);
							}}>
							<Text style={{ color: COLORS.tertiary }}>
								{userProfile.pin == '' || !userProfile.pin ? 'Add' : 'Edit'}
							</Text>
						</Pressable>
					</View>
					<View flexDirection='row'>
						<Text style={{ color: COLORS.lightWhite, fontSize: 14, marginTop: 5 }}>
							PHONE: {userProfile?.phone ?? 'Not Set'}
						</Text>
						<Pressable
							onPress={() => {
								setSelectedField({ name: 'phone', value: userProfile.phone ?? '' });
								setDialogVisible(true);
							}}>
							<Text style={{ color: COLORS.tertiary }}>
								{userProfile.phone == '' || !userProfile.phone ? 'Add' : 'Edit'}
							</Text>
						</Pressable>
					</View>
				</View>
				<View
					flexDirection='row'
					justifyContent='space-between'
					style={{ marginHorizontal: 10, marginTop: 20 }}>
					<Text
						style={{
							color: COLORS.tertiary,
							fontSize: 25,
							fontWeight: 'bold',
							marginBottom: 5
						}}>
						Name
					</Text>
					<Pressable
						onPress={() => {
							setSelectedField({ name: 'name', value: userProfile.name ?? '' });
							setDialogVisible(true);
						}}>
						<Icon name='edit' size={25} color={COLORS.tertiary} style={{ marginLeft: 10 }} />
					</Pressable>
				</View>

				<View
					style={{
						padding: 5,
						backgroundColor: COLORS.lightWhite,
						marginBottom: 15,
						gap: 10,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Icon
						name='user-circle-o'
						type='font-awesome'
						size={35}
						color={COLORS.tertiary}
						style={{ marginTop: 5, flex: 1 }}
					/>
					<Text
						style={{
							color: userProfile?.name ? COLORS.primary : COLORS.gray2,
							fontSize: 25,
							flex: 1,
							padding: 10,
							borderWidth: 1,
							borderColor: COLORS.gray2
						}}>
						{userProfile.name ?? 'Not Set'}
					</Text>
				</View>

				<View flexDirection='row' justifyContent='space-between' style={{ marginHorizontal: 10 }}>
					<Text
						style={{
							color: COLORS.tertiary,
							fontSize: 25,
							fontWeight: 'bold',
							marginBottom: 5
						}}>
						Email
					</Text>
				</View>
				<View style={{ padding: 5, backgroundColor: COLORS.lightWhite, marginBottom: 15 }}>
					<View
						style={{
							backgroundColor: COLORS.lightWhite,
							gap: 10,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<Icon
							name='email'
							type='entypo'
							size={35}
							color={COLORS.tertiary}
							style={{ marginTop: 5, flex: 1 }}
						/>
						<Text
							style={{
								color: userProfile?.email ? COLORS.primary : COLORS.gray2,
								fontSize: 25,
								padding: 10,
								borderWidth: 1,
								flex: 1,
								borderColor: COLORS.gray2
							}}>
							{userProfile.email ?? user.email}
						</Text>
					</View>
				</View>
				<View flexDirection='row' justifyContent='space-between' style={{ marginHorizontal: 10 }}>
					<Text
						style={{
							color: COLORS.tertiary,

							fontSize: 25,
							fontWeight: 'bold',
							marginBottom: 5
						}}>
						Store Name
					</Text>
					<Pressable
						onPress={() => {
							setSelectedField({ name: 'store', value: userProfile.store ?? '' });
							setDialogVisible(true);
						}}>
						<Icon name='edit' size={25} color={COLORS.tertiary} style={{ marginLeft: 10 }} />
					</Pressable>
				</View>

				<View
					style={{
						backgroundColor: COLORS.lightWhite,
						gap: 10,
						padding: 5,
						marginBottom: 15,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Icon
						name='store'
						type='font-awesome-5'
						size={35}
						color={COLORS.tertiary}
						style={{ marginTop: 5, flex: 1 }}
					/>
					<Text
						style={{
							color: userProfile?.store ? COLORS.primary : COLORS.gray2,
							fontSize: 25,
							padding: 10,
							borderWidth: 1,
							flex: 1,
							borderColor: COLORS.gray2
						}}>
						{userProfile.store && userProfile.store != '' ? userProfile.store : 'Not Set'}
					</Text>
				</View>
				<View flexDirection='row' justifyContent='space-between' style={{ marginHorizontal: 10 }}>
					<Text
						style={{
							color: COLORS.tertiary,

							fontSize: 25,
							fontWeight: 'bold',
							marginBottom: 5
						}}>
						Store Address
					</Text>
					<Pressable
						onPress={() => {
							setSelectedField({ name: 'address', value: userProfile.address ?? '' });
							setDialogVisible(true);
						}}>
						<Icon name='edit' size={25} color={COLORS.tertiary} style={{ marginLeft: 10 }} />
					</Pressable>
				</View>

				<View
					style={{
						backgroundColor: COLORS.lightWhite,
						gap: 10,
						padding: 5,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Icon
						name='store'
						type='font-awesome-5'
						size={35}
						color={COLORS.tertiary}
						style={{ marginTop: 5, flex: 1 }}
					/>
					<Text
						style={{
							color: userProfile?.address ? COLORS.primary : COLORS.gray2,
							fontSize: 25,
							padding: 10,
							borderWidth: 1,
							flex: 1,
							borderColor: COLORS.gray2
						}}>
						{userProfile.address && userProfile.address != '' ? userProfile.address : 'Not Set'}
					</Text>
				</View>
				<View alignItems='flex-end' style={{ padding: 5, marginTop: 10 }}>
					<Pressable
						style={{
							backgroundColor: COLORS.tertiary,
							paddingHorizontal: 10,
							paddingVertical: 10,
							borderRadius: 5,
							elevation: 5
						}}
						onPress={() => router.push('/Printers')}>
						<Text style={{ color: COLORS.lightWhite }}>Printer Setup</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}
