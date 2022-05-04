import * as vscode from "vscode";
import { FileReader } from "./file-reader";


export class Commands {

	/**
	 * Register commands for this extension in vscode.
	 */
	public static registerExtensionCommands(ctx: vscode.ExtensionContext): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		// command to invoke updating bibkeys
		disposables.push(vscode.commands.registerTextEditorCommand('latex-citations.updateKeys', () => {
			FileReader.updateAndGetBibKeys(ctx, { manual: true });
		}));

		return disposables;
	}
}
