import moment from 'moment';
import { BluetoothManager, BluetoothEscposPrinter, BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';

const getCartTotal = cart => {
	let p = 0;

	cart.products.forEach(item => {
		p += item.quantity * item.price;
	});
	return p;
};

export const connectPrinter = async (cart, profile) => {
	if (!cart) return;
	let printed = false;
	if (!profile) return printed;
	const device = profile.printer;

	try {
		if (device) {
			await BluetoothManager.connect(device.address);
			await BluetoothEscposPrinter.printerInit();
			await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
			await BluetoothEscposPrinter.setBlob(0);

			await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
			await BluetoothEscposPrinter.printText(`${profile.store ?? 'Please Set a Store Name'} \n\r\n\r`, {
				heigthtimes: 2
			});
			await BluetoothEscposPrinter.printText(`${profile.address ?? ''}\n\r\n\r`, {
				heigthtimes: 0
			});
			await BluetoothEscposPrinter.printText(
				'Date/Time: ' + moment(new Date(cart.date)).format('YYYY-MM-DD hh:mm:ss') + '\n\r',
				{}
			);
			await BluetoothEscposPrinter.printText('SALES INVOICE\n\r', {});
			await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
			await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
			let columnWidths = [12, 6, 12];
			await BluetoothEscposPrinter.printColumn(
				columnWidths,
				[
					BluetoothEscposPrinter.ALIGN.LEFT,
					BluetoothEscposPrinter.ALIGN.CENTER,
					BluetoothEscposPrinter.ALIGN.RIGHT
				],
				['ITEM', 'QTY', 'SUBTOTAL'],
				{}
			);
			cart.products.forEach(async item => {
				let columnWidths = [12, 6, 12];
				await BluetoothEscposPrinter.printColumn(
					columnWidths,
					[
						BluetoothEscposPrinter.ALIGN.LEFT,
						BluetoothEscposPrinter.ALIGN.CENTER,
						BluetoothEscposPrinter.ALIGN.RIGHT
					],
					[item.name, `${item.quantity}`, `P ${item.price * item.quantity}`],
					{}
				);
			});

			await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
			const totalColumnWidths = [16, 16];
			const total = getCartTotal(cart);
			await BluetoothEscposPrinter.printColumn(
				totalColumnWidths,
				[BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
				['TOTAL', `P ${total}`],
				{}
			);
			await BluetoothEscposPrinter.printColumn(
				totalColumnWidths,
				[BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
				['CASH', `P ${cart.cash}`],
				{}
			);
			await BluetoothEscposPrinter.printColumn(
				totalColumnWidths,
				[BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
				['CHANGE', `P 	${cart.change}`],
				{}
			);
			const cartNumber = cart.number.toString().padStart(6, '0');
			await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
			await BluetoothEscposPrinter.printText(
				`**Thank you${cart.customer ? ` ${cart.customer}!` : '!'}**\n\r`,
				{}
			);
			await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
			await BluetoothEscposPrinter.printText(`TRANSACTION ID: ${cartNumber}\n\r`, {});
			await BluetoothEscposPrinter.printText(`CASHIER: ${profile.name ?? '#######'}\n\r`, {});
			await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
			await BluetoothEscposPrinter.printText('Contact Us\n\r', {});
			await BluetoothEscposPrinter.printText(`MOBILE: ${profile.phone ?? '############'} \n\r`, {});

			await BluetoothEscposPrinter.printText('\n\r\n\r\n\r\n\r\n\r', {});
		}
	} catch (error) {
		throw error;
	}
	printed = true;
	return printed;
};

export const printToKitchenPos = async (cart, profile) => {
	let printedToKitchen = false;
	if (!cart) return printedToKitchen;
	const device = profile.printer;
	try {
		if (!device) return printedToKitchen;

		await BluetoothManager.connect(device.address);
		await BluetoothEscposPrinter.printerInit();
		await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
		await BluetoothEscposPrinter.setBlob(0);
		const cartNumber = cart.number.toString().padStart(6, '0');
		await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
		await BluetoothEscposPrinter.printText(`TRANSACTION #${cartNumber} \n\r\n\r`, { heigthtimes: 2 });
		await BluetoothEscposPrinter.printText(
			'Date/Time: ' + moment(new Date(cart.date)).format('YYYY-MM-DD hh:mm:ss') + '\n\r',
			{}
		);
		await BluetoothEscposPrinter.printText(`CUSTOMER NAME ${cart.customer}\n\r`, {
			heigthtimes: 0
		});
		let columnWidths = [16, 16];
		await BluetoothEscposPrinter.printColumn(
			columnWidths,
			[BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
			['ITEM', 'QUANTITY'],
			{}
		);
		cart.products.forEach(async item => {
			await BluetoothEscposPrinter.printColumn(
				columnWidths,
				[BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
				[item.name, `${item.quantity}\n\r`],
				{}
			);
		});
		await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
		await BluetoothEscposPrinter.printText(`CASHIER: ${profile.name ?? '#######'}\n\r`, {});
		await BluetoothEscposPrinter.printText('\n\r\n\r\n\r', {});
		return (printedToKitchen = true);
	} catch (error) {
		console.log('Error printing to kitchen', error);
		throw error;
	}
};
