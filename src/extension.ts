import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { CiteCommand } from './CiteCommand';

export const BIBKEYS = 'BIBKEYS';
export const bibFileGlob = '**/*.bib';
export let customCiteCommands: CiteCommand[];
export const regexCiteCommands: CiteCommand[] = [
	{
		name: 'vgl',
		regex: /\\vgl(?<optional>\[.*\])?{$/i
	},
	{
		name: 'standard',
		regex: /\\(cite|parencite|footcite|footcitetext)\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'common',
		regex: /\\(text|smart|super)cite\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'style-independent',
		regex: /\\autocite\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'text',
		regex: /\\cite(author|title|year|date|url)\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'multi-volume',
		regex: /\\(p|f|ft|s|t|a)?volcite\*?(?<optional>\[.*\]){0,3}{$/i
	},
	{
		name: 'standalone',
		regex: /\\(foot)?fullcite\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'bibliography-without-citation',
		regex: /\\(no|note|pnote|fnote)cite\*?(?<optional>\[.*\]){0,2}{$/i
	},
	{
		name: 'natbib',
		regex: /\\cite(t|p)\*?{$/i
	},
];

export function readLibraries(ctx: vscode.ExtensionContext, options?: { manual?: boolean }): string[] {
	const regexBibkeys = /^\@(?<type>\w+)\{(?<bibkey>[^,]+),$/gm;
	const keys: string[] = [];
	let sumKeys = 0;
	console.log(`reading all .bib files`);
	vscode.workspace.findFiles(bibFileGlob).then(uris => {
		console.log(`found some .bib files; deleting current keys...`);
		ctx.workspaceState.update(BIBKEYS, undefined);

		uris.forEach(uri => {
			const fileName = uri.path.replace(/.*\//, '');
			console.log(`reading contents of file ${fileName}`);
			let keysInFile = 0;
			const data = readFileSync(uri.fsPath, 'utf-8');
			let match = regexBibkeys.exec(data);
			do {
				if (match?.groups?.bibkey) {
					keysInFile++;
					const existingKeys = ctx.workspaceState.get<string[]>(BIBKEYS) || [];
					ctx.workspaceState.update(BIBKEYS, existingKeys.concat(match.groups.bibkey));
					keys.push(match.groups.bibkey);
				}
			} while ((match = regexBibkeys.exec(data)) !== null);
			console.log(`found ${keysInFile} keys in ${fileName}`);
			sumKeys += keysInFile;
		});

		console.log(`done reading .bib files!`, `Found ${sumKeys} key(s) in ${uris.length} files(s)`);
		if (options?.manual) {
			vscode.window.showInformationMessage(`Finished updating bib keys! Found ${sumKeys} key(s) in ${uris.length} files(s)`);
		}
	});
	return keys;
}

export function getCustomCommandPatternsFromConfig(): RegExp[] {
	console.log('getting custom patterns');
	const conf = vscode.workspace.getConfiguration('bibtex-citer');
	const patterns: string[] = conf.get('customCommandPatterns') || [];

	return patterns.map(p => `\\${p}{`).map(p => new RegExp(p));
}

export function setCustomCiteCommands(): void {
	customCiteCommands = getCustomCommandPatternsFromConfig().map((pattern, index): CiteCommand => ({name: `custom${index}`, regex: pattern}));
}

export function doesAnyCommandMatchLine(line: string): boolean {
	return regexCiteCommands.some(cmd => line.match(cmd.regex) !== null)
			|| customCiteCommands.some(cmd => line.match(cmd.regex) !== null);
}

export function getLatexProvider(ctx: vscode.ExtensionContext): vscode.CompletionItemProvider<vscode.CompletionItem> {
	return {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
			// check if an actual latex cite command triggered the completion
			const line = document.lineAt(position).text.slice(0, position.character);
			if (!doesAnyCommandMatchLine(line)) {
				console.log(`completion triggered but no citation command could be matched`);
				return [];
			}

			const keys = ctx.workspaceState.get<string[]>(BIBKEYS) || readLibraries(ctx);
			return keys.map(key => new vscode.CompletionItem(key, vscode.CompletionItemKind.Value));
		}
	};
}

function init(ctx: vscode.ExtensionContext): void {
	readLibraries(ctx);
	setCustomCiteCommands();
}

export function activate(context: vscode.ExtensionContext) {
	// vscode.window.showInformationMessage('...');
	console.log('Activating "bibtex-citer"');
	const disposables: vscode.Disposable[] = [];

	init(context);

	// re-read libraries when a library was changed
	const watcher = vscode.workspace.createFileSystemWatcher(bibFileGlob, false, false, false);
	disposables.push(watcher);
	disposables.push(watcher.onDidChange(_ => readLibraries(context)));
	disposables.push(watcher.onDidCreate(_ => readLibraries(context)));
	disposables.push(watcher.onDidDelete(_ => readLibraries(context)));

	// register command to manually read libraries
	disposables.push(vscode.commands.registerTextEditorCommand('bibtex-citer.readLibraries', () => readLibraries(context, { manual: true })));

	// set custom citation commands on config changed
	disposables.push(vscode.workspace.onDidChangeConfiguration(_ => setCustomCiteCommands()));

	// register intellisense provider
	disposables.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'latex' }, getLatexProvider(context), '{'));

	context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() { }
