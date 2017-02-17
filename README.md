# html-structure-linter

Searches through a given list of html files for css selectors

# Search 

One use case is to search for specific selectors inside one or multiple files

```
html-structure-linter "span > div" test/fixtures/demo.html
html-structure-linter "span > div" "test/**/*.html"
```

Result:

```
test/fixtures/demo.html contains 2 matches:
  Selector "span > div"
    8:12
```

# Lint

You can pass a config to specify all selectors and messages you want to validate.

See the [example config](./test/fixtures/example.config.json) for details

```
html-structure-linter -c test/fixtures/example.config.json 
```

Result:

```
test/fixtures/demo.html contains 1 match:
  Selector "span div" - DIV in SPAN is not allowed in xhtml strict mode - see https://www.w3.org/2010/04/xhtml10-strict.html
    8:12



1 file checked for 1 selector.
```

# Node

You can also use the library directly from node

```js
import {getMatchingSelectors, fileResultToString} from 'html-structure-linter';

const exampleInput = '<div><span></span></div>';
const selectors = {
  "span div": "DIV in SPAN is not allowed in xhtml strict mode - see https://www.w3.org/2010/04/xhtml10-strict.html"
};
const lintResult = getMatchingSelectors(exampleInput, selectors);
const lintText = fileResultToString(lintResult, selectors);
console.log(lintText);
```

You can also use a shorthand to lint a bunch of files:

```js
import {validate} from 'html-structure-linter';
validate({
  selectors: { "span div": "Div in Span not allowed" },
  files: [
    "**/*.html",
    "!node_modules/**/*.*"
  ]
}).then(({ resultText, footer, hasMatches }) => {
  console.log(resultText);
  console.log(footer);
  if (hasMatches) {
     process.exit(1);
  }
});
```


## License
[MIT License](./LICENSE)
