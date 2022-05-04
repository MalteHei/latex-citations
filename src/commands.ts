import * as vscode from "vscode";
import { FileReader } from "./file-reader";
import * as packageJSN from '../package.json';


export class Commands {
	private static readonly COMMANDS = packageJSN.contributes.commands;

	/**
	 * Register commands for this extension in vscode.
	 */
	public static registerExtensionCommands(ctx: vscode.ExtensionContext): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		// command to invoke updating bibkeys
		disposables.push(vscode.commands.registerTextEditorCommand(
			this.COMMANDS.find(c => c.shortTitle.startsWith('Update'))?.command as string,
			() => FileReader.updateAndGetBibKeys(ctx, { manual: true })
		));

		return disposables;
	}
}
