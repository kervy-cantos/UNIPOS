import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getDoc, setDoc, doc, collection, addDoc, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../firebase';

const db = getFirestore(app);
const storage = getStorage(app);

const uploadImage = async (image, id) => {
	const filename = image.uri.substring(image.uri.lastIndexOf('/') + 1);
	const storageRef = ref(storage, `/pos-kervy/${id}${filename}`);

	try {
		const response = await fetch(image.uri);
		const blob = await response.blob();

		const uploadTask = uploadBytesResumable(storageRef, blob, {
			contentType: 'image/jpeg' // Or 'image/png', 'video/mp4', etc.
		});

		return new Promise((resolve, reject) => {
			uploadTask.on(
				'state_changed',
				snapshot => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					console.log('Upload is ' + progress + '% done');
				},
				error => {
					console.error('Error uploading file:', error);
					reject(error);
				},
				async () => {
					const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
					console.log('File available at', downloadURL);
					resolve(downloadURL);
				}
			);
		});
	} catch (error) {
		console.error('Error uploading file:', error);
		throw error;
	}
};

const getCachedData = async key => {
	try {
		const data = await AsyncStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Error getting cached data:', error);
		return null;
	}
};

const syncData = async () => {
	const isConnected = await NetInfo.fetch().then(state => state.isConnected);
	if (isConnected) {
		const cachedCategories = await getCachedData('Categories');
		if (cachedCategories) {
			for (const category of cachedCategories) {
				const remoteDoc = await getDoc(doc(db, 'Categories', category.id));
				if (!remoteDoc.exists() || new Date(category.timestamp) > new Date(remoteDoc.data().timestamp)) {
					await setDoc(doc(db, 'Categories', category.id), category);
				}
			}
			await AsyncStorage.removeItem('Categories');
		}

		const cachedProducts = await getCachedData('Products');
		if (cachedProducts) {
			for (const product of cachedProducts) {
				const remoteDoc = await getDoc(doc(db, 'Inventory', product.id));
				if (!remoteDoc.exists() || new Date(product.timestamp) > new Date(remoteDoc.data().timestamp)) {
					const uniqueId = uuidv4();
					const imageUrl = await uploadImage(product.image, uniqueId);
					await setDoc(doc(db, 'Inventory', product.id), { ...product, image: imageUrl });
				}
			}
			await AsyncStorage.removeItem('Products');
		}
	}
};

export { syncData };
