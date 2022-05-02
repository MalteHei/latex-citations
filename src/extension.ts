import { readFileSync } from 'fs';
import * as vscode from 'vscode';

const BIBKEYS = 'BIBKEYS';
const bibFileGlob = '**/*.bib';

function readLibraries(ctx: vscode.ExtensionContext): string[] {
	const regexBibkeys = /^\@(?<type>\w+)\{(?<bibkey>[^,]+),$/gm;
	const keys: string[] = [];
	console.log(`reading all .bib files`);
	vscode.workspace.findFiles(bibFileGlob).then(uris => {
		console.log(`found some .bib files; deleting current keys...`);
		ctx.workspaceState.update(BIBKEYS, undefined);

		uris.forEach(uri => {
			const fileName = uri.path.replace(/.*\//, '');
			console.log(`reading contents of file ${fileName}`);
			let count = 0;
			const data = readFileSync(uri.fsPath, 'utf-8');
			let match = regexBibkeys.exec(data);
			do {
				if (match?.groups?.bibkey) {
					count++;
					const existingKeys = ctx.workspaceState.get<string[]>(BIBKEYS) || [];
					ctx.workspaceState.update(BIBKEYS, existingKeys.concat(match.groups.bibkey));
					keys.push(match.groups.bibkey);
				}
			} while ((match = regexBibkeys.exec(data)) !== null);
			console.log(`found ${count} keys in ${fileName}`);
		});

		console.log(`done reading .bib files!`);
		// vscode.window.showInformationMessage('Finished updating bib keys!');
	});
	return keys;
}

function getLatexProvider(ctx: vscode.ExtensionContext): vscode.CompletionItemProvider<vscode.CompletionItem> {
	return {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
			const keys = ctx.workspaceState.get<string[]>(BIBKEYS) || readLibraries(ctx);
			return keys.map(key => new vscode.CompletionItem(key/*, vscode.CompletionItemKind.Text*/));
		}
	};
};

export function activate(context: vscode.ExtensionContext) {
	// vscode.window.showInformationMessage('...');
	console.log('Activating "bibtex-citer"');
	const disposables: vscode.Disposable[] = [];

	// initially read libraries
	readLibraries(context);

	// re-read libraries when a library was changed
	const watcher = vscode.workspace.createFileSystemWatcher(bibFileGlob, false, false, false);
	disposables.push(watcher);
	disposables.push(watcher.onDidChange(_ => readLibraries(context)));
	disposables.push(watcher.onDidCreate(_ => readLibraries(context)));
	disposables.push(watcher.onDidDelete(_ => readLibraries(context)));

	// register command to manually read libraries
	disposables.push(vscode.commands.registerTextEditorCommand('bibtex-citer.readLibraries', () => readLibraries(context)));

	// register intellisense provider
	disposables.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'latex' }, getLatexProvider(context), '{'));

	context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() { }
