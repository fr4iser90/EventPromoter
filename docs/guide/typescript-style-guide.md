# TypeScript Style Guide

This guide outlines the recommended TypeScript style for this project, based on the Google TypeScript Style Guide. Its purpose is to ensure consistency, readability, and maintainability across our codebase.

Source file basics

File encoding: UTF-8

Source files are encoded in UTF-8.

Whitespace characters

Aside from the line terminator sequence, the ASCII horizontal space character (0x20) is the only whitespace character that appears anywhere in a source file. This implies that all other whitespace characters in string literals are escaped.
Special escape sequences

For any character that has a special escape sequence (\', \", \\, \b, \f, \n, \r, \t, \v), that sequence is used rather than the corresponding numeric escape (e.g \x0a, \u000a, or \u{a}). Legacy octal escapes are never used.
Non-ASCII characters

For the remaining non-ASCII characters, use the actual Unicode character (e.g. ∞). For non-printable characters, the equivalent hex or Unicode escapes (e.g. \u221e) can be used along with an explanatory comment.

// Perfectly clear, even without a comment.
const units = 'μs';

// Use escapes for non-printable characters.
const output = '\ufeff' + content;  // byte order mark

// Hard to read and prone to mistakes, even with the comment.
const units = '\u03bcs'; // Greek letter mu, 's'

// The reader has no idea what this is.
const output = '\ufeff' + content;

Source file structure

Files consist of the following, in order:

    Copyright information, if present
    JSDoc with @fileoverview, if present
    Imports, if present
    The file’s implementation

Exactly one blank line separates each section that is present.
Copyright information

If license or copyright information is necessary in a file, add it in a JSDoc at the top of the file.

@fileoverview JSDoc

A file may have a top-level @fileoverview JSDoc. If present, it may provide a description of the file's content, its uses, or information about its dependencies. Wrapped lines are not indented.

Example:

/**
 * @fileoverview Description of file. Lorem ipsum dolor sit amet, consectetur
 * adipiscing elit, sed do eiusmod tempor incididunt.
 */

Imports

There are four variants of import statements in ES6 and TypeScript:
Import type 	Example 	Use for
module[module_import] 	import * as foo from '...'; 	TypeScript imports
named[destructuring_import] 	import {SomeThing} from '...'; 	TypeScript imports
default 	import SomeThing from '...'; 	Only for other external code that requires them
side-effect 	import '...'; 	Only to import libraries for their side-effects on load (such as custom elements)

// Good: choose between two options as appropriate (see below).
import * as ng from '@angular/core';
import {Foo} from './foo';

// Only when needed: default imports.
import Button from 'Button';

// Sometimes needed to import libraries for their side effects:
import 'jasmine';
import '@polymer/paper-button';

Import paths

TypeScript code must use paths to import other TypeScript code. Paths may be relative, i.e. starting with . or .., or rooted at the base directory, e.g. root/path/to/file.

Code should use relative imports (./foo) rather than absolute imports path/to/foo when referring to files within the same (logical) project as this allows to move the project around without introducing changes in these imports.

Consider limiting the number of parent steps (../../../) as those can make module and path structures hard to understand.

import {Symbol1} from 'path/from/root';
import {Symbol2} from '../parent/file';
import {Symbol3} from './sibling';

Namespace versus named imports

Both namespace and named imports can be used.

Prefer named imports for symbols used frequently in a file or for symbols that have clear names, for example Jasmine's describe and it. Named imports can be aliased to clearer names as needed with as.

Prefer namespace imports when using many different symbols from large APIs. A namespace import, despite using the * character, is not comparable to a "wildcard" import as seen in other languages. Instead, namespace imports give a name to all the exports of a module, and each exported symbol from the module becomes a property on the module name. Namespace imports can aid readability for exported symbols that have common names like Model or Controller without the need to declare aliases.

// Bad: overlong import statement of needlessly namespaced names.
import {Item as TableviewItem, Header as TableviewHeader, Row as TableviewRow,
  Model as TableviewModel, Renderer as TableviewRenderer} from './tableview';

let item: TableviewItem|undefined;

// Better: use the module for namespacing.
import * as tableview from './tableview';

let item: tableview.Item|undefined;

import * as testing from './testing';

// Bad: The module name does not improve readability.
testing.describe('foo', () => {
  testing.it('bar', () => {
    testing.expect(null).toBeNull();
    testing.expect(undefined).toBeUndefined();
  });
});

// Better: give local names for these common functions.
import {describe, it, expect} from './testing';

describe('foo', () => {
  it('bar', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
  });
});

Special case: Apps JSPB protos

Apps JSPB protos must use named imports, even when it leads to long import lines.

This rule exists to aid in build performance and dead code elimination since often .proto files contain many messages that are not all needed together. By leveraging destructured imports the build system can create finer grained dependencies on Apps JSPB messages while preserving the ergonomics of path based imports.

// Good: import the exact set of symbols you need from the proto file.
import {Foo, Bar} from './foo.proto';

function copyFooBar(foo: Foo, bar: Bar) {...}

Renaming imports

Code should fix name collisions by using a namespace import or renaming the exports themselves. Code may rename imports (import {SomeThing as SomeOtherThing}) if needed.

Three examples where renaming can be helpful:

    If it's necessary to avoid collisions with other imported symbols.
    If the imported symbol name is generated.
    If importing symbols whose names are unclear by themselves, renaming can improve code clarity. For example, when using RxJS the from function might be more readable when renamed to observableFrom.

Exports

Use named exports in all code:

// Use named exports:
export class Foo { ... }

Do not use default exports. This ensures that all imports follow a uniform pattern.

// Do not use default exports:
export default class Foo { ... } // BAD!

Why?

Default exports provide no canonical name, which makes central maintenance difficult with relatively little benefit to code owners, including potentially decreased readability:

import Foo from './bar';  // Legal.
import Bar from './bar';  // Also legal.

Named exports have the benefit of erroring when import statements try to import something that hasn't been declared. In foo.ts:

const foo = 'blah';
export default foo;

And in bar.ts:

import {fizz} from './foo';

Results in error TS2614: Module '"./foo"' has no exported member 'fizz'. While bar.ts:

import fizz from './foo';

Results in fizz === foo, which is probably unexpected and difficult to debug.

Additionally, default exports encourage people to put everything into one big object to namespace it all together:

export default class Foo {
  static SOME_CONSTANT = ...
  static someHelpfulFunction() { ... }
  ...
}

