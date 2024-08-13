import * as React from 'react';
import { SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Inventory from '../components/inventory/Inventory';
import { COLORS, SIZES } from '../constants';
import { useCategoriesStore, useTransactionStore } from '../hooks/zustand/store';
import Transactions from '../components/inventory/Transactions';

const FirstRoute = () => (
	<View>
		<Inventory />
	</View>
);

const SecondRoute = () => (
	<View>
		<Transactions />
	</View>
);

const renderScene = SceneMap({
	first: FirstRoute,
	second: SecondRoute
});

export default function TabViewExample({ categoryName }) {
	const layout = useWindowDimensions();
	const { fetchTransactions } = useTransactionStore();

	const [index, setIndex] = React.useState(0);
	const [routes] = React.useState([
		{ key: 'first', title: 'Inventory' },
		{ key: 'second', title: 'Transactions' }
	]);
	React.useEffect(() => {
		useCategoriesStore.setState({ selectedInventoryData: [] });
		fetchTransactions();
	}, []);

	const renderTabBar = props => (
		<TabBar
			{...props}
			indicatorStyle={index == 0 ? { backgroundColor: COLORS.secondary } : { backgroundColor: COLORS.tertiary }}
			style={index == 0 ? { backgroundColor: COLORS.tertiary } : { backgroundColor: COLORS.secondary }}
		/>
	);

	return (
		<TabView
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			renderTabBar={renderTabBar}
			initialLayout={{ width: layout.width }}
		/>
	);
}

const styles = StyleSheet.create({
	footer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		height: 60,
		backgroundColor: COLORS.tertiary,
		justifyContent: 'center',
		alignItems: 'center'
	},
	footerText: {
		color: COLORS.lightWhite,
		fontSize: SIZES.font
	}
});
