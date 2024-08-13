import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { initializeAuth, getReactNativePersistence, getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { app } from '../firebase';

const useAuth = () => {
	const [user, setUser] = useState(null);
	const auth = getAuth(app);

	useEffect(() => {
		const unsubscribeFromAuthStateChanged = onAuthStateChanged(auth, user => {
			if (user) {
				setUser(user);
			} else {
				setUser(undefined);
			}
		});

		return unsubscribeFromAuthStateChanged;
	}, []);
};

export default useAuth;