With the above pattern, we have file scope, which can be used as a namespace. We also have a perhaps needless second scope (the class Foo) that can be ambiguously used as both a type and a value in other files.

Instead, prefer use of file scope for namespacing, as well as named exports:

export const SOME_CONSTANT = ...
export function someHelpfulFunction()
export class Foo {
  // only class stuff here
}

Export visibility

TypeScript does not support restricting the visibility for exported symbols. Only export symbols that are used outside of the module. Generally minimize the exported API surface of modules.
Mutable exports

Regardless of technical support, mutable exports can create hard to understand and debug code, in particular with re-exports across multiple modules. One way to paraphrase this style point is that export let is not allowed.

export let foo = 3;
// In pure ES6, foo is mutable and importers will observe the value change after a second.
// In TS, if foo is re-exported by a second file, importers will not see the value change.
window.setTimeout(() => {
  foo = 4;
}, 1000 /* ms */);

If one needs to support externally accessible and mutable bindings, they should instead use explicit getter functions.

let foo = 3;
window.setTimeout(() => {
  foo = 4;
}, 1000 /* ms */);
// Use an explicit getter to access the mutable export.
export function getFoo() { return foo; };

For the common pattern of conditionally exporting either of two values, first do the conditional check, then the export. Make sure that all exports are final after the module's body has executed.

function pickApi() {
  if (useOtherApi()) return OtherApi;
  return RegularApi;
}
export const SomeApi = pickApi();

Container classes

Do not create container classes with static methods or properties for the sake of namespacing.

export class Container {
  static FOO = 1;
  static bar() { return 1; }
}

Instead, export individual constants and functions:

export const FOO = 1;
export function bar() { return 1; }

Import and export type
Import type

You may use import type {...} when you use the imported symbol only as a type. Use regular imports for values:

import type {Foo} from './foo';
import {Bar} from './foo';

import {type Foo, Bar} from './foo';

Why?

The TypeScript compiler automatically handles the distinction and does not insert runtime loads for type references. So why annotate type imports?

The TypeScript compiler can run in 2 modes:

    In development mode, we typically want quick iteration loops. The compiler transpiles to JavaScript without full type information. This is much faster, but requires import type in certain cases.
    In production mode, we want correctness. The compiler type checks everything and ensures import type is used correctly.

Note: If you need to force a runtime load for side effects, use import '...';. See
Export type

Use export type when re-exporting a type, e.g.:

export type {AnInterface} from './foo';

Why?

export type is useful to allow type re-exports in file-by-file transpilation. See isolatedModules docs.

export type might also seem useful to avoid ever exporting a value symbol for an API. However it does not give guarantees, either: downstream code might still import an API through a different path. A better way to split & guarantee type vs value usages of an API is to actually split the symbols into e.g. UserService and AjaxUserService. This is less error prone and also better communicates intent.

Use modules not namespaces

TypeScript supports two methods to organize code: namespaces and modules, but namespaces are disallowed. That is, your code must refer to code in other files using imports and exports of the form import {foo} from 'bar';

Your code must not use the namespace Foo { ... } construct. namespaces may only be used when required to interface with external, third party code. To semantically namespace your code, use separate files.

Code must not use require (as in import x = require('...');) for imports. Use ES6 module syntax.

// Bad: do not use namespaces:
namespace Rocket {
  function launch() { ... }
}

// Bad: do not use <reference>
/// <reference path="..."/>

// Bad: do not use require()
import x = require('mydep');

    NB: TypeScript namespaces used to be called internal modules and used to use the module keyword in the form module Foo { ... }. Don't use that either. Always use ES6 imports.

Language features

This section delineates which features may or may not be used, and any additional constraints on their use.

Language features which are not discussed in this style guide may be used with no recommendations of their usage.

Local variable declarations

Use const and let

Always use const or let to declare variables. Use const by default, unless a variable needs to be reassigned. Never use var.

const foo = otherValue;  // Use if "foo" never changes.
let bar = someValue;     // Use if "bar" is ever assigned into later on.

const and let are block scoped, like variables in most other languages. var in JavaScript is function scoped, which can cause difficult to understand bugs. Don't use it.

var foo = someValue;     // Don't use - var scoping is complex and causes bugs.

Variables must not be used before their declaration.

One variable per declaration

Every local variable declaration declares only one variable: declarations such as let a = 1, b = 2; are not used.

Array literals

Do not use the Array constructor

Do not use the Array() constructor, with or without new. It has confusing and contradictory usage:

const a = new Array(2); // [undefined, undefined]
const b = new Array(2, 3); // [2, 3];

Instead, always use bracket notation to initialize arrays, or from to initialize an Array with a certain size:

const a = [2];
const b = [2, 3];

// Equivalent to Array(2):
const c = [];
c.length = 2;

// [0, 0, 0, 0, 0]
Array.from<number>({length: 5}).fill(0);

Do not define properties on arrays

Do not define or use non-numeric properties on an array (other than length). Use a Map (or Object) instead.

Using spread syntax

Using spread syntax [...foo]; is a convenient shorthand for shallow-copying or concatenating iterables.

const foo = [
  1,
];

const foo2 = [
  ...foo,
  6,
  7,
];

const foo3 = [
  5,
  ...foo,
];

foo2[1] === 6;
foo3[1] === 1;

When using spread syntax, the value being spread must match what is being created. When creating an array, only spread iterables. Primitives (including null and undefined) must not be spread.

const foo = [7];
const bar = [5, ...(shouldUseFoo && foo)]; // might be undefined

// Creates {0: 'a', 1: 'b', 2: 'c'} but has no length
const fooStrings = ['a', 'b', 'c'];
const ids = {...fooStrings};

const foo = shouldUseFoo ? [7] : [];
const bar = [5, ...foo];
const fooStrings = ['a', 'b', 'c'];
const ids = [...fooStrings, 'd', 'e'];

Array destructuring

Array literals may be used on the left-hand side of an assignment to perform destructuring (such as when unpacking multiple values from a single array or iterable). A final "rest" element may be included (with no space between the ... and the variable name). Elements should be omitted if they are unused.

const [a, b, c, ...rest] = generateResults();
let [, b,, d] = someArray;

Destructuring may also be used for function parameters. Always specify [] as the default value if a destructured array parameter is optional, and provide default values on the left hand side:

function destructured([a = 4, b = 2] = []) { … }

