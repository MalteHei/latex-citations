import * as vscode from 'vscode';


export class CommandPatterns {
	private static customPatterns: RegExp[] = [];
	private static commandPatterns: RegExp[] = [
		// /\\vgl(?<optional>\[.*\])?{$/i,
		/* standard */
		/\\(cite|parencite|footcite|footcitetext)\*?(?<optional>\[.*\]){0,2}{$/i,
		/* common */
		/\\(text|smart|super)cite\*?(?<optional>\[.*\]){0,2}{$/i,
		/* style-independent */
		/\\autocite\*?(?<optional>\[.*\]){0,2}{$/i,
		/* text */
		/\\cite(author|title|year|date|url)\*?(?<optional>\[.*\]){0,2}{$/i,
		/* multi-volume */
		/\\(p|f|ft|s|t|a)?volcite\*?(?<optional>\[.*\]){0,3}{$/i,
		/* standalone */
		/\\(foot)?fullcite\*?(?<optional>\[.*\]){0,2}{$/i,
		/* bibliography without citation */
		/\\(no|note|pnote|fnote)cite\*?(?<optional>\[.*\]){0,2}{$/i,
		/* natbib */
		/\\cite(t|p)\*?{$/i,
	];

	public static getCommandPatterns(): RegExp[] {
		return CommandPatterns.commandPatterns;
	}

	public static getCustomPatterns(): RegExp[] {
		return CommandPatterns.customPatterns;
	}

	public static updateCustomPatternsFromConfig(): void {
		CommandPatterns.customPatterns = this.getCustomPatternsFromConfig();
	}

	public static registerConfigurationWatcher(): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		disposables.push(vscode.workspace.onDidChangeConfiguration(_ => CommandPatterns.updateCustomPatternsFromConfig()));

		return disposables;
	}

	private static getCustomPatternsFromConfig(): RegExp[] {
		console.log('getting custom patterns from configuration');
		const conf = vscode.workspace.getConfiguration('bibtex-citer');
		const patterns: string[] = conf.get('customCommandPatterns') || [];
	
		return patterns.map(p => `\\\\${p}{`).map(p => new RegExp(p));
	}
}
