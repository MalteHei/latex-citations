import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { BIBKEYS_KEY } from './extension';
import { Logger } from './logger';

export const libraryFileGlob = '**/*.bib';

export interface Result {
	key: string;
	title: string;
}

export class FileReader {

	/**
	 * Read bibkeys from files matching {@link libraryFileGlob} and save them
	 * to {@link vscode.ExtensionContext.workspaceState}.
	 * @returns an array containing all bibkeys
	 */
	public static updateAndGetBibKeys(ctx: vscode.ExtensionContext, options?: { manual?: boolean; }): Result[] {
		Logger.debug(`reading all .bib files`);
		const regexBibkeys = /^\@(?<type>\w+)\{(?<bibkey>[^,]+),((\r?\n)*.*(\r?\n)*)*\s*title\s*=\s*{(?<title>.+)}/igm;
		let results: Result[] = [];

		// iterate over library-files
		vscode.workspace.findFiles(libraryFileGlob).then(uris => {
			// delete current keys
			ctx.workspaceState.update(BIBKEYS_KEY, undefined);

			uris.forEach(uri => {
				const fileName = uri.path.replace(/.*\//, '');
				let resultsInFile = 0;

				// read file contents
				const data = readFileSync(uri.fsPath, 'utf-8');
				let match = regexBibkeys.exec(data);
				do {	// iterate over matches
					Logger.debug(`do...`);

					if (match) {
						resultsInFile++;
						const result: Result = { key: match.groups!.bibkey, title: match.groups!.title };
						const existingResults = ctx.workspaceState.get<Result[]>(BIBKEYS_KEY) || [];
						ctx.workspaceState.update(BIBKEYS_KEY, existingResults.concat(result));
					}
				} while ((match = regexBibkeys.exec(data)) !== null);
				Logger.debug(`found ${resultsInFile} keys in ${fileName}`);
			});

			results = ctx.workspaceState.get<Result[]>(BIBKEYS_KEY) || [];
			Logger.debug(`done reading .bib files!`, `Found ${results?.length} results in ${uris.length} files`);
			if (options?.manual) {
				vscode.window.showInformationMessage(`Finished updating bib keys! Found ${results?.length} key(s) in ${uris.length} files(s)`);
			}
		});
		return results || [];
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