Disallowed:

function badDestructuring([a, b] = [4, 2]) { … }

Tip: For (un)packing multiple values into a function’s parameter or return, prefer object destructuring to array destructuring when possible, as it allows naming the individual elements and specifying a different type for each.

## Object literals

Use object literals (`{}` or `{a: 0, b: 1, c: 2}`) instead of the `Object` constructor.

### Iterating objects

Avoid `for (... in ...)` loops for iterating objects due to potential issues with prototype chain properties. Prefer `for (... of Object.keys(...))`, `for (... of Object.values(...))`, or `for (... of Object.entries(...))` for safer iteration. If `for (... in ...)` is necessary, always use `if (!someObj.hasOwnProperty(x)) continue;` to filter properties.
for (const x of Object.keys(someObj)) { // note: for _of_!
  // now x was definitely defined on someObj
}
for (const [key, value] of Object.entries(someObj)) { // note: for _of_!
  // now key was definitely defined on someObj
}

### Using spread syntax

Use spread syntax (`{...bar}`) for shallow-copying objects. Later values overwrite earlier values for the same key. When spreading, ensure only objects are spread; arrays and primitives (`null`, `undefined`) are disallowed. Avoid spreading objects with prototypes other than the `Object` prototype (e.g., class instances), as behavior can be unintuitive.

### Computed property names

Computed property names (e.g., `{'key' + foo()]: 42}`) are allowed. They are treated as quoted (dict-style) keys unless the computed property is a symbol (e.g., `[Symbol.iterator]`). Do not mix them with non-quoted keys.

Object destructuring

Object destructuring patterns may be used on the left-hand side of an assignment to perform destructuring and unpack multiple values from a single object.

Destructured objects may also be used as function parameters, but should be kept as simple as possible: a single level of unquoted shorthand properties. Deeper levels of nesting and computed properties may not be used in parameter destructuring. Specify any default values in the left-hand-side of the destructured parameter ({str = 'some default'} = {}, rather than {str} = {str: 'some default'}), and if a destructured object is itself optional, it must default to {}.

Example:

interface Options {
  /** The number of times to do something. */
  num?: number;

  /** A string to do stuff to. */
  str?: string;
}

function destructured({num, str = 'default'}: Options = {}) {}

Disallowed:

function nestedTooDeeply({x: {num, str}}: {x: Options}) {}
function nontrivialDefault({num, str}: Options = {num: 42, str: 'default'}) {}

Classes
## Classes

### Class declarations

Class declarations must not be terminated with semicolons. Statements containing class expressions, however, must be terminated with a semicolon.

Blank lines separating class declaration braces from other class content are neither encouraged nor discouraged.

### Class method declarations

Class method declarations must not use a semicolon to separate individual method declarations. Method declarations should be separated from surrounding code by a single blank line.

### Overriding `toString`

The `toString` method may be overridden, but must always succeed and never have visible side effects. **Tip**: Be careful of calling other methods from `toString` to avoid infinite loops.

### Static methods

*   **Avoid private static methods**: Prefer module-local functions over private static methods where readability is not interfered with.
*   **Do not rely on dynamic dispatch**: Static methods should only be called on the base class itself, not on variables with dynamic instances or subclasses that don't define the method.
*   **Avoid static `this` references**: Code must not use `this` in a static context due to surprising inheritance behavior and encouragement of anti-patterns with static state.

### Constructors

Constructor calls must use parentheses, even when no arguments are passed (e.g., `new Foo()`). Omitting them can lead to subtle mistakes (e.g., `new Foo().Bar()` vs. `new Foo.Bar()`).

It is unnecessary to provide an empty constructor or one that simply delegates to its parent class (ES2015 provides a default). However, constructors with parameter properties, visibility modifiers, or parameter decorators should not be omitted. The constructor should be separated from surrounding code by a single blank line.

### Class members

*   **No `#private` fields**: Do not use private fields (private identifiers). Instead, use TypeScript's visibility annotations (e.g., `private ident = 1;`). This avoids emit size/performance regressions and limitations with older ES versions.
*   **Use `readonly`**: Mark properties that are never reassigned outside of the constructor with the `readonly` modifier.
*   **Parameter properties**: Use TypeScript parameter properties (e.g., `constructor(private readonly barService: BarService) {}`) rather than manually assigning constructor parameters to class members. Document with an `@param` JSDoc tag if needed.
*   **Field initializers**: If a class member is not a parameter, initialize it where it's declared. Properties should never be added to or removed from an instance after the constructor is finished. Initialize optional fields to `undefined` to prevent later shape changes.
*   **Properties used outside of class lexical scope**: Properties used from outside the lexical scope of their containing class (e.g., in templates) must not use `private` visibility. Use `protected` or `public` as appropriate. Do not use `obj['foo']` to bypass visibility.
*   **Getters and setters**: Getters and setters may be used. Getters must be pure functions (consistent result, no side effects). They are also useful for restricting the visibility of internal details. At least one accessor for a property must be non-trivial. Do not define "pass-through" accessors. Getters and setters must not be defined using `Object.defineProperty`.
*   **Computed properties**: Computed properties may only be used in classes when the property is a symbol (e.g., `[Symbol.iterator]`). Dict-style properties are not allowed.
*   **Visibility**: Limit symbol visibility as much as possible. Consider converting `private` methods to non-exported functions outside the class. TypeScript symbols are public by default; never use the `public` modifier except when declaring non-`readonly` public parameter properties in constructors.
Disallowed class patterns

Do not manipulate prototypes directly

The class keyword allows clearer and more readable class definitions than defining prototype properties. Ordinary implementation code has no business manipulating these objects. Mixins and modifying the prototypes of builtin objects are explicitly forbidden.

Exception: Framework code (such as Polymer, or Angular) may need to use prototypes, and should not resort to even-worse workarounds to avoid doing so.

## Functions

### Terminology

This guide uses the following terminology:
*   "function declaration": a declaration (not an expression) using the `function` keyword.
*   "function expression": an expression, typically used in an assignment or passed as a parameter, using the `function` keyword.
*   "arrow function": an expression using the `=>` syntax.
*   "block body": right-hand side of an `arrow function` with braces.
*   "concise body": right-hand side of an `arrow function` without braces.

Methods and classes/constructors are not covered in this section.

### Prefer function declarations for named functions

Prefer `function declarations` over `arrow functions` or `function expressions` when defining named functions. `Arrow functions` may be used when an explicit type annotation is required (e.g., for an interface implementation).

