import * as glob from 'glob-all';
import { readFile } from 'fs-extra';
import * as cheerio from 'cheerio';
import * as vfileLocation from 'vfile-location';

export interface SelectorOptionObject {
	// Selectors with description
	// e.g. { 'b': 'B tags are not allowed' }
	[key: string]: string
}

export interface FilePosition {
	column: number,
	line: number,
	offset: number,
}

export interface ValidationOptions {
	selectors: string[] | SelectorOptionObject,
	files: string[]|string
}

export interface ResultSet {
	selector: string,
	position: FilePosition[]
}

export async function validate(options: ValidationOptions): Promise<{resultText: string, footer: string, hasMatches: boolean}> {
	const files = await findFiles(options.files);
	const selectors = getSelectors(options.selectors);

	// Read file and validate them
	const matchingSelectors = await Promise.all(
		files.map((file) => readFile(file)
			.then((result) => getMatchingSelectors(result.toString(), selectors))
		)
	);

	// Build text message from validations
	const resultText = matchingSelectors
		.map((fileResult, i) => fileResultToString(fileResult, getSelectorOptionObject(options.selectors), files[i]))
		.join('\n\n');

	const footer = `${files.length} file${files.length !== 1 ? 's' : ''} checked for ${selectors.length} selector${selectors.length !== 1 ? 's' : ''}.`;

	return {
		hasMatches: resultText !== '',
		resultText,
		footer
	};
}

/**
 * Turns a result set into a human readable result
 */
export function fileResultToString(fileResult: ResultSet[], selectors?: SelectorOptionObject, fileName?: string) {
	let matchCount = 0;
	let resultText = '';
	fileResult.forEach((selectorResult) => {
		if (selectorResult.position.length === 0) {
			return;
		}
		const description = selectors && selectors[selectorResult.selector] ? ` - ${selectors[selectorResult.selector]}` : '';
		resultText += `  Selector "${selectorResult.selector}"${description}\n`;
		selectorResult.position.forEach((position) => {
			matchCount++;
			resultText += `    ${position.line}:${position.column}\n`;
		});
		resultText += '\n';
	});
	if (fileName && matchCount) {
		resultText = `${fileName} contains ${matchCount} match${matchCount !== 1 ? 'es' : ''}:\n` + resultText;
	}
	return resultText;
}

/**
 * Returns all selectors maching the given html string and their position inside the html
 */
export function getMatchingSelectors(html: string, selectors: SelectorOptionObject | string[]): ResultSet[] {
	return getSelectors(selectors).map((selector) => ({ selector, position: getSelectorPosition(html, selector) }))
		.filter((result) => result.position);
}


/**
 * Helper to find all files from a pattern
 */
function findFiles(patterns: string[]|string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		glob(patterns, (err, result) => {
			if (err) {
				return reject(err);
			}
			resolve(result as string[]);
		});
	});
}

/**
 * Returns all occurences of a given selector in a given html string
 */
function getSelectorPosition(html: string, selector: string): FilePosition[] {
	const marker = '<e03d728ffad48695f761b8f26148a823>INVALID SELECTOR MARKER e03d728ffad48695f761b8f26148a823</e03d728ffad48695f761b8f26148a823>';
	const $ = cheerio.load(html);
	const matches = $(selector);
	const vFile = vfileLocation(html);
	const positions: FilePosition[] = [];
	matches.each((i, match) => {
		const $marker = $(marker);
		$(match).prepend($marker);
		positions.push(vFile.toPosition($.html().indexOf(marker)));
		$marker.remove();
	});
	return positions;
}

/**
 * Turns the different input formats for selectors and returns
 * selectors as key (selector) value (description) pairs.
 */
function getSelectorOptionObject(selectors: string[] | SelectorOptionObject): SelectorOptionObject {
	if (selectors instanceof Array) {
		const result = {};
		selectors.forEach((selector) => result[selector] = '');
		return result;
	}
	return selectors;
}

/**
 * Extracts the css selectors from a selector option object
 */
function getSelectors(selectorObject: string[] | SelectorOptionObject): string[] {
	return selectorObject instanceof Array ? selectorObject : Object.keys(selectorObject);
}
