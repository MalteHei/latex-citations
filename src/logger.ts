import * as vscode from 'vscode';
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

	public static registerConfigurationWatcher(): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		disposables.push(vscode.workspace.onDidChangeConfiguration(_ => this.updateDebugFlagFromConfig()));

		return disposables;
	}

	private static updateDebugFlagFromConfig(): void {
		this.DEBUG = this.readDebugFlagFromConfig();
	}

	private static readDebugFlagFromConfig(): boolean {
		const conf = vscode.workspace.getConfiguration(EXTENSION_NAME);
		const debug = conf.get<boolean>('debug') || this.DEBUG;

		return debug;
	}

}
