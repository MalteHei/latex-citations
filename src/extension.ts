import * as vscode from 'vscode';
import { CommandPatterns } from './command-patterns';
import { Commands } from './commands';
import { FileReader } from './file-reader';
import { Intellisense } from './intellisense';

/**
 * The key for accessing bibkeys in
 * {@link vscode.ExtensionContext.workspaceState}.
 */
export const BIBKEYS = 'BIBKEYS';


function init(ctx: vscode.ExtensionContext): void {
	FileReader.updateAndGetBibKeys(ctx);
	CommandPatterns.updateCustomPatternsFromConfig();
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Activating "bibtex-citer"');
	const disposables: vscode.Disposable[] = [];

	init(context);

	// register listeners
	disposables.push(...FileReader.registerLibraryWatcher(context));
	disposables.push(...CommandPatterns.registerConfigurationWatcher());

	// register commands
	disposables.push(...Commands.registerExtensionCommands(context));

	// register providers
	disposables.push(...Intellisense.registerCompletionItemProvider(context));

	context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() { }
