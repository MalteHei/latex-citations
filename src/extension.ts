import * as vscode from 'vscode';
import { CommandPatterns } from './command-patterns';
import { Commands } from './commands';
import { FileReader } from './file-reader';
import { Intellisense } from './intellisense';
import { Logger } from './logger';

/**
 * The key for accessing bibkeys in
 * {@link vscode.ExtensionContext.workspaceState}.
 */
export const BIBKEYS_KEY = 'BIBKEYS';


function init(ctx: vscode.ExtensionContext): void {
	FileReader.updateAndGetBibKeys(ctx);
	CommandPatterns.updateCustomPatternsFromConfig();
}

export function activate(context: vscode.ExtensionContext) {
	Logger.DEBUG = false;
	Logger.debug('Activating "latex-citations"');
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
