# checkyollama

First-class VS Code support for [Ollama](https://ollama.com) Modelfiles. Get autocomplete, hover documentation, and real-time validation — all inside your editor.

![VS Code](https://img.shields.io/badge/VS_Code-007ACC?logo=visual-studio-code&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?logo=ollama&logoColor=white)

## Features

### Autocomplete
Type `FROM`, `PARAMETER`, `SYSTEM`, `TEMPLATE`, `MESSAGE`, `ADAPTER`, `LICENSE`, or `REQUIRES` and get instant suggestions. After `PARAMETER`, all 19 supported parameters are suggested with type and range info. After `MESSAGE`, role suggestions (`user`, `assistant`, `system`) appear.

### Hover Documentation
Hover over any parameter name to see its type, valid range, and description — linked directly to the [Ollama Modelfile docs](https://docs.ollama.com/modelfile#parameter).

### Real-time Validation
The extension validates your Modelfile as you type:

- **Missing FROM** — errors if no `FROM` instruction is found
- **Invalid parameters** — flags unknown parameter names
- **Invalid values** — checks type and range (e.g. `temperature` must be 0.0–2.0)
- **Duplicate FROM** — warns if `FROM` appears more than once
- **Empty values** — errors if a `PARAMETER` has no value
- **Unknown instructions** — warns on unrecognized uppercase keywords
- **MESSAGE roles** — validates that roles are `user`, `assistant`, or `system`
- **MESSAGE content** — errors if a message has no content

### Code Snippets
Quick templates for common patterns:

| Trigger | Description |
|---------|-------------|
| `modelfile` | Basic Modelfile with FROM, params, and SYSTEM prompt |
| `from` | FROM instruction |
| `param` | PARAMETER instruction (with all 19 params in picker) |
| `system` | SYSTEM prompt block |
| `template` | TEMPLATE prompt block |
| `message` | MESSAGE instruction |
| `adapter` | ADAPTER instruction |
| `license` | LICENSE block |
| `requires` | REQUIRES instruction |
| `chatmodelfile` | Full Modelfile with chat template |

### Syntax Highlighting
Full TextMate grammar covering:
- All 8 instructions as keywords
- All 19 parameters highlighted distinctly
- Triple-quoted and single-quoted strings
- Comments (`# ...`)
- MESSAGE roles (`user`, `assistant`, `system`)

## Supported Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `temperature` | float | 0.0 – 2.0 | Controls randomness |
| `num_ctx` | int | > 0 | Context window size (tokens) |
| `min_p` | float | 0.0 – 1.0 | Minimum probability threshold |
| `repeat_last_n` | int | -1 or > 0 | Tokens to look back for repetition |
| `repeat_penalty` | float | ≥ 1.0 | Penalty for repeated tokens |
| `seed` | int | any integer | Random seed for reproducibility |
| `stop` | string | any | Stop sequences (space-separated) |
| `num_predict` | int | -1 or > 0 | Max tokens to generate |
| `top_k` | int | ≥ 0 | Top-k sampling |
| `top_p` | float | 0.0 – 1.0 | Nucleus sampling threshold |
| `mirostat` | int | 0, 1, or 2 | Mirostat algorithm |
| `mirostat_eta` | float | > 0 | Mirostat learning rate |
| `mirostat_tau` | float | > 0 | Mirostat target entropy |
| `num_gpu` | int | ≥ 0 | Number of GPU layers |
| `tfs_z` | float | > 0 | Tail free sampling |
| `typical_p` | float | 0.0 – 1.0 | Typical sampling threshold |
| `presence_penalty` | float | any | Penalty for token presence |
| `frequency_penalty` | float | any | Penalty for token frequency |
| `chat_template` | string | any | Custom chat template |

## Requirements

- [VS Code](https://code.visualstudio.com/) ^1.110.0
- [Ollama](https://ollama.com) (for running models)

## Extension Settings

This extension contributes the following settings:

* `checkyollama.enableDiagnostics`: Enable/disable real-time Modelfile validation diagnostics.
* `checkyollama.enableAutocomplete`: Enable/disable autocomplete for instructions and parameters.
* `checkyollama.enableHover`: Enable/disable hover documentation for parameters.

## Known Issues

- Multi-line `MESSAGE` blocks (using triple quotes) are not fully validated yet.
- `ADAPTER` path existence is not checked.
- `REQUIRES` capability names are not validated against a known list.

## Release Notes

### 0.1.0

Initial feature release:
- Autocomplete for all instructions and parameters
- Hover documentation with links to Ollama docs
- Real-time validation (FROM required, parameter types/ranges, unknown instructions, MESSAGE roles)
- Code snippets for all Modelfile instructions
- Expanded syntax highlighting (19 parameters, comments, message roles)

### 0.0.1

Initial release with basic FROM check and parameter validation.

## Contributing

Issues and PRs welcome at [github.com/Divyesh-Kamalanaban/checkyollama](https://github.com/Divyesh-Kamalanaban/checkyollama).

## License

Apache License 2.0
