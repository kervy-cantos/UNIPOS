import { create } from 'zustand';
import { app } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import {
	addDoc,
	collection,
	getDoc,
	getDocs,
	getFirestore,
	where,
	query,
	doc,
	updateDoc,
	deleteDoc,
	writeBatch,
	orderBy,
	limit,
	and
} from 'firebase/firestore';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

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

const cacheData = async (key, data) => {
	try {
		await AsyncStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error('Error caching data:', error);
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
				await addDoc(collection(db, 'Categories'), category);
			}
			await AsyncStorage.removeItem('Categories');
		}

		const cachedProducts = await getCachedData('Products');
		if (cachedProducts) {
			for (const product of cachedProducts) {
				const uniqueId = uuidv4();
				const imageUrl = await uploadImage(product.image, uniqueId);
				await addDoc(collection(db, 'Inventory'), { ...product, image: imageUrl });
			}
			await AsyncStorage.removeItem('Products');
		}
	}
};

export const useCategoriesStore = create(set => ({
	loading: false,
	data: [],
	selectedInventoryData: [],
	fetchCategories: async () => {
		const user = getAuth(app).currentUser;
		if (!user) return;
		set({ loading: true });
		const data = await getDocs(query(collection(db, 'Categories'), where('userId', '==', user.uid)));
		set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
		set({ loading: false });
	},
	addCategory: async category => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);
		const user = getAuth(app).currentUser;
		if (isConnected) {
			try {
				const docRef = await addDoc(collection(db, 'Categories'), { ...category, userId: user.uid });
				console.log('Category added with ID:', docRef.id);
				const data = await getDocs(query(collection(db, 'Categories'), where('userId', '==', user.uid)));
				set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			} catch (error) {
				console.error('Error adding category:', error);
			}
		} else {
			const cachedCategories = (await getCachedData('Categories')) || [];
			cachedCategories.push(category);
			await cacheData('Categories', cachedCategories);
			console.log('Category cached locally');
		}

		set({ loading: false });
	},
	updateCategory: async (id, updatedCategory) => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);
		const user = getAuth(app).currentUser;
		if (isConnected) {
			try {
				const categoryDoc = doc(db, 'Categories', id);
				await updateDoc(categoryDoc, { ...updatedCategory, userId: user.uid });
				console.log('Category updated with ID:', id);
				const data = await getDocs(query(collection(db, 'Categories'), where('userId', '==', user.uid)));
				set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			} catch (error) {
				console.error('Error updating category:', error);
			}
		} else {
			console.log('No internet connection. Update failed.');
		}
		set({ loading: false });
	},
	deleteCategory: async categoryId => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);
		const user = getAuth(app).currentUser;
		if (isConnected) {
			try {
				// Delete the category document
				const categoryDoc = doc(db, 'Categories', categoryId);
				await deleteDoc(categoryDoc);

				// Find and delete associated products
				const productsQuery = query(collection(db, 'Inventory'), where('categoryId', '==', categoryId));
				const querySnapshot = await getDocs(productsQuery);
				const batch = writeBatch(db);

				querySnapshot.forEach(doc => {
					batch.delete(doc.ref);
				});

				await batch.commit();
				console.log('Category and associated products deleted with ID:', categoryId);

				// Update categories and products stores
				const data = await getDocs(query(collection(db, 'Categories'), where('userId', '==', user.uid)));
				set({ categories: categoriesData.docs.map(doc => ({ ...doc.data(), id: doc.id })) });

				const productsData = await getDocs(
					query(collection(db, 'Categories'), where('userId', '==', user.uid))
				);
				useProductsStore.setState({
					data: productsData.docs.map(doc => ({ ...doc.data(), id: doc.id }))
				});
			} catch (error) {
				console.error('Error deleting category and associated products:', error);
			}
		} else {
			console.log('No internet connection. Delete failed.');
		}
		set({ loading: false });
	},

	setSelectedInventoryData: async id => {
		const user = getAuth(app).currentUser;
		try {
			set({ loading: true });

			const q = query(
				collection(db, 'Inventory'),
				where('categoryId', '==', id),
				where('userId', '==', user.uid)
			);
			const snapshot = await getDocs(q);
			const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
			set({ selectedInventoryData: data, loading: false });
		} catch (error) {
			// Handle any errors
			console.error('Error fetching inventory data: ', error);
			set({ loading: false });
			throw new Error('Error fetching inventory');
		}
	}
}));

