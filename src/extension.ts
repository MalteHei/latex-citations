import * as vscode from 'vscode';
import { TriggerPatterns } from './trigger-patterns';
import { Commands } from './commands';
import { FileReader } from './file-reader';
import { Intellisense } from './intellisense';
import { Logger } from './logger';
import * as packageJSON from '../package.json';

/**
 * The key for accessing bibkeys in
 * {@link vscode.ExtensionContext.workspaceState}.
 */
export const BIBKEYS_KEY = 'BIBKEYS';
export const EXTENSION_NAME = packageJSON.name;


function init(ctx: vscode.ExtensionContext): void {
	FileReader.updateAndGetBibKeys(ctx);
	TriggerPatterns.updateCustomPatternsFromConfig();
}

export function activate(context: vscode.ExtensionContext) {
	Logger.DEBUG = vscode.workspace.getConfiguration(EXTENSION_NAME).get('debug') || packageJSON.contributes.configuration.properties['latex-citations.debug'].default;
	Logger.debug(`activating`);
	const disposables: vscode.Disposable[] = [];

	init(context);

	// register listeners
	disposables.push(...FileReader.registerLibraryWatcher(context));
	disposables.push(...TriggerPatterns.registerConfigurationWatcher());
	disposables.push(...Logger.registerConfigurationWatcher());

	// register commands
	disposables.push(...Commands.registerExtensionCommands(context));

	// register providers
	disposables.push(...Intellisense.registerCompletionItemProvider(context));

	context.subscriptions.push(...disposables);
	Logger.debug('activated');
}

export function deactivate() { }
