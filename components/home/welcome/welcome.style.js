import { StyleSheet } from 'react-native';

import { COLORS, FONT, SIZES } from '../../../constants';

const styles = StyleSheet.create({
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	userName: {
		fontFamily: FONT.regular,
		fontSize: SIZES.large,
		color: COLORS.secondary
	},
	welcomeMessage: {
		fontFamily: FONT.bold,
		fontSize: SIZES.xLarge,
		color: COLORS.primary,
		marginTop: 2
	},
	searchContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		marginTop: SIZES.large,
		height: 50
	},
	searchWrapper: {
		flex: 1,
		backgroundColor: COLORS.white,
		marginRight: SIZES.small,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: SIZES.medium,
		height: '100%'
	},
	searchInput: {
		fontFamily: FONT.regular,
		width: '100%',
		height: '100%',
		paddingHorizontal: SIZES.medium
	},
	searchBtn: {
		width: 50,
		height: '100%',
		backgroundColor: COLORS.tertiary,
		borderRadius: SIZES.medium,
		justifyContent: 'center',
		alignItems: 'center'
	},
	searchBtnImage: {
		width: '50%',
		height: '50%',
		tintColor: COLORS.white
	},
	tabsContainer: {
		width: '100%',
		marginTop: SIZES.medium
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2
	},
	buttonAdd: {
		backgroundColor: COLORS.tertiary,
		color: 'white'
	},
	buttonAdd2: {
		backgroundColor: COLORS.secondary,
		color: 'white'
	},
	buttonAdd3: {
		backgroundColor: COLORS.primary,
		color: 'white'
	},
	textStyle: {
		color: 'white'
	},
	tab: (activeJobType, item) => ({
		paddingVertical: SIZES.small / 2,
		paddingHorizontal: SIZES.small,
		borderRadius: SIZES.medium,
		borderWidth: 1,
		borderColor: activeJobType === item ? COLORS.secondary : COLORS.gray2
	}),
	tabText: (activeJobType, item) => ({
		fontFamily: FONT.medium,
		color: activeJobType === item ? COLORS.secondary : COLORS.gray2
	})
});

export default styles;
