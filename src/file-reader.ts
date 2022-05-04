import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { BIBKEYS_KEY } from './extension';

export const libraryFileGlob = '**/*.bib';

export class FileReader {

	/**
	 * Read bibkeys from files matching {@link libraryFileGlob} and save them
	 * to {@link vscode.ExtensionContext.workspaceState}.
	 * @returns an array containing all bibkeys
	 */
	public static updateAndGetBibKeys(ctx: vscode.ExtensionContext, options?: { manual?: boolean; }): string[] {
		console.log(`reading all .bib files`);
		const regexBibkeys = /^\@(?<type>\w+)\{(?<bibkey>[^,]+),$/gm;
		let keys: string[] = [];

		// iterate over library-files
		vscode.workspace.findFiles(libraryFileGlob).then(uris => {
			// delete current keys
			ctx.workspaceState.update(BIBKEYS_KEY, undefined);

			uris.forEach(uri => {
				const fileName = uri.path.replace(/.*\//, '');
				let keysInFile = 0;

				// read file contents
				const data = readFileSync(uri.fsPath, 'utf-8');
				let match = regexBibkeys.exec(data);
				do {	// iterate over matches
					if (match?.groups?.bibkey) {
						keysInFile++;
						const existingKeys = ctx.workspaceState.get<string[]>(BIBKEYS_KEY) || [];
						ctx.workspaceState.update(BIBKEYS_KEY, existingKeys.concat(match.groups.bibkey));
					}
				} while ((match = regexBibkeys.exec(data)) !== null);
				console.log(`found ${keysInFile} keys in ${fileName}`);
			});

			keys = ctx.workspaceState.get<string[]>(BIBKEYS_KEY) || [];
			console.log(`done reading .bib files!`, `Found ${keys?.length} key(s) in ${uris.length} files(s)`);
			if (options?.manual) {
				vscode.window.showInformationMessage(`Finished updating bib keys! Found ${keys?.length} key(s) in ${uris.length} files(s)`);
			}
		});
		return keys || [];
	}

	/**
	 * Register a {@link vscode.FileSystemWatcher} to update bibkeys when files matching {@link libraryFileGlob} get
	 * created/changed/deleted.
	 */
	public static registerLibraryWatcher(ctx: vscode.ExtensionContext): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		const libraryWatcher = vscode.workspace.createFileSystemWatcher(libraryFileGlob, false, false, false);
		disposables.push(libraryWatcher);
		disposables.push(libraryWatcher.onDidChange(_ => FileReader.updateAndGetBibKeys(ctx)));
		disposables.push(libraryWatcher.onDidCreate(_ => FileReader.updateAndGetBibKeys(ctx)));
		disposables.push(libraryWatcher.onDidDelete(_ => FileReader.updateAndGetBibKeys(ctx)));

		return disposables;
	}
}
