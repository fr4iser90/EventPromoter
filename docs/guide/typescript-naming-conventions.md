🏷️ Google TypeScript Style Guide – Naming & Identifier Rules

(Based directly on the official guide: https://google.github.io/styleguide/tsguide.html
)

✔️ 1. Allowed Characters in Identifiers

Identifiers may contain only:

ASCII letters (A–Z, a–z)

Digits (0–9)

_ (underscore) — only for constants and structured test names

$ (rare, e.g. for Observables)

Regex match:

[$\w]+

🎨 ✔️ 2. Naming Style
A) General Principles

Do not duplicate type information in names
Names should be descriptive without encoding type details (e.g. avoid prefixes like opt_ for optional values).

No leading or trailing underscores
Examples like _foo or foo_ are forbidden.

No I prefix for interfaces
Avoid names like IUser, unless it is idiomatic in a specific context.

Observable suffix ($)
Optional. Google does not require it, but it may be used if it makes sense within a project.

🧠 ✔️ 3. Casing Rules
Category	Allowed Style
Classes	UpperCamelCase
Interfaces	UpperCamelCase
Types	UpperCamelCase
Enums	UpperCamelCase
Decorators	UpperCamelCase
Type parameters	UpperCamelCase
Component names	UpperCamelCase
Variables	lowerCamelCase
Parameters	lowerCamelCase
Functions	lowerCamelCase
Methods	lowerCamelCase
Properties	lowerCamelCase
Module aliases	lowerCamelCase
Global constants	CONSTANT_CASE
Enum values	CONSTANT_CASE
#private fields	❌ Not used in Google code
📌 In short:

Classes / Types / Enums → UpperCamelCase

Functions / Variables / Properties → lowerCamelCase

Global constants / Enum values → CONSTANT_CASE

🧩 ✔️ 4. Additional Identifier Rules
A) Abbreviations & CamelCase

Treat abbreviations as normal word parts:

✅ loadHttpUrl

❌ loadHTTPURL

B) Underscores (_) in Names

Forbidden as prefix or suffix

A single _ as a parameter name is not allowed

➡️ Instead of _unused, use a meaningful name or refactor the code structure.

C) TypeScript Generics / Type Parameters

Type parameters may be:

A single letter: T

A descriptive name in UpperCamelCase: EntityType, ResultType

D) Import Aliases

Module namespace imports must be lowerCamelCase

File names have no explicit rule section, but should be consistent

E) Constants

CONSTANT_CASE indicates the value should not be reassigned
(even if it is technically mutable)

Allowed only for:

Module-level constants

static readonly class properties

Enums

🧪 ✔️ 5. Tests

Test method names in xUnit style may contain underscores
Example:

testX_whenY_doesZ()

📌 Summary – Quick Checklist (from the Google Guide)
✔ Allowed Identifier Characters

ASCII letters, digits, _, $ (rare)

✔ Naming Cases

Class / Interface / Type / Enum → UpperCamelCase

Variable / Function / Parameter / Property → lowerCamelCase

Global constants / Enum values → CONSTANT_CASE

✔ Rules

No leading or trailing _

No I prefix for interfaces

Abbreviations treated as full words in CamelCase