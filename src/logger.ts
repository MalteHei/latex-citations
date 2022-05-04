export class Logger {
	public static DEBUG = false;

	public static debug(...msg: any[]): void {
		if (this.DEBUG) {
			console.log(...msg);
		}
	}

	public static log(...msg: any[]): void {
		console.log(...msg);
	}

	public static error(...msg: any[]): void {
		console.error(...msg);
	}
}
