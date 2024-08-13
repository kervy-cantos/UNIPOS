import { View, Text, Pressable, FlatList, ToastAndroid } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../hooks/zustand/store';
import { BluetoothManager, BluetoothEscposPrinter, BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';
import { COLORS } from '../constants';
import { ActivityIndicator } from 'react-native';
import { Icon } from '@rneui/base';

export default function Printers() {
	const { user, userProfile, updateUserProfile } = useAuthStore(state => state);
	const [scanning, setScanning] = useState(false);
	const [devices, setDevices] = useState({});
	const [connecting, setConnecting] = useState(false);
	const [connectedPrinter, setConnectedPrinter] = useState({});

	const showToast = message => {
		ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
	};

	return (
		<View>
			<Stack.Screen
				options={{
					headerTitle: 'Printer Settings'
				}}
			/>
			<View style={{ minHeight: '50%' }}>
				{devices != {} && (
					<View>
						<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Paired Devices</Text>
						<FlatList
							style={{ padding: 10 }}
							data={devices.paired}
							renderItem={({ item }) => (
								<View
									style={{
										height: 50,
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
										borderWidth: 1,
										marginBottom: 2,
										paddingHorizontal: 10
									}}>
									<Text>{item.name}</Text>
									{connecting ? (
										<ActivityIndicator size={'small'} color={'black'} />
									) : (
										<Pressable
											onPress={async () => {
												const isConnected = connectedPrinter?.address == item.address;
												if (isConnected) {
													setConnecting(true);
													try {
														await BluetoothManager.unpaire(item.address);
														setConnectedPrinter({});
														await updateUserProfile({ id: userProfile.id, printer: {} });
														showToast('Disconnected from printer' + item.name);
													} catch (error) {
														showToast('Error disconnecting from printer' + item.name);
													}
													setConnecting(false);
												} else {
													setConnecting(true);
													try {
														await BluetoothManager.connect(item.address);
														setConnectedPrinter(item);
														await updateUserProfile({
															id: userProfile.id,
															printer: { name: item.name, address: item.address }
														});
														showToast('Connected to printer' + item.name);
													} catch (error) {
														setConnectedPrinter({});
														showToast('Error connecting to printer' + item.name);
													}
													setConnecting(false);
													console.log('connected');
												}
											}}>
											<Icon
												name='bluetooth-connected'
												type='material'
												color={connectedPrinter?.address == item.address ? 'blue' : 'black'}
											/>
										</Pressable>
									)}
								</View>
							)}
						/>
						<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Found Devices</Text>
						<FlatList
							style={{ padding: 10 }}
							data={devices.found}
							renderItem={({ item }) => {
								return (
									<View
										style={{
											height: 50,
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											borderWidth: 1,
											marginBottom: 2,
											paddingHorizontal: 10
										}}>
										<Text>{item.name}</Text>
										{connecting ? (
											<ActivityIndicator size={'small'} color={'black'} />
										) : (
											<Pressable
												onPress={async () => {
													const isConnected = connectedPrinter?.address == item.address;
													if (isConnected) {
														setConnecting(true);
														try {
															await BluetoothManager.unpaire(item.address);
															setConnectedPrinter({});
															await updateUserProfile({
																id: userProfile.id,
																printer: {}
															});
															showToast('Disconnected from printer' + item.name);
														} catch (error) {
															showToast('Error disconnecting from printer' + item.name);
														}
														setConnecting(false);
													} else {
														setConnecting(true);
														try {
															await BluetoothManager.connect(item.address);
															setConnectedPrinter(item);
															await updateUserProfile({
																id: userProfile.id,
																printer: { name: item.name, address: item.address }
															});
															showToast('Connected to printer' + item.name);
														} catch (error) {
															setConnectedPrinter({});
															showToast('Error connecting to printer' + item.name);
														}
														setConnecting(false);
														console.log('connected');
													}
												}}>
												<Icon
													name='bluetooth-connected'
													type='material'
													color={connectedPrinter?.address == item.address ? 'blue' : 'black'}
												/>
											</Pressable>
										)}
									</View>
								);
							}}
						/>
					</View>
				)}
			</View>
			<View>
				<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Saved Printer</Text>
				<View
					style={{
						height: 50,
						marginHorizontal: 10,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						borderWidth: 1,
						marginBottom: 10,
						paddingHorizontal: 10
					}}>
					<Text style={{ color: 'black' }}>{userProfile.printer?.name ?? 'No printer connected'}</Text>
					{connecting ? (
						<ActivityIndicator size={'small'} color={'black'} />
					) : userProfile.printer ? (
						<Pressable
							onPress={async () => {
								const isConnected = connectedPrinter?.address == userProfile?.printer?.address;
								if (isConnected) {
									setConnecting(true);
									try {
										await BluetoothManager.unpaire(userProfile?.printer?.address);
										setConnectedPrinter({});
										await updateUserProfile({ id: userProfile.id, printer: {} });
										showToast('Disconnected from printer' + userProfile?.printer?.name);
									} catch (error) {
										showToast('Error disconnecting from printer' + userProfile?.printer?.name);
									}
									setConnecting(false);
								} else {
									setConnecting(true);
									try {
										await BluetoothManager.connect(userProfile?.printer?.address);
										setConnectedPrinter(userProfile?.printer);
										await updateUserProfile({
											id: userProfile.id,
											printer: {
												name: userProfile?.printer?.name,
												address: userProfile?.printer?.address
											}
										});
										showToast('Connected to printer' + userProfile?.printer?.name);
									} catch (error) {
										setConnectedPrinter({});
										showToast('Error connecting to printer' + userProfile?.printer?.name);
									}
									setConnecting(false);
									console.log('connected');
								}
							}}>
							<Icon
								name='bluetooth-connected'
								type='material'
								color={connectedPrinter?.address == userProfile?.printer?.address ? 'blue' : 'black'}
							/>
						</Pressable>
					) : null}
				</View>
			</View>
			<View justifyContent='center' alignItems='center'>
				<Pressable
					style={{ backgroundColor: COLORS.primary, padding: 10 }}
					onPress={async () => {
						const check = await BluetoothManager.isBluetoothEnabled();
						if (!check) {
							await BluetoothManager.enableBluetooth();
						}
						setScanning(true);
						const dev = await BluetoothManager.scanDevices();

						setDevices(JSON.parse(dev) ?? {});
						setScanning(false);
					}}>
					{scanning ? (
						<View flexDirection='row' style={{ gap: 10 }}>
							<ActivityIndicator size={'small'} color='white' />
							<Text style={{ color: 'white' }}>Scanning ...</Text>
						</View>
					) : (
						<Text style={{ color: 'white' }}>Scan for Devices</Text>
					)}
				</Pressable>
			</View>
			<Text style={{ marginHorizontal: 'auto', marginTop: 30, fontWeight: 'bold' }}>
				Tap on <Icon name='bluetooth-connected' type='material' /> to connect
			</Text>
			<Text style={{ textAlign: 'center', color: COLORS.tertiary }}>
				Please make sure you are connecting to an actual ecspos printer
			</Text>
		</View>
	);
}