export const useProductsStore = create(set => ({
	modal: false,
	loading: false,
	selectedProduct: {},
	data: [],
	setModal: value => set({ modal: value }),
	fetchProducts: async () => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		if (!user) return;
		try {
			const data = await getDocs(query(collection(db, 'Inventory'), where('userId', '==', user.uid)));
			set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
		} catch (error) {
			console.error('Error fetching products:', error);
		}

		set({ loading: false });
	},
	setProductDetails: id => {
		set(state => ({ selectedProduct: state.data.find(product => product.id === id) }));
	},
	addProduct: async product => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);
		const user = getAuth(app).currentUser;
		if (isConnected) {
			try {
				let imageUrl = '';
				const uniqueId = uuidv4();

				if (product.image !== null) {
					imageUrl = await uploadImage(product.image, uniqueId);
				}

				const docRef = await addDoc(collection(db, 'Inventory'), {
					...product,
					image: imageUrl,
					userId: user.uid
				});
				console.log('Product added with ID:', docRef.id);
				const data = await getDocs(query(collection(db, 'Inventory'), where('userId', '==', user.uid)));
				set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			} catch (error) {
				console.error('Error adding product:', error);
			}
		} else {
			const cachedProducts = (await getCachedData('Products')) || [];
			cachedProducts.push(product);
			await cacheData('Products', cachedProducts);
			console.log('Product cached locally');
		}

		set({ loading: false });
	},
	updateProduct: async (id, updatedProduct) => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);
		const user = getAuth(app).currentUser;
		if (isConnected) {
			try {
				const uniqueId = uuidv4();
				if (updatedProduct.newImage) {
					const imageUrl = await uploadImage(updatedProduct.newImage, uniqueId);
					updatedProduct.image = imageUrl;
					delete updatedProduct.newImage;
				}
				const productDoc = doc(db, 'Inventory', id);
				await updateDoc(productDoc, { ...updatedProduct, userId: user.uid });
				console.log('Product updated with ID:', id);
				const data = await getDocs(query(collection(db, 'Inventory'), where('userId', '==', user.uid)));
				set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			} catch (error) {
				console.error('Error updating product:', error);
			}
		} else {
			console.log('No internet connection. Update failed.');
		}
		set({ loading: false });
	},
	deleteProduct: async id => {
		set({ loading: true });
		const isConnected = await NetInfo.fetch().then(state => state.isConnected);

		if (isConnected) {
			try {
				const productDoc = doc(db, 'Inventory', id);
				await deleteDoc(productDoc);
				console.log('Product deleted with ID:', id);
				const data = await getDocs(query(collection(db, 'Inventory'), where('userId', '==', user.uid)));
				set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			} catch (error) {
				console.error('Error deleting product:', error);
			}
		} else {
			console.log('No internet connection. Delete failed.');
		}
		set({ loading: false });
	}
}));

export const useCartStore = create(set => ({
	data: [],
	addToCart: product => {
		set(state => {
			const existingProduct = state.data.find(item => item.id === product.id);
			if (existingProduct) {
				existingProduct.quantity += 1;
				return { data: state.data };
			}

			return { data: [...state.data, { ...product, quantity: 1 }] };
		});
	},
	reduceQuantity: id => {
		set(state => {
			const existingProduct = state.data.find(item => item.id === id);
			if (existingProduct.quantity > 1) {
				existingProduct.quantity -= 1;
				return { data: state.data };
			}
			if (existingProduct.quantity === 1) {
				return { data: state.data.filter(item => item.id !== id) };
			}
			return { data: state.data.filter(item => item.id !== id) };
		});
	},

	removeFromCart: id => {
		set(state => ({ data: state.data.filter(item => item.id !== id) }));
	},
	clearCart: () => set({ data: [] })
}));

