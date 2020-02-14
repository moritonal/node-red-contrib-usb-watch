const usbDetect = require('usb-detection');

module.exports = function (RED) {

	function UsbWatchNode(config) {

		RED.nodes.createNode(this, config);

		const node = this;

		const prepareMessage = (device) => {
			return {
				payload: device
			};
		};

		usbDetect.startMonitoring();

		const deviceAdded = (device) => {
			node.send([prepareMessage(device), null]);
		}

		const deviceRemoved = (device) => {
			node.send([null, prepareMessage(device)]);
		}

		usbDetect.on('add', deviceAdded);
		usbDetect.on('remove', deviceRemoved);

		if (config.initialScan) {

			usbDetect.find().then((devices) => {

				const messages = devices.map(i=>prepareMessage(i))

				node.send([messages, null]);

			}).catch((err) => {
				this.warn(err);
			});
		}

		node.on("close", (done) => {

			usbDetect.off("add", deviceAdded);
			usbDetect.off("remove", deviceRemoved);

			done();
		});
	}

	RED.nodes.registerType("usb-watch", UsbWatchNode);
}