/// <reference types="jest" />
import { getMatchingSelectors } from './index';
import * as path from 'path';
import * as fs from 'fs-extra';

const fixturesPath = path.resolve(__dirname, '../test/fixtures');
const demoContent = fs.readFileSync(path.join(fixturesPath, 'demo.html'), 'utf8').replace(/\r/g,'');

it('demo file returns no matches', () => {
  expect(getMatchingSelectors(demoContent, [])).toEqual([]);
});

it('demo file returns found selectors "span > div"', () => {
  expect(getMatchingSelectors(demoContent, ['span > div']))
    .toEqual([{position: [{column: 12, line: 8, offset: 110}], selector: 'span > div'}]);
});

it('demo file returns found selectors for "div"', () => {
  expect(getMatchingSelectors(demoContent, ['div']))
    .toEqual([
      {
        selector: 'div',
        position: [
          {column: 12, line: 8, offset: 110},
          {column: 10, line: 12, offset: 161}
        ],
      }
    ]);
});
