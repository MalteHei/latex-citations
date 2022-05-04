import * as vscode from 'vscode';
import { Logger } from './logger';


export class CommandPatterns {
	private static CUSTOM_PATTERNS: RegExp[] = [];
	private static DEFAULT_PATTERNS: RegExp[] = [
		// http://tug.ctan.org/info/biblatex-cheatsheet/biblatex-cheatsheet.pdf
		// https://de.overleaf.com/learn/latex/Natbib_citation_styles
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

	public static getDefaultPatterns(): RegExp[] {
		return CommandPatterns.DEFAULT_PATTERNS;
	}

	public static getCustomPatterns(): RegExp[] {
		return CommandPatterns.CUSTOM_PATTERNS;
	}

	public static updateCustomPatternsFromConfig(): void {
		CommandPatterns.CUSTOM_PATTERNS = this.getCustomPatternsFromConfig();
	}

	public static registerConfigurationWatcher(): vscode.Disposable[] {
		const disposables: vscode.Disposable[] = [];

		disposables.push(vscode.workspace.onDidChangeConfiguration(_ => CommandPatterns.updateCustomPatternsFromConfig()));

		return disposables;
	}

	private static getCustomPatternsFromConfig(): RegExp[] {
		Logger.debug('getting custom patterns from configuration');
		const conf = vscode.workspace.getConfiguration('latex-citations');
		const patterns: string[] = conf.get('customPatterns') || [];
	
		return patterns.map(p => `\\\\${p}{`).map(p => new RegExp(p, 'i'));
	}
}
