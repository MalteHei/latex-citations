import * as vscode from 'vscode';
import { TriggerPatterns } from "./trigger-patterns";
import { BIBKEYS_KEY } from './extension';
import { FileReader, Result } from './file-reader';
import { Logger } from './logger';

export class Intellisense {
	private static readonly PROVIDER_OPTIONS = {
		selector: { scheme: 'file', language: 'latex' },
		triggerChars: ['{'],
	};

	/**
	 * Check if a string matches with any pattern from {@link CommandPatterns}.
	 * @param line the string to match
	 * @returns `true` if line matches any pattern from {@link CommandPatterns},
	 * otherwise `false`
	 */
	public static matchAnyPattern(line: string): boolean {
		return TriggerPatterns.getDefaultPatterns().some(pattern => line.match(pattern) !== null)
			|| TriggerPatterns.getCustomPatterns().some(pattern => line.match(pattern) !== null);
	}

	/**
	 * Create a {@link vscode.CompletionItemProvider} that provides bibkeys when
	 * one of {@link Intellisense.PROVIDER_OPTIONS.triggerChars} was typed.
	 * Whatever comes before this must match a
	 * {@link CommandPatterns CommandPattern}.
	 * @returns the {@link vscode.CompletionItemProvider}
	 */
	public static getLatexProvider(ctx: vscode.ExtensionContext): vscode.CompletionItemProvider<vscode.CompletionItem> {
		return {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
				Logger.debug('providing completion items');
				// check if an actual latex cite command triggered the completion
				const line = document.lineAt(position).text.slice(0, position.character);
				if (!Intellisense.matchAnyPattern(line)) {
					Logger.debug(`completion triggered but no citation command could be matched`, `for line ${line}`);
					return [];
				}

				const results: Result[] = ctx.workspaceState.get<Result[]>(BIBKEYS_KEY) || FileReader.updateAndGetBibKeys(ctx);
				return results.map(result => new vscode.CompletionItem({ label: result.key, description: result.title }, vscode.CompletionItemKind.Value));
			}
		};
	}

	/**
	 * Register the {@link vscode.CompletionItemProvider} created by
	 * {@link getLatexProvider}.
	 */
	public static registerCompletionItemProvider(ctx: vscode.ExtensionContext): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		disposables.push(vscode.languages.registerCompletionItemProvider(
			Intellisense.PROVIDER_OPTIONS.selector,
			Intellisense.getLatexProvider(ctx),
			...Intellisense.PROVIDER_OPTIONS.triggerChars
		));

		return disposables;
	}
}