### Nested functions

Functions nested within other methods or functions may use `function declarations` or `arrow functions`. `Arrow functions` are preferred in method bodies due to their `this` context binding.

### Do not use function expressions

Do not use `function expressions`. Use `arrow functions` instead.
**Exception**: `Function expressions` may be used only if code has to dynamically rebind `this` (discouraged) or for generator functions (which lack arrow syntax).

### Arrow function bodies

Use `arrow functions` with concise bodies (expressions) or block bodies as appropriate. Only use a concise body if the return value of the function is actually used; otherwise, use a block body to ensure a `void` return type and prevent potential side effects. The `void` operator (`void someExpression`) can explicitly ensure an arrow function with an expression body returns `undefined` when the result is unused.

### Rebinding `this`

`Function expressions` and `function declarations` must not use `this` unless they specifically exist to rebind the `this` pointer. Rebinding `this` can often be avoided by using `arrow functions` or explicit parameters. Prefer `arrow functions` over other approaches to binding `this` (e.g., `f.bind(this)`).

### Prefer passing arrow functions as callbacks

Avoid passing a named callback directly to a higher-order function, unless you are sure of signature stability. Prefer passing an arrow function that explicitly forwards parameters to the named callback to prevent unintended behavior with optional arguments.

### Arrow functions as properties

Classes usually should not contain properties initialized to arrow functions. Explicitly manage `this` at call time instead (e.g., `setTimeout(() => { this.patienceTracker(); })`).
**Note**: In some specific situations (e.g., binding functions in a template or event handlers requiring uninstallation), arrow function properties are useful. Use judgment.

### Event handlers

Event handlers may use anonymous arrow functions when no uninstallation is needed. If uninstallation is required, arrow function properties are appropriate as they provide a stable `this`-bound reference. Do not use `bind` in the expression that installs an event handler, as it creates a temporary reference that cannot be uninstalled.

### Parameter initializers

Optional function parameters may be given a default initializer. These initializers must not have any observable side effects and should be kept as simple as possible. Use default parameters sparingly, preferring destructuring for readable APIs when there are multiple optional parameters without a natural order.

### Prefer rest and spread when appropriate

Use a rest parameter (`...numbers`) instead of accessing `arguments`. Never name a local variable or parameter `arguments`. Use function spread syntax (`...array`) instead of `Function.prototype.apply`.

### Formatting functions

*   Blank lines at the start or end of the function body are not allowed.
*   A single blank line may be used sparingly within function bodies for logical groupings.
*   Generators should attach the `*` to the `function` and `yield` keywords (e.g., `function* foo()`, `yield* iter`).
*   Parentheses around the left-hand side of a single-argument arrow function are recommended but not required.
*   Do not put a space after the `...` in rest or spread syntax.

### `this`

Only use `this` in class constructors and methods, functions with an explicit `this` type declared (e.g., `function func(this: ThisType, ...)`), or in arrow functions defined in a scope where `this` may be used.

Never use `this` to refer to the global object, the context of an `eval`, the target of an event, or unnecessarily `call()`ed or `apply()`ed functions.

Interfaces
Primitive literals

String literals

Use single quotes

