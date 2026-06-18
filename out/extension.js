"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Ollama Modelfile support is now active.');
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('modelfile');
    // Register completion provider for autocomplete
    const completionProvider = vscode.languages.registerCompletionItemProvider({ language: 'modelfile', scheme: 'file' }, new ModelfileCompletionProvider(), ' ', '\n', '\t');
    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider({ language: 'modelfile', scheme: 'file' }, new ModelfileHoverProvider());
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => validateModelfile(doc, diagnosticCollection)), vscode.workspace.onDidChangeTextDocument(event => validateModelfile(event.document, diagnosticCollection)), diagnosticCollection, completionProvider, hoverProvider);
}
function deactivate() { }
// ─── Completion Provider ─────────────────────────────────────────────────────
class ModelfileCompletionProvider {
    constructor() {
        this.instructions = [
            new vscode.CompletionItem('FROM', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('PARAMETER', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('SYSTEM', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('TEMPLATE', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('MESSAGE', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('ADAPTER', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('LICENSE', vscode.CompletionItemKind.Keyword),
            new vscode.CompletionItem('REQUIRES', vscode.CompletionItemKind.Keyword),
        ];
        this.parameters = [
            this.createParamItem('temperature', 'float', '0.0 – 2.0', 'Controls randomness. Lower = more focused.'),
            this.createParamItem('num_ctx', 'int', '> 0', 'Context window size (tokens).'),
            this.createParamItem('min_p', 'float', '0.0 – 1.0', 'Minimum probability threshold.'),
            this.createParamItem('repeat_last_n', 'int', '-1 or > 0', 'How many tokens to look back for repetition. -1 = disabled.'),
            this.createParamItem('repeat_penalty', 'float', '≥ 1.0', 'Penalty for repeated tokens.'),
            this.createParamItem('seed', 'int', 'any integer', 'Random seed for reproducibility.'),
            this.createParamItem('stop', 'string', 'any string', 'Stop sequences (space-separated).'),
            this.createParamItem('num_predict', 'int', '-1 or > 0', 'Max tokens to generate. -1 = infinite.'),
            this.createParamItem('top_k', 'int', '≥ 0', 'Top-k sampling. 0 = disabled.'),
            this.createParamItem('top_p', 'float', '0.0 – 1.0', 'Nucleus sampling threshold.'),
            this.createParamItem('mirostat', 'int', '0, 1, or 2', 'Mirostat algorithm. 0 = disabled.'),
            this.createParamItem('mirostat_eta', 'float', '> 0', 'Mirostat learning rate.'),
            this.createParamItem('mirostat_tau', 'float', '> 0', 'Mirostat target entropy.'),
            this.createParamItem('num_gpu', 'int', '≥ 0', 'Number of GPU layers.'),
            this.createParamItem('tfs_z', 'float', '> 0', 'Tail free sampling.'),
            this.createParamItem('typical_p', 'float', '0.0 – 1.0', 'Typical sampling threshold.'),
            this.createParamItem('presence_penalty', 'float', 'any', 'Penalty for token presence.'),
            this.createParamItem('frequency_penalty', 'float', 'any', 'Penalty for token frequency.'),
            this.createParamItem('chat_template', 'string', 'any', 'Custom chat template.'),
        ];
        this.messageRoles = [
            new vscode.CompletionItem('user', vscode.CompletionItemKind.Enum),
            new vscode.CompletionItem('assistant', vscode.CompletionItemKind.Enum),
            new vscode.CompletionItem('system', vscode.CompletionItemKind.Enum),
        ];
        this.paramValueSuggestions = new Map([
            ['temperature', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.7', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2.0', vscode.CompletionItemKind.Value),
                ]],
            ['num_ctx', [
                    new vscode.CompletionItem('2048', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('4096', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('8192', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('16384', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('32768', vscode.CompletionItemKind.Value),
                ]],
            ['min_p', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.05', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                ]],
            ['repeat_last_n', [
                    new vscode.CompletionItem('-1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('64', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('128', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('256', vscode.CompletionItemKind.Value),
                ]],
            ['repeat_penalty', [
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.2', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.5', vscode.CompletionItemKind.Value),
                ]],
            ['seed', [
                    new vscode.CompletionItem('0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('42', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('12345', vscode.CompletionItemKind.Value),
                ]],
            ['stop', [
                    new vscode.CompletionItem('"\\n"', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('"\\n\\n"', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('"User:"', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('"Assistant:"', vscode.CompletionItemKind.Value),
                ]],
            ['num_predict', [
                    new vscode.CompletionItem('-1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('128', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('512', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1024', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2048', vscode.CompletionItemKind.Value),
                ]],
            ['top_k', [
                    new vscode.CompletionItem('0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('10', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('20', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('40', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('80', vscode.CompletionItemKind.Value),
                ]],
            ['top_p', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.7', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.9', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                ]],
            ['mirostat', [
                    new vscode.CompletionItem('0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2', vscode.CompletionItemKind.Value),
                ]],
            ['mirostat_eta', [
                    new vscode.CompletionItem('0.1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.2', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                ]],
            ['mirostat_tau', [
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('5.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('10.0', vscode.CompletionItemKind.Value),
                ]],
            ['num_gpu', [
                    new vscode.CompletionItem('0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('4', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('8', vscode.CompletionItemKind.Value),
                ]],
            ['tfs_z', [
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('2.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('5.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('10.0', vscode.CompletionItemKind.Value),
                ]],
            ['typical_p', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.7', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.9', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                ]],
            ['presence_penalty', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.5', vscode.CompletionItemKind.Value),
                ]],
            ['frequency_penalty', [
                    new vscode.CompletionItem('0.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('0.5', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.0', vscode.CompletionItemKind.Value),
                    new vscode.CompletionItem('1.5', vscode.CompletionItemKind.Value),
                ]],
        ]);
    }
    createParamItem(label, type, range, detail) {
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Variable);
        item.detail = `${type} — ${range}`;
        item.documentation = new vscode.MarkdownString(detail);
        return item;
    }
    provideCompletionItems(document, position, token, context) {
        const text = document.getText();
        const lineText = document.lineAt(position).text;
        const lineUpToCursor = lineText.substring(0, position.character);
        // Suggest parameters after PARAMETER keyword (including partial typing like "PARAMETER tempe")
        const paramPrefixMatch = lineUpToCursor.match(/^\s*PARAMETER\s+(\w*)$/i);
        if (paramPrefixMatch) {
            const prefix = paramPrefixMatch[1].toLowerCase();
            if (prefix.length === 0) {
                return this.parameters;
            }
            return this.parameters.filter(item => String(item.label).toLowerCase().startsWith(prefix));
        }
        // Suggest roles after MESSAGE keyword (including partial typing)
        const rolePrefixMatch = lineUpToCursor.match(/^\s*MESSAGE\s+(\w*)$/i);
        if (rolePrefixMatch) {
            const prefix = rolePrefixMatch[1].toLowerCase();
            if (prefix.length === 0) {
                return this.messageRoles;
            }
            return this.messageRoles.filter(item => String(item.label).toLowerCase().startsWith(prefix));
        }
        // Suggest parameter values after parameter name (e.g., "PARAMETER temperature ")
        const paramValueMatch = lineUpToCursor.match(/^\s*PARAMETER\s+(\w+)\s+$/i);
        if (paramValueMatch) {
            const paramName = paramValueMatch[1].toLowerCase();
            const suggestions = this.paramValueSuggestions.get(paramName);
            if (suggestions) {
                return suggestions;
            }
            // For parameters without predefined suggestions, return a generic value suggestion
            return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Value)];
        }
        // Suggest instructions after other keywords (ADAPTER, TEMPLATE, SYSTEM, LICENSE, REQUIRES, FROM)
        const otherKeywordMatch = lineUpToCursor.match(/^\s*(FROM|SYSTEM|TEMPLATE|ADAPTER|LICENSE|REQUIRES)\s+$/i);
        if (otherKeywordMatch) {
            return this.instructions;
        }
        // Suggest instructions only at start of line (empty line)
        if (/^\s*$/.test(lineUpToCursor)) {
            return this.instructions;
        }
        return [];
    }
}
// ─── Hover Provider ──────────────────────────────────────────────────────────
class ModelfileHoverProvider {
    constructor() {
        this.paramDocs = new Map([
            ['temperature', { type: 'float', range: '0.0 – 2.0', desc: 'Controls randomness. Lower values make output more focused and deterministic.' }],
            ['num_ctx', { type: 'int', range: '> 0', desc: 'Context window size in tokens. Typical: 2048–131072.' }],
            ['min_p', { type: 'float', range: '0.0 – 1.0', desc: 'Minimum probability threshold. Disables tokens below this probability.' }],
            ['repeat_last_n', { type: 'int', range: '-1 or > 0', desc: 'How many tokens to look back for repetition. -1 disables.' }],
            ['repeat_penalty', { type: 'float', range: '≥ 1.0', desc: 'Penalty for repeated tokens. 1.0 = neutral.' }],
            ['seed', { type: 'int', range: 'any integer', desc: 'Random seed for reproducibility. Negative = random.' }],
            ['stop', { type: 'string', range: 'any string', desc: 'Stop sequences. Space-separated strings.' }],
            ['num_predict', { type: 'int', range: '-1 or > 0', desc: 'Maximum tokens to generate. -1 = infinite.' }],
            ['top_k', { type: 'int', range: '≥ 0', desc: 'Top-k sampling. 0 disables. Typical: 1–100.' }],
            ['top_p', { type: 'float', range: '0.0 – 1.0', desc: 'Nucleus sampling threshold.' }],
            ['mirostat', { type: 'int', range: '0, 1, or 2', desc: 'Mirostat algorithm. 0 = disabled.' }],
            ['mirostat_eta', { type: 'float', range: '> 0', desc: 'Mirostat learning rate.' }],
            ['mirostat_tau', { type: 'float', range: '> 0', desc: 'Mirostat target entropy.' }],
            ['num_gpu', { type: 'int', range: '≥ 0', desc: 'Number of GPU layers to offload.' }],
            ['tfs_z', { type: 'float', range: '> 0', desc: 'Tail free sampling parameter.' }],
            ['typical_p', { type: 'float', range: '0.0 – 1.0', desc: 'Typical sampling threshold.' }],
            ['presence_penalty', { type: 'float', range: 'any', desc: 'Penalty for token presence in the context.' }],
            ['frequency_penalty', { type: 'float', range: 'any', desc: 'Penalty for token frequency in the context.' }],
            ['chat_template', { type: 'string', range: 'any', desc: 'Custom chat template string.' }],
        ]);
    }
    provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return undefined;
        const word = document.getText(wordRange).trim();
        const info = this.paramDocs.get(word);
        if (!info)
            return undefined;
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${word}**\n\n`);
        md.appendMarkdown(`- **Type:** \`${info.type}\`\n`);
        md.appendMarkdown(`- **Range:** ${info.range}\n\n`);
        md.appendMarkdown(info.desc);
        md.appendMarkdown(`\n\n[Ollama Docs](https://docs.ollama.com/modelfile#parameter)`);
        return new vscode.Hover(md, wordRange);
    }
}
// ─── Validation ──────────────────────────────────────────────────────────────
function validateModelfile(doc, collection) {
    if (doc.languageId !== 'modelfile')
        return;
    const diagnostics = [];
    checkRequiredFrom(doc, diagnostics);
    checkValidParams(doc, diagnostics);
    checkValidInstructions(doc, diagnostics);
    checkMessageBlocks(doc, diagnostics);
    collection.set(doc.uri, diagnostics);
}
function checkRequiredFrom(doc, diagnostics) {
    const text = doc.getText();
    const fromRegex = /^\s*FROM\b/im;
    if (!fromRegex.test(text)) {
        const firstLine = doc.lineAt(0);
        const range = firstLine.range;
        const diagnostic = new vscode.Diagnostic(range, "A Modelfile must begin with a 'FROM' instruction (e.g., FROM llama3).", vscode.DiagnosticSeverity.Error);
        diagnostic.code = {
            value: 'Missing FROM',
            target: vscode.Uri.parse('https://docs.ollama.com/modelfile')
        };
        diagnostics.push(diagnostic);
    }
}
function checkValidParams(document, diagnostics) {
    const allowedParamsMap = new Map([
        ['temperature', { type: 'float', validate: (v) => /^(\d+(\.\d+)?)$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 2 }],
        ['num_ctx', { type: 'int', validate: (v) => /^\d+$/.test(v) && parseInt(v) > 0 }],
        ['min_p', { type: 'float', validate: (v) => /^(0(\.\d+)?|1(\.0+)?)$/.test(v) }],
        ['repeat_last_n', { type: 'int', validate: (v) => /^(-1|\d+)$/.test(v) }],
        ['repeat_penalty', { type: 'float', validate: (v) => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 1.0 }],
        ['seed', { type: 'int', validate: (v) => /^-?\d+$/.test(v) }],
        ['stop', { type: 'string', validate: (v) => typeof v === 'string' && v.length > 0 }],
        ['num_predict', { type: 'int', validate: (v) => /^(-1|\d+)$/.test(v) }],
        ['top_k', { type: 'int', validate: (v) => /^\d+$/.test(v) }],
        ['top_p', { type: 'float', validate: (v) => /^(0(\.\d+)?|1(\.0+)?)$/.test(v) }],
        ['mirostat', { type: 'int', validate: (v) => /^[012]$/.test(v) }],
        ['mirostat_eta', { type: 'float', validate: (v) => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 0 }],
        ['mirostat_tau', { type: 'float', validate: (v) => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 0 }],
        ['num_gpu', { type: 'int', validate: (v) => /^\d+$/.test(v) && parseInt(v) >= 0 }],
        ['tfs_z', { type: 'float', validate: (v) => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 0 }],
        ['typical_p', { type: 'float', validate: (v) => /^(0(\.\d+)?|1(\.0+)?)$/.test(v) }],
        ['presence_penalty', { type: 'float', validate: (v) => /^-?\d+(\.\d+)?$/.test(v) }],
        ['frequency_penalty', { type: 'float', validate: (v) => /^-?\d+(\.\d+)?$/.test(v) }],
        ['chat_template', { type: 'string', validate: (v) => typeof v === 'string' && v.length > 0 }],
    ]);
    const validInstructions = new Set(['FROM', 'PARAMETER', 'SYSTEM', 'TEMPLATE', 'MESSAGE', 'ADAPTER', 'LICENSE', 'REQUIRES']);
    for (let i = 0; i < document.lineCount; i++) {
        const currline = document.lineAt(i);
        let linetext = currline.text.replace(/#.*$/, '').trim();
        const match = linetext.match(/^\s*(PARAMETER)\b\s+([a-z_]+)\s+(".*?"|'.*?'|\S+)/);
        if (match) {
            const paramcheck = match[2];
            if (!allowedParamsMap.has(paramcheck)) {
                const startpos = currline.text.indexOf(paramcheck);
                const range = new vscode.Range(i, startpos, i, startpos + paramcheck.length);
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} is not a valid Ollama Modelfile parameter.`, vscode.DiagnosticSeverity.Error);
                diagnostic.code = {
                    value: 'Invalid Parameter',
                    target: vscode.Uri.parse('https://docs.ollama.com/modelfile#parameter')
                };
                diagnostics.push(diagnostic);
                continue;
            }
            if (!allowedParamsMap.get(match[2]).validate(match[3])) {
                const startpos = currline.text.indexOf(match[3]);
                const range = new vscode.Range(i, startpos, i, startpos + match[3].length);
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} has an invalid value. Expected type: ${allowedParamsMap.get(match[2]).type}`, vscode.DiagnosticSeverity.Error);
                diagnostic.code = {
                    value: 'Invalid Parameter Value',
                    target: vscode.Uri.parse('https://docs.ollama.com/modelfile#parameter')
                };
                diagnostics.push(diagnostic);
            }
        }
        // Check for unknown instructions
        const instructionMatch = linetext.match(/^\s*([A-Z]+)\b/);
        if (instructionMatch && !validInstructions.has(instructionMatch[1])) {
            const startpos = currline.text.indexOf(instructionMatch[1]);
            const range = new vscode.Range(i, startpos, i, startpos + instructionMatch[1].length);
            const diagnostic = new vscode.Diagnostic(range, `${instructionMatch[1]} is not a recognized Modelfile instruction.`, vscode.DiagnosticSeverity.Warning);
            diagnostic.code = {
                value: 'Unknown Instruction',
                target: vscode.Uri.parse('https://docs.ollama.com/modelfile')
            };
            diagnostics.push(diagnostic);
        }
    }
}
function checkValidInstructions(doc, diagnostics) {
    const text = doc.getText();
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/#.*$/, '').trim();
        if (!line)
            continue;
        // Check for duplicate FROM
        const fromMatch = line.match(/^FROM\b/i);
        if (fromMatch && i > 0) {
            const startpos = lines[i].indexOf('FROM');
            const range = new vscode.Range(i, startpos, i, startpos + 4);
            const diagnostic = new vscode.Diagnostic(range, 'Duplicate FROM instruction. Only one FROM is allowed per Modelfile.', vscode.DiagnosticSeverity.Warning);
            diagnostics.push(diagnostic);
        }
        // Check for empty parameter values
        const paramMatch = line.match(/^PARAMETER\s+([a-z_]+)\s+$/i);
        if (paramMatch) {
            const startpos = lines[i].indexOf(paramMatch[1]);
            const range = new vscode.Range(i, startpos, i, startpos + paramMatch[1].length);
            const diagnostic = new vscode.Diagnostic(range, `PARAMETER ${paramMatch[1]} is missing a value.`, vscode.DiagnosticSeverity.Error);
            diagnostics.push(diagnostic);
        }
    }
}
function checkMessageBlocks(doc, diagnostics) {
    const text = doc.getText();
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/#.*$/, '').trim();
        if (!line)
            continue;
        // Check MESSAGE format: MESSAGE role "content" or MESSAGE role """content"""
        const messageMatch = line.match(/^MESSAGE\s+(\w+)\s+(.*)/i);
        if (messageMatch) {
            const role = messageMatch[1].toLowerCase();
            const validRoles = ['user', 'assistant', 'system'];
            if (!validRoles.includes(role)) {
                const startpos = lines[i].indexOf(messageMatch[1]);
                const range = new vscode.Range(i, startpos, i, startpos + messageMatch[1].length);
                const diagnostic = new vscode.Diagnostic(range, `Invalid MESSAGE role "${role}". Must be one of: ${validRoles.join(', ')}.`, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            }
            // Check that content is present
            const content = messageMatch[2].trim();
            if (!content || content === '"""' || content === '"') {
                const startpos = lines[i].indexOf(messageMatch[1]);
                const range = new vscode.Range(i, startpos, i, lines[i].length);
                const diagnostic = new vscode.Diagnostic(range, 'MESSAGE is missing content.', vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            }
        }
    }
}
//# sourceMappingURL=extension.js.map