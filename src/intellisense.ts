import * as vscode from 'vscode';
import { CommandPatterns } from "./command-patterns";
import { BIBKEYS_KEY } from './extension';
import { FileReader } from './file-reader';

export class Intellisense {
	private static readonly providerOptions = {
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
		return CommandPatterns.getCommandPatterns().some(pattern => line.match(pattern) !== null)
			|| CommandPatterns.getCustomPatterns().some(pattern => line.match(pattern) !== null);
	}

	/**
	 * Create a {@link vscode.CompletionItemProvider} that provides bibkeys when
	 * one of {@link Intellisense.providerOptions.triggerChars} was typed.
	 * Whatever comes before this must match a
	 * {@link CommandPatterns CommandPattern}.
	 * @returns the {@link vscode.CompletionItemProvider}
	 */
	public static getLatexProvider(ctx: vscode.ExtensionContext): vscode.CompletionItemProvider<vscode.CompletionItem> {
		return {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
				// check if an actual latex cite command triggered the completion
				const line = document.lineAt(position).text.slice(0, position.character);
				if (!Intellisense.matchAnyPattern(line)) {
					console.log(`completion triggered but no citation command could be matched`, `for line ${line}`);
					return [];
				}

				const keys = ctx.workspaceState.get<string[]>(BIBKEYS_KEY) || FileReader.updateAndGetBibKeys(ctx);
				return keys.map(key => new vscode.CompletionItem(key, vscode.CompletionItemKind.Value));
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
			Intellisense.providerOptions.selector,
			Intellisense.getLatexProvider(ctx),
			...Intellisense.providerOptions.triggerChars
		));

		return disposables;
	}
}