export const useAuthStore = create(set => ({
	user: null,
	userProfile: null,
	loading: false,
	loginError: null,
	signUp: async (email, password) => {
		set({ loading: true });
		set({ loginError: null });
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;
			const newUser = { email: user.email, userId: user.uid, name: user.displayName };
			const docRef = await addDoc(collection(db, 'Users'), newUser);

			set({ user: { id: user.uid, email: user.email } });
			set({ userProfile: newUser });
		} catch (error) {
			console.error('Error signing up:', error);
			set({ loginError: error });
			throw new Error('Error signing up');
		}
		set({ loading: false });
	},
	login: async (email, password) => {
		set({ loading: true });
		set({ loginError: null });
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);

			const user = userCredential.user;
			console.log('Signed in as:', user.email);
			set({ user: { id: user.uid, email: user.email } });
			set({ userProfile: { email: user.email, userId: user.uid, name: user.displayName } });
		} catch (error) {
			console.error('Error signing in:', error);
			set({ loginError: true });
			throw new Error('Error signing in');
		}
		set({ loading: false });
	},
	logout: async () => {
		set({ loading: true });
		try {
			await signOut(auth);
			console.log('Signed out');
			set({ user: null });
		} catch (error) {
			console.error('Error signing out:', error);
		}
		set({ loading: false });
	},
	updateUserProfile: async updatedProfile => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		try {
			const userDoc = doc(db, 'Users', updatedProfile.id);
			delete updatedProfile.id;
			await updateDoc(userDoc, updatedProfile);
			const newProfileData = await getDoc(userDoc);
			set({ userProfile: { ...newProfileData.data(), id: newProfileData.id } });
		} catch (error) {
			console.error('Error updating user profile:', error);
		}
		set({ loading: false });
	},
	createUserProfile: async profile => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		try {
			const docRef = await addDoc(collection(db, 'Users'), { ...profile, userId: user.uid });
			console.log('User profile added with ID:', docRef.id);
			set({ userProfile: { ...profile, id: docRef.id } });
		} catch (error) {
			console.error('Error creating user profile:', error);
		}
		set({ loading: false });
	},
	setUserProfile: async user => {
		set({ loading: true });

		try {
			const q = query(collection(db, 'Users'), where('userId', '==', user.uid));
			const data = await getDocs(q);
			if (!data.empty) {
				const userProfile = { ...data.docs[0].data(), id: data.docs[0].id };
				set({ userProfile });
			}
		} catch (error) {
			console.error('Error fetching user profile:', error);
		}
		set({ loading: false });
	}
}));

export const useTransactionStore = create(set => ({
	data: [],
	loading: false,
	selectedTransactionProducts: [],
	addTransaction: async transaction => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		const batch = writeBatch(db); // Create a batch for atomic updates

		try {
			// Add the transaction to Firestore
			const docRef = await addDoc(collection(db, 'Transactions'), { ...transaction, userId: user.uid });
			console.log('Transaction added with ID:', docRef.id);

			// Update stock levels for each product in the transaction
			for (const item of transaction.products) {
				// Assume `products` contains product IDs and quantities
				const productDoc = doc(db, 'Inventory', item.id); // Get reference to the product
				const productSnapshot = await getDoc(productDoc);

				if (productSnapshot.exists()) {
					const productData = productSnapshot.data();
					const newStock = productData.stock - item.quantity; // Subtract the quantity

					if (newStock < 0) {
						throw new Error(`Not enough stock for product ${item.productId}`);
					}

					batch.update(productDoc, { stock: newStock }); // Queue the update
				} else {
					console.warn(`Product ${item.productId} not found`);
				}
			}

			// Commit the batch update
			await batch.commit();
			const productData = await getDocs(query(collection(db, 'Inventory'), where('userId', '==', user.uid)));
			useProductsStore.setState({ data: productData.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
			// Fetch updated transactions
			const q = query(collection(db, 'Transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
			const data = await getDocs(q);
			set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });

			set({ loading: false });
			return docRef.id;
		} catch (error) {
			set({ loading: false });
			console.error('Error adding transaction:', error);
			throw new Error('Error adding transaction');
		}
	},
	fetchTransactions: async () => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		try {
			const q = query(collection(db, 'Transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));

			// Fetch the documents according to the query
			const data = await getDocs(q);

			// Map the documents to include the ID
			set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
		} catch (error) {
			console.error('Error fetching transactions:', error);
		}
		set({ loading: false });
	},
	fetchLatestTransaction: async () => {
		set({ loading: true });
		const user = getAuth(app).currentUser;
		try {
			const q = query(
				collection(db, 'Transactions'),
				where('userId', '==', user.uid),
				orderBy('date', 'desc'),
				limit(1)
			);

			// Fetch the document according to the query
			const data = await getDocs(q);

			// Assuming there is at least one document
			if (!data.empty) {
				const latestTransaction = { ...data.docs[0].data(), id: data.docs[0].id };
				set({ data: [latestTransaction] }); // Optionally, you could replace the entire data array or just handle this differently
				return latestTransaction;
			} else {
				console.error('No transactions found');
				return null;
			}
		} catch (error) {
			console.error('Error fetching the latest transaction:', error);
			throw new Error('Error fetching the latest transaction');
		} finally {
			set({ loading: false });
		}
	},
	deleteTransaction: async id => {
		const user = getAuth(app).currentUser;
		set({ loading: true });
		try {
			const transDoc = doc(db, 'Transactions', id);
			await deleteDoc(transDoc);
			console.log('Product deleted with ID:', id);
			const q = query(collection(db, 'Transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
			const data = await getDocs(q);

			set({ data: data.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
		} catch (error) {
			console.error('Error deleting product:', error);
		}
		set({ loading: false });
	}
}));

syncData();
