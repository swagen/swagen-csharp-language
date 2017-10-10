# swagen-csharp-language
C# language helpers for Swagen generators that generate C# code

## Installation
In your swagen generator package:

```sh
npm install --save swagen-csharp-language
```

## Usage
swagen-csharp-language provides several helper functions. You can view the [API reference](docs/API.md) for more details.

```ts
const ts = require('swagen-csharp-language');

const headers = ts.buildHeader(profile, definition);
```
