import { Text, View, StyleSheet, Button, RefreshControl } from 'react-native';

import { COLORS, icons, images, SIZES } from '../../constants';
import { FAB } from '@rneui/themed';
import { useCategoriesStore } from '../../hooks/zustand/store';
import CategoryCard from '../common/cards/categories/CategoriesCard';
import { useCallback, useEffect, useState } from 'react';
import InventoryList from './InventoryList';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native';

export default function Inventory() {
	const [hasSelected, setHasSelected] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { data: categories, setSelectedInventoryData, loading, fetchCategories } = useCategoriesStore(state => state);
	const router = useRouter();

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchCategories();
		setRefreshing(false);
	}, []);
	return (
		<View>
			<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				{!hasSelected ? (
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							padding: SIZES.medium
						}}>
						{categories.length != 0 &&
							categories.map(cat => (
								<View
									key={cat.id}
									style={{
										width: '50%' // Ensures each item takes up 50% of the container width, 2 items per row
									}}>
									<CategoryCard
										categoryName={cat}
										setHasSelected={setHasSelected}
										isEditing={isEditing}
										isDeleting={isDeleting}
										setIsDeleting={setIsDeleting}
										setIsEditing={setIsEditing}
									/>
								</View>
							))}
					</View>
				) : (
					<View>
						<View style={{ minHeight: '80%' }}>
							<InventoryList />
						</View>
					</View>
				)}

				{categories.length == 0 && (
					<View style={{ marginBottom: 20 }}>
						<Text style={{ textAlign: 'center' }}>Please add a category</Text>
					</View>
				)}
				{!hasSelected && (
					<View flexDirection='row' justifyContent='space-around' alignItems='center'>
						<View>
							<Button
								title={!isEditing ? 'Edit' : 'Cancel Edit'}
								color={!isEditing ? COLORS.tertiary : COLORS.primary}
								onPress={() => setIsEditing(!isEditing)}
								disabled={isDeleting}
								style={{ borderRadius: 15 }}
							/>
						</View>
						<FAB
							visible={true}
							icon={{ name: 'add', color: 'white' }}
							color={COLORS.tertiary}
							onPress={() => router.push('/AddCategory')}
						/>
						<View>
							{!loading ? (
								<Button
									title={isDeleting ? 'Cancel Delete' : 'Delete'}
									color={isDeleting ? 'red' : COLORS.gray2}
									onPress={() => setIsDeleting(!isDeleting)}
									disabled={isEditing}
									style={{ borderRadius: 15 }}
								/>
							) : (
								<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
									<ActivityIndicator size='large' color={COLORS.primary} />
								</View>
							)}
						</View>
					</View>
				)}
			</ScrollView>
			{hasSelected && (
				<View alignItems='center' style={{ marginTop: 10, zIndex: 999 }}>
					<View style={{ width: 150 }}>
						<Button
							onPress={() => {
								setHasSelected(false);
								setSelectedInventoryData([]);
							}}
							title='Back To Categories'
							color={COLORS.gray}
						/>
					</View>
				</View>
			)}
		</View>
	);
}
