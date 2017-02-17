# html-structure-linter

Searches through a given list of html files for css selectors

# Search 

One use case is to search for specific selectors inside one or multiple files

```
html-structure-linter "div > span" test/fixtures/demo.html
html-structure-linter "div > span" "test/**/*.html"
```

Result:

```
test/fixtures/demo.html contains 2 matches:
  Selector "div"
    8:12
    12:10
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

```
import {getMatchingSelectors, fileResultToString} from 'html-structure-linter';

const exampleInput = '<div><span></span></div>';
const selectors = {
  "span div": "DIV in SPAN is not allowed in xhtml strict mode - see https://www.w3.org/2010/04/xhtml10-strict.html"
};
const lintResult = getMatchingSelectors(exampleInput, selectors);
const lintText = fileResultToString(lintResult, selectors);
console.log(lintText);
```

## License
[MIT License](./LICENSE)
