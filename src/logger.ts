import { EXTENSION_NAME } from "./extension";


export class Logger {
	public static DEBUG = false;

	public static debug(...msg: any[]): void {
		if (this.DEBUG) {
			console.log(`[${EXTENSION_NAME}]`, '[DEBUG]', ...msg);
		}
	}

	public static log(...msg: any[]): void {
		console.log(`[${EXTENSION_NAME}]`, '[LOG]', ...msg);
	}

	public static error(...msg: any[]): void {
		console.error(`[${EXTENSION_NAME}]`, '[ERROR]', ...msg);
	}
}