Ordinary string literals are delimited with single quotes ('), rather than double quotes (").

Tip: if a string contains a single quote character, consider using a template string to avoid having to escape the quote.

No line continuations

Do not use line continuations (that is, ending a line inside a string literal with a backslash) in either ordinary or template string literals. Even though ES5 allows this, it can lead to tricky errors if any trailing whitespace comes after the slash, and is less obvious to readers.

Disallowed:

const LONG_STRING = 'This is a very very very very very very very long string. \
    It inadvertently contains long stretches of spaces due to how the \
    continued lines are indented.';

Instead, write

const LONG_STRING = 'This is a very very very very very very long string. ' +
    'It does not contain long stretches of spaces because it uses ' +
    'concatenated strings.';
const SINGLE_STRING =
    'http://it.is.also/acceptable_to_use_a_single_long_string_when_breaking_would_hinder_search_discoverability';

Template literals

Use template literals (delimited with `) over complex string concatenation, particularly if multiple string literals are involved. Template literals may span multiple lines.

If a template literal spans multiple lines, it does not need to follow the indentation of the enclosing block, though it may if the added whitespace does not matter.

Example:

function arithmetic(a: number, b: number) {
  return `Here is a table of arithmetic operations:
${a} + ${b} = ${a + b}
${a} - ${b} = ${a - b}
${a} * ${b} = ${a * b}
${a} / ${b} = ${a / b}`;
}

Number literals

Numbers may be specified in decimal, hex, octal, or binary. Use exactly 0x, 0o, and 0b prefixes, with lowercase letters, for hex, octal, and binary, respectively. Never include a leading zero unless it is immediately followed by x, o, or b.
Type coercion

TypeScript code may use the String() and Boolean() (note: no new!) functions, string template literals, or !! to coerce types.

const bool = Boolean(false);
const str = String(aNumber);
const bool2 = !!str;
const str2 = `result: ${bool2}`;

Values of enum types (including unions of enum types and other types) must not be converted to booleans with Boolean() or !!, and must instead be compared explicitly with comparison operators.

enum SupportLevel {
  NONE,
  BASIC,
  ADVANCED,
}

const level: SupportLevel = ...;
let enabled = Boolean(level);

const maybeLevel: SupportLevel|undefined = ...;
enabled = !!maybeLevel;

enum SupportLevel {
  NONE,
  BASIC,
  ADVANCED,
}

const level: SupportLevel = ...;
let enabled = level !== SupportLevel.NONE;

const maybeLevel: SupportLevel|undefined = ...;
enabled = level !== undefined && level !== SupportLevel.NONE;

Why?

For most purposes, it doesn't matter what number or string value an enum name is mapped to at runtime, because values of enum types are referred to by name in source code. Consequently, engineers are accustomed to not thinking about this, and so situations where it does matter are undesirable because they will be surprising. Such is the case with conversion of enums to booleans; in particular, by default, the first declared enum value is falsy (because it is 0) while the others are truthy, which is likely to be unexpected. Readers of code that uses an enum value may not even know whether it's the first declared value or not.

Using string concatenation to cast to string is discouraged, as we check that operands to the plus operator are of matching types.

Code must use Number() to parse numeric values, and must check its return for NaN values explicitly, unless failing to parse is impossible from context.

Note: Number(''), Number(' '), and Number('\t') would return 0 instead of NaN. Number('Infinity') and Number('-Infinity') would return Infinity and -Infinity respectively. Additionally, exponential notation such as Number('1e+309') and Number('-1e+309') can overflow into Infinity. These cases may require special handling.

const aNumber = Number('123');
if (!isFinite(aNumber)) throw new Error(...);

Code must not use unary plus (+) to coerce strings to numbers. Parsing numbers can fail, has surprising corner cases, and can be a code smell (parsing at the wrong layer). A unary plus is too easy to miss in code reviews given this.

const x = +y;

Code also must not use parseInt or parseFloat to parse numbers, except for non-base-10 strings (see below). Both of those functions ignore trailing characters in the string, which can shadow error conditions (e.g. parsing 12 dwarves as 12).

const n = parseInt(someString, 10);  // Error prone,
const f = parseFloat(someString);    // regardless of passing a radix.

Code that requires parsing with a radix must check that its input contains only appropriate digits for that radix before calling into parseInt;

if (!/^[a-fA-F0-9]+$/.test(someString)) throw new Error(...);
// Needed to parse hexadecimal.
// tslint:disable-next-line:ban
const n = parseInt(someString, 16);  // Only allowed for radix != 10

Use Number() followed by Math.floor or Math.trunc (where available) to parse integer numbers:

let f = Number(someString);
if (isNaN(f)) handleError();
f = Math.floor(f);

Implicit coercion

Do not use explicit boolean coercions in conditional clauses that have implicit boolean coercion. Those are the conditions in an if, for and while statements.

const foo: MyInterface|null = ...;
if (!!foo) {...}
while (!!foo) {...}

const foo: MyInterface|null = ...;
if (foo) {...}
while (foo) {...}

As with explicit conversions, values of enum types (including unions of enum types and other types) must not be implicitly coerced to booleans, and must instead be compared explicitly with comparison operators.

enum SupportLevel {
  NONE,
  BASIC,
  ADVANCED,
}

const level: SupportLevel = ...;
if (level) {...}

const maybeLevel: SupportLevel|undefined = ...;
if (level) {...}

enum SupportLevel {
  NONE,
  BASIC,
  ADVANCED,
}

const level: SupportLevel = ...;
if (level !== SupportLevel.NONE) {...}

const maybeLevel: SupportLevel|undefined = ...;
if (level !== undefined && level !== SupportLevel.NONE) {...}

Other types of values may be either implicitly coerced to booleans or compared explicitly with comparison operators:

// Explicitly comparing > 0 is OK:
if (arr.length > 0) {...}
// so is relying on boolean coercion:
if (arr.length) {...}

Control structures

Control flow statements and blocks

Control flow statements (if, else, for, do, while, etc) always use braced blocks for the containing code, even if the body contains only a single statement. The first statement of a non-empty block must begin on its own line.

for (let i = 0; i < x; i++) {
  doSomethingWith(i);
}

if (x) {
  doSomethingWithALongMethodNameThatForcesANewLine(x);
}

if (x)
  doSomethingWithALongMethodNameThatForcesANewLine(x);

for (let i = 0; i < x; i++) doSomethingWith(i);

Exception: if statements fitting on one line may elide the block.

if (x) x.doFoo();

Assignment in control statements

Prefer to avoid assignment of variables inside control statements. Assignment can be easily mistaken for equality checks inside control statements.

if (x = someFunction()) {
  // Assignment easily mistaken with equality check
  // ...
}

x = someFunction();
if (x) {
  // ...
}

In cases where assignment inside the control statement is preferred, enclose the assignment in additional parenthesis to indicate it is intentional.

while ((x = someFunction())) {
  // Double parenthesis shows assignment is intentional
  // ...
}

Iterating containers

Prefer for (... of someArr) to iterate over arrays. Array.prototype.forEach and vanilla for loops are also allowed:

for (const x of someArr) {
  // x is a value of someArr.
}

for (let i = 0; i < someArr.length; i++) {
  // Explicitly count if the index is needed, otherwise use the for/of form.
  const x = someArr[i];
  // ...
}
for (const [i, x] of someArr.entries()) {
  // Alternative version of the above.
}

for-in loops may only be used on dict-style objects (see below for more info). Do not use for (... in ...) to iterate over arrays as it will counterintuitively give the array's indices (as strings!), not values:

for (const x in someArray) {
  // x is the index!
}

Object.prototype.hasOwnProperty should be used in for-in loops to exclude unwanted prototype properties. Prefer for-of with Object.keys, Object.values, or Object.entries over for-in when possible.

for (const key in obj) {
  if (!obj.hasOwnProperty(key)) continue;
  doWork(key, obj[key]);
}
for (const key of Object.keys(obj)) {
  doWork(key, obj[key]);
}
for (const value of Object.values(obj)) {
  doWorkValOnly(value);
}
for (const [key, value] of Object.entries(obj)) {
  doWork(key, value);
}

Grouping parentheses

Optional grouping parentheses are omitted only when the author and reviewer agree that there is no reasonable chance that the code will be misinterpreted without them, nor would they have made the code easier to read. It is not reasonable to assume that every reader has the entire operator precedence table memorized.

Do not use unnecessary parentheses around the entire expression following delete, typeof, void, return, throw, case, in, of, or yield.

Exception handling

Exceptions are an important part of the language and should be used whenever exceptional cases occur.

Custom exceptions provide a great way to convey additional error information from functions. They should be defined and used wherever the native Error type is insufficient.

Prefer throwing exceptions over ad-hoc error-handling approaches (such as passing an error container reference type, or returning an object with an error property).
Instantiate errors using new

Always use new Error() when instantiating exceptions, instead of just calling Error(). Both forms create a new Error instance, but using new is more consistent with how other objects are instantiated.

throw new Error('Foo is not a valid bar.');

throw Error('Foo is not a valid bar.');

Only throw errors

JavaScript (and thus TypeScript) allow throwing or rejecting a Promise with arbitrary values. However if the thrown or rejected value is not an Error, it does not populate stack trace information, making debugging hard. This treatment extends to Promise rejection values as Promise.reject(obj) is equivalent to throw obj; in async functions.

// bad: does not get a stack trace.
throw 'oh noes!';
// For promises
new Promise((resolve, reject) => void reject('oh noes!'));
Promise.reject();
Promise.reject('oh noes!');

Instead, only throw (subclasses of) Error:

// Throw only Errors
throw new Error('oh noes!');
// ... or subtypes of Error.
class MyError extends Error {}
throw new MyError('my oh noes!');
// For promises
new Promise((resolve) => resolve()); // No reject is OK.
new Promise((resolve, reject) => void reject(new Error('oh noes!')));
Promise.reject(new Error('oh noes!'));

Catching and rethrowing

When catching errors, code should assume that all thrown errors are instances of Error.

function assertIsError(e: unknown): asserts e is Error {
  if (!(e instanceof Error)) throw new Error("e is not an Error");
}

try {
  doSomething();
} catch (e: unknown) {
  // All thrown errors must be Error subtypes. Do not handle
  // other possible values unless you know they are thrown.
  assertIsError(e);
  displayError(e.message);
  // or rethrow:
  throw e;
}

Exception handlers must not defensively handle non-Error types unless the called API is conclusively known to throw non-Errors in violation of the above rule. In that case, a comment should be included to specifically identify where the non-Errors originate.

try {
  badApiThrowingStrings();
} catch (e: unknown) {
  // Note: bad API throws strings instead of errors.
  if (typeof e === 'string') { ... }
}

Why?

Avoid overly defensive programming. Repeating the same defenses against a problem that will not exist in most code leads to boiler-plate code that is not useful.

Empty catch blocks

It is very rarely correct to do nothing in response to a caught exception. When it truly is appropriate to take no action whatsoever in a catch block, the reason this is justified is explained in a comment.

  try {
    return handleNumericResponse(response);
  } catch (e: unknown) {
    // Response is not numeric. Continue to handle as text.
  }
  return handleTextResponse(response);

Disallowed:

  try {
    shouldFail();
    fail('expected an error');
  } catch (expected: unknown) {
  }

Tip: Unlike in some other languages, patterns like the above simply don’t work since this will catch the error thrown by fail. Use assertThrows() instead.

Switch statements

All switch statements must contain a default statement group, even if it contains no code. The default statement group must be last.

switch (x) {
  case Y:
    doSomethingElse();
    break;
  default:
    // nothing to do.
}

Within a switch block, each statement group either terminates abruptly with a break, a return statement, or by throwing an exception. Non-empty statement groups (case ...) must not fall through (enforced by the compiler):

switch (x) {
  case X:
    doSomething();
    // fall through - not allowed!
  case Y:
    // ...
}

Empty statement groups are allowed to fall through:

switch (x) {
  case X:
  case Y:
    doSomething();
    break;
  default: // nothing to do.
}

Equality checks

Always use triple equals (===) and not equals (!==). The double equality operators cause error prone type coercions that are hard to understand and slower to implement for JavaScript Virtual Machines. See also the JavaScript equality table.

if (foo == 'bar' || baz != bam) {
  // Hard to understand behaviour due to type coercion.
}

if (foo === 'bar' || baz !== bam) {
  // All good here.
}

Exception: Comparisons to the literal null value may use the == and != operators to cover both null and undefined values.

if (foo == null) {
  // Will trigger when foo is null or undefined.
}

Type and non-nullability assertions

Type assertions (x as SomeType) and non-nullability assertions (y!) are unsafe. Both only silence the TypeScript compiler, but do not insert any runtime checks to match these assertions, so they can cause your program to crash at runtime.

Because of this, you should not use type and non-nullability assertions without an obvious or explicit reason for doing so.

Instead of the following:

(x as Foo).foo();

y!.bar();

When you want to assert a type or non-nullability the best answer is to explicitly write a runtime check that performs that check.

// assuming Foo is a class.
if (x instanceof Foo) {
  x.foo();
}

if (y) {
  y.bar();
}

Sometimes due to some local property of your code you can be sure that the assertion form is safe. In those situations, you should add clarification to explain why you are ok with the unsafe behavior:

// x is a Foo, because ...
(x as Foo).foo();

// y cannot be null, because ...
y!.bar();

If the reasoning behind a type or non-nullability assertion is obvious, the comments may not be necessary. For example, generated proto code is always nullable, but perhaps it is well-known in the context of the code that certain fields are always provided by the backend. Use your judgement.
Type assertion syntax

Type assertions must use the as syntax (as opposed to the angle brackets syntax). This enforces parentheses around the assertion when accessing a member.

const x = (<Foo>z).length;
const y = <Foo>z.length;

// z must be Foo because ...
const x = (z as Foo).length;

Double assertions

From the TypeScript handbook, TypeScript only allows type assertions which convert to a more specific or less specific version of a type. Adding a type assertion (x as Foo) which does not meet this criteria will give the error: "Conversion of type 'X' to type 'Y' may be a mistake because neither type sufficiently overlaps with the other."

If you are sure an assertion is safe, you can perform a double assertion. This involves casting through unknown since it is less specific than all types.

// x is a Foo here, because...
(x as unknown as Foo).fooMethod();

Use unknown (instead of any or {}) as the intermediate type.
Type assertions and object literals

Use type annotations (: Foo) instead of type assertions (as Foo) to specify the type of an object literal. This allows detecting refactoring bugs when the fields of an interface change over time.

interface Foo {
  bar: number;
  baz?: string;  // was "bam", but later renamed to "baz".
}

const foo = {
  bar: 123,
  bam: 'abc',  // no error!
} as Foo;

function func() {
  return {
    bar: 123,
    bam: 'abc',  // no error!
  } as Foo;
}

interface Foo {
  bar: number;
  baz?: string;
}

const foo: Foo = {
  bar: 123,
  bam: 'abc',  // complains about "bam" not being defined on Foo.
};

function func(): Foo {
  return {
    bar: 123,
    bam: 'abc',   // complains about "bam" not being defined on Foo.
  };
}

Keep try blocks focused

Limit the amount of code inside a try block, if this can be done without hurting readability.

try {
  const result = methodThatMayThrow();
  use(result);
} catch (error: unknown) {
  // ...
}

let result;
try {
  result = methodThatMayThrow();
} catch (error: unknown) {
  // ...
}
use(result);

Moving the non-throwable lines out of the try/catch block helps the reader learn which method throws exceptions. Some inline calls that do not throw exceptions could stay inside because they might not be worth the extra complication of a temporary variable.

Exception: There may be performance issues if try blocks are inside a loop. Widening try blocks to cover a whole loop is ok.
Decorators

Decorators are syntax with an @ prefix, like @MyDecorator.

Do not define new decorators. Only use the decorators defined by frameworks:

    Angular (e.g. @Component, @NgModule, etc.)
    Polymer (e.g. @property)

Why?

We generally want to avoid decorators, because they were an experimental feature that have since diverged from the TC39 proposal and have known bugs that won't be fixed.

When using decorators, the decorator must immediately precede the symbol it decorates, with no empty lines between:

/** JSDoc comments go before decorators */
@Component({...})  // Note: no empty line after the decorator.
class MyComp {
  @Input() myField: string;  // Decorators on fields may be on the same line...

  @Input()
  myOtherField: string;  // ... or wrap.
}

Disallowed features

Wrapper objects for primitive types

TypeScript code must not instantiate the wrapper classes for the primitive types String, Boolean, and Number. Wrapper classes have surprising behavior, such as new Boolean(false) evaluating to true.

const s = new String('hello');
const b = new Boolean(false);
const n = new Number(5);

The wrappers may be called as functions for coercing (which is preferred over using + or concatenating the empty string) or creating symbols. See type coercion for more information.

Automatic Semicolon Insertion

Do not rely on Automatic Semicolon Insertion (ASI). Explicitly end all statements using a semicolon. This prevents bugs due to incorrect semicolon insertions and ensures compatibility with tools with limited ASI support (e.g. clang-format).
Const enums

Code must not use const enum; use plain enum instead.

Why?

TypeScript enums already cannot be mutated; const enum is a separate language feature related to optimization that makes the enum invisible to JavaScript users of the module.
Debugger statements

Debugger statements must not be included in production code.

function debugMe() {
  debugger;
}

with

Do not use the with keyword. It makes your code harder to understand and has been banned in strict mode since ES5.

Dynamic code evaluation

Do not use eval or the Function(...string) constructor (except for code loaders). These features are potentially dangerous and simply do not work in environments using strict Content Security Policies.

Non-standard features

Do not use non-standard ECMAScript or Web Platform features.

This includes:

    Old features that have been marked deprecated or removed entirely from ECMAScript / the Web Platform (see MDN)
    New ECMAScript features that are not yet standardized
        Avoid using features that are in current TC39 working draft or currently in the proposal process
        Use only ECMAScript features defined in the current ECMA-262 specification
    Proposed but not-yet-complete web standards:
        WHATWG proposals that have not completed the proposal process.
    Non-standard language “extensions” (such as those provided by some external transpilers)

Projects targeting specific JavaScript runtimes, such as latest-Chrome-only, Chrome extensions, Node.JS, Electron, can obviously use those APIs. Use caution when considering an API surface that is proprietary and only implemented in some browsers; consider whether there is a common library that can abstract this API surface away for you.

Modifying builtin objects

Never modify builtin types, either by adding methods to their constructors or to their prototypes. Avoid depending on libraries that do this.

Do not add symbols to the global object unless absolutely necessary (e.g. required by a third-party API).

## Naming

For detailed naming and identifier rules, refer to [docs/guide/typescript-naming-conventions.md](docs/guide/typescript-naming-conventions.md).

Type system
Type inference

Code may rely on type inference as implemented by the TypeScript compiler for all type expressions (variables, fields, return types, etc).

const x = 15;  // Type inferred.

Leave out type annotations for trivially inferred types: variables or parameters initialized to a string, number, boolean, RegExp literal or new expression.

const x: boolean = true;  // Bad: 'boolean' here does not aid readability

// Bad: 'Set' is trivially inferred from the initialization
const x: Set<string> = new Set();

Explicitly specifying types may be required to prevent generic type parameters from being inferred as unknown. For example, initializing generic types with no values (e.g. empty arrays, objects, Maps, or Sets).

const x = new Set<string>();

For more complex expressions, type annotations can help with readability of the program:

// Hard to reason about the type of 'value' without an annotation.
const value = await rpc.getSomeValue().transform();

// Can tell the type of 'value' at a glance.
const value: string[] = await rpc.getSomeValue().transform();

Whether an annotation is required is decided by the code reviewer.
### Return types

Whether to include return type annotations for functions and methods is up to the code author. Reviewers may request annotations for complex return types to improve clarity and catch future type errors.

### Undefined and null

TypeScript supports `undefined` and `null` types, which can be used in union types (e.g., `string|null`). There is no general guidance to prefer one over the other; choose based on context (e.g., `Map.get` uses `undefined`, DOM APIs often use `null`).
#### Nullable/undefined type aliases

Type aliases must not include `|null` or `|undefined` in a union type. Instead, add these to the type when the alias is actually used, and deal with null/undefined values close to where they arise.

#### Prefer optional over `|undefined`

Use optional fields (`?:`) on interfaces or classes and optional parameters rather than `|undefined` in types. For classes, initialize as many fields as possible to avoid this pattern.

### Use structural types

TypeScript's type system is structural. When providing a structural-based implementation, explicitly include the type at the declaration of the symbol (e.g., `const foo: Foo = { ... }`).

#### Use interfaces to define structural types, not classes

Use `interface` to define structural types, not `class`. This allows for more precise type checking and error reporting at the object declaration site.

### Prefer interfaces over type literal aliases

When declaring types for objects, use `interface` instead of a type alias for the object literal expression. `interface` offers benefits in terms of display, performance, and declaration merging.
### Array<T> Type

For simple types (alphanumeric characters and dots), use the syntax sugar `T[]` or `readonly T[]`. For multi-dimensional non-readonly arrays of simple types, use `T[][]`, `T[][][]`, etc. For anything more complex (e.g., union types, object literals), use the longer form `Array<T>` or `ReadonlyArray<T>`.

```ts
let a: string[];
let d: string[][];
let e: Array<{n: number, s: string}>;
let f: Array<string|number>;
```

### Indexable types / index signatures (`{[key: string]: T}`)

For dictionary-like objects, use an index signature (`{[key: string]: T}`) and provide a meaningful label for the key (e.g., `{[userName: string]: number}`).

**Consider using ES6 `Map` and `Set` types instead** for better explicit intent and support for keys other than strings. TypeScript's `Record<Keys, ValueType>` type can be used for types with a defined set of statically known keys.
### Mapped and conditional types

Mapped types and conditional types allow specifying new types based on other types. While powerful, they can make code harder to read and maintain due to their complexity and potential tooling limitations.

**Recommendation**:
*   Always use the simplest type construct possible.
*   A little repetition or verbosity is often much cheaper than the long-term cost of complex type expressions.
*   Mapped and conditional types may be used, subject to these considerations. For instance, prefer simple `interface` extension over `Pick<T, Keys>` for creating subsets of types when clarity is paramount.

Using interfaces here makes the grouping of properties explicit, improves IDE support, allows better optimization, and arguably makes the code easier to understand.
### `any` Type

TypeScript's `any` type is dangerous as it masks severe programming errors and undermines static typing. **Consider not to use `any`**. When its use seems necessary, consider:

*   **Providing a more specific type**: Use interfaces, inline object types, type aliases, or generic types.
*   **Using `unknown`**: The `unknown` type is a safer alternative to `any` as it requires type narrowing or casting before use.
*   **Suppressing lint warnings and documenting why**: If `any` is legitimately needed (e.g., in tests for partial mocks), suppress the lint warning with a comment explaining the justification.

{} Type

The {} type, also known as an empty interface type, represents a interface with no properties. An empty interface type has no specified properties and therefore any non-nullish value is assignable to it.

### `{}` Type

The `{}` (empty object literal) type represents an interface with no properties, allowing any non-nullish value to be assigned to it. **Avoid using `{}` for most use cases** as it is rarely appropriate. Prefer more descriptive types such as `unknown` (for opaque values), `Record<string, T>` (for dictionary-like objects), or `object` (to exclude primitives).

### Tuple types

If creating a `Pair` type, prefer a tuple type (e.g., `[string, string]`). However, for clarity, it's often better to provide meaningful names for properties using an interface or an inline object literal type, especially when destructuring.

### Wrapper types

Avoid using `String`, `Boolean`, and `Number` wrapper classes; always use the lowercase primitive types (`string`, `boolean`, `number`). Also, avoid `Object`; use `{}` or `object` instead. Never invoke wrapper types as constructors (`new String()`).

### Return type only generics

Avoid creating APIs that have return type only generics. When working with existing APIs, always explicitly specify the generics.

## Toolchain requirements

### TypeScript compiler

All TypeScript files must pass type checking using the standard toolchain.

### `@ts-ignore`

**Do not use `@ts-ignore`**, `@ts-expect-error`, or `@ts-nocheck` in production code. They superficially fix errors but mask larger problems and can cause crashes. You may use `@ts-expect-error` in unit tests, but generally avoid it due to its broad error suppression. Instead, use casts with explanatory comments, or suppress lint warnings with documentation.


## Comments and documentation

### JSDoc versus comments

*   Use `/** JSDoc */` comments for documentation (for users of the code).
*   Use `// line comments` for implementation comments (for implementers of the code).

JSDoc comments are understood by tools; ordinary comments are for humans only.

### Multi-line comments

Multi-line comments are indented at the same level as the surrounding code. They must use multiple single-line comments (`//-style`), not block comment style (`/* */`). Comments are not enclosed in boxes drawn with asterisks.
### JSDoc general form

Basic formatting:
```ts
/**
 * Multiple lines of JSDoc text are written here,
 * wrapped normally.
 * @param arg A number to do something to.
 */
function doSomething(arg: number) { ... }
```
or single-line:
```ts
/** This short jsdoc describes the function. */
function doSomething(arg: number) { ... }
```
If a single-line comment overflows, it must use the multi-line style. JSDoc comments must be well-formed for tools.

### Markdown

JSDoc is written in Markdown (with optional HTML). Use Markdown lists for formatting.

### JSDoc tags

Google style allows a subset of JSDoc tags. Most tags must occupy their own line with the tag at the beginning.
 * The "param" tag must occupy its own line and may not be combined.
 * @param left A description of the left param.
 * @param right A description of the right param.
 */
function add(left: number, right: number) { ... }

/**
 * The "param" tag must occupy its own line and may not be combined.
 * @param left @param right
 */
function add(left: number, right: number) { ... }

### Line wrapping

Line-wrapped block tags are indented four spaces. Wrapped description text may be lined up with the description on previous lines, but this horizontal alignment is discouraged. Do not indent when wrapping `@desc` or `@fileoverview` descriptions.

### Document all top-level exports of modules

Use `/** JSDoc */` comments to communicate information to users of your code. Avoid merely restating property or parameter names. Document all properties and methods (exported/public or not) whose purpose is not immediately obvious.
**Exception**: Symbols exported only for tooling (e.g., `@NgModule` classes) do not require comments.

### Class comments

JSDoc comments for classes should provide enough information for users to understand how and when to use the class, including additional considerations. Textual descriptions may be omitted on the constructor if the class JSDoc is sufficient.

### Method and function comments

Method, parameter, and return descriptions may be omitted if obvious from the rest of the method's JSDoc, method name, or type signature. Method descriptions begin with a verb phrase (e.g., "This method ...").

### Parameter property comments

For parameter properties (constructor parameters prefixed by `private`, `protected`, `public`, or `readonly`), use the `@param` annotation in JSDoc to document them.

### JSDoc type annotations

JSDoc type annotations are redundant in TypeScript source code. Do not declare types in `@param` or `@return` blocks, and do not use `@implements`, `@enum`, `@private`, `@override`, etc., when the corresponding TypeScript keywords are used.

### Make comments that actually add information

For non-exported symbols, comments should add information not obvious from the name and type. Avoid comments that merely restate parameter names/types. `@param` and `@return` lines are only required when they add information.

### Comments when calling a function

Use "parameter name" comments (`/* parameterName= */ value`) before the parameter value when the method name and parameter value do not sufficiently convey its meaning. Consider refactoring to accept an interface and destructure it.

### Place documentation prior to decorators

Place JSDoc comments *prior to decorators*. Do not write JSDoc between a decorator and the decorated statement.

## Policies

### Consistency

For any style question not definitively settled by this guide, follow the existing code in the same file ("be consistent"). If unresolved, emulate other files in the same directory. New files must adhere to this guide.

**Reformatting existing code**: Reformatting all existing code is not required; it's a trade-off. If significant changes are made to a file, it is expected to be in this style. Promote opportunistic style fixes to separate changes.

### Deprecation

Mark deprecated methods, classes, or interfaces with an `@deprecated` JSDoc annotation, including clear directions for fixes.

### Generated code: mostly exempt

Source code generated by the build process is not required to be in this style. However, generated identifiers referenced from hand-written code must follow naming requirements.

