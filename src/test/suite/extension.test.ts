import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';

suite('BibTeX-Citer Intellisense', () => {
	test('doesAnyCommandMatchLine', () => {
		interface BaseCiteCommand {
			command: string;
			numOptionals: number;
		}

		// all of these lines should match at least one of the `extension.regexCiteCommands`
		const lines: string[] = [];

		// http://tug.ctan.org/info/biblatex-cheatsheet/biblatex-cheatsheet.pdf
		const citeCommands: BaseCiteCommand[] = [
			/** Custom */
			{ command: 'vgl', numOptionals: 1 },
			/** BibLaTex */
			// standard
			{ command: 'cite', numOptionals: 2 },
			{ command: 'parencite', numOptionals: 2 },
			{ command: 'footcite', numOptionals: 2 },
			{ command: 'footcitetext', numOptionals: 2 },
			// common
			{ command: 'textcite', numOptionals: 2 },
			{ command: 'smartcite', numOptionals: 2 },
			{ command: 'supercite', numOptionals: 2 },
			// style-independant
			{ command: 'autocite', numOptionals: 2 },
			// text
			{ command: 'citeauthor', numOptionals: 2 },
			{ command: 'citetitle', numOptionals: 2 },
			{ command: 'citeyear', numOptionals: 2 },
			{ command: 'citedate', numOptionals: 2 },
			{ command: 'citeurl', numOptionals: 2 },
			// multi-volume
			{ command: 'volcite', numOptionals: 3 },
			{ command: 'pvolcite', numOptionals: 3 },
			{ command: 'fvolcite', numOptionals: 3 },
			{ command: 'ftvolcite', numOptionals: 3 },
			{ command: 'svolcite', numOptionals: 3 },
			{ command: 'tvolcite', numOptionals: 3 },
			{ command: 'avolcite', numOptionals: 3 },
			// standalone
			{ command: 'fullcite', numOptionals: 2 },
			{ command: 'footfullcite', numOptionals: 2 },
			// bibliography without citation
			{ command: 'nocite', numOptionals: 2 },
			{ command: 'notecite', numOptionals: 2 },
			{ command: 'pnotecite', numOptionals: 2 },
			{ command: 'fnotecite', numOptionals: 2 },
			/** Natbib */
			{ command: 'citep', numOptionals: 0 },
			{ command: 'citet', numOptionals: 0 },
		];

		// populate `commandsToTest`
		citeCommands.forEach(cc => {
			lines.push(`\\${cc.command}{`);
			lines.push(`Some Text\\${cc.command}{`);
			for (let i = 1; i <= cc.numOptionals; i++) {
				// empty optional
				lines.push(`\\${cc.command}${'[]'.repeat(i)}{`);

				// optional with content + other empty optionals in front
				lines.push(`\\${cc.command}${'[]'.repeat(i - 1)}[optional${i}]{`);
			}
		});

		lines.forEach(line => {
			if (!extension.doesAnyCommandMatchLine(line)) {
				assert.fail(`no regex matched for ${line}`);
			}
		});
	});
});
