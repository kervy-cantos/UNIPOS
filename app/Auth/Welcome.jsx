import { View, Text, SafeAreaView, Pressable } from 'react-native';
import React from 'react';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInUp, SlideInDown, SlideInUp } from 'react-native-reanimated';
import { Screen } from 'expo-router/build/views/Screen';
import { Stack } from 'expo-router';
import { COLORS, SIZES } from '../../constants';
import { ScrollView } from 'react-native';
import HomeAnimation from '../../components/common/home/HomeAnimation';
import SignInForm from '../../components/forms/signInForm';
import SignUpForm from '../../components/forms/signUpForm';

export default function Welcome() {
	const [showSignInForm, setShowSignInForm] = React.useState(false);
	const [showSignUpForm, setShowSignUpForm] = React.useState(false);
	return (
		<SafeAreaView style={{ padding: 5, backgroundColor: COLORS.primary, height: '100%' }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						padding: SIZES.medium,
						height: '100%',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: COLORS.primary
					}}>
					<View style={{ padding: SIZES.medium, height: '100%' }}>
						<HomeAnimation />

						<Animated.View
							style={{ padding: SIZES.medium }}
							entering={FadeInDown.duration(1000)}
							exiting={FadeInUp.duration(1000)}>
							<Text style={{ color: COLORS.lightWhite, fontSize: 50, textAlign: 'center' }}>Welcome</Text>
						</Animated.View>
						<Animated.View style={{ padding: SIZES.medium }} entering={FadeInDown.duration(2000)}>
							<Text style={{ color: COLORS.lightWhite, fontSize: 20, textAlign: 'center' }}>
								Please Log In
							</Text>
						</Animated.View>
						{!showSignInForm && !showSignUpForm && (
							<Animated.View
								style={{ padding: SIZES.medium }}
								entering={FadeInDown.delay(200).duration(1000)}>
								<Pressable
									style={{ backgroundColor: COLORS.tertiary, paddingVertical: 10, borderRadius: 5 }}
									onPress={() => {
										setShowSignUpForm(false);
										setShowSignInForm(true);
									}}>
									<Text style={{ color: COLORS.lightWhite, fontSize: 20, textAlign: 'center' }}>
										Sign In
									</Text>
								</Pressable>
							</Animated.View>
						)}
						{showSignInForm && (
							<Animated.View style={{ minWidth: 300 }} entering={FadeInLeft.duration(500)}>
								<SignInForm setShowSignInForm={setShowSignInForm} showSignInForm={showSignInForm} />
							</Animated.View>
						)}
						{showSignUpForm && (
							<Animated.View style={{ minWidth: 300 }} entering={FadeInLeft.duration(500)}>
								<SignUpForm setShowSignUpForm={setShowSignUpForm} showSignUpForm={showSignUpForm} />
							</Animated.View>
						)}
					</View>
					{showSignInForm && (
						<View flexDirection='row'>
							<Text style={{ color: COLORS.lightWhite }}>No account yet ? </Text>
							<Pressable
								onPress={() => {
									setShowSignInForm(false);
									setShowSignUpForm(true);
								}}>
								<Text style={{ color: COLORS.tertiary }}>Sign Up</Text>
							</Pressable>
						</View>
					)}
					{showSignUpForm && (
						<View flexDirection='row'>
							<Text style={{ color: COLORS.lightWhite }}>Already have an account ? </Text>
							<Pressable
								onPress={() => {
									setShowSignUpForm(false);
									setShowSignInForm(true);
								}}>
								<Text style={{ color: COLORS.tertiary }}>Sign In</Text>
							</Pressable>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
