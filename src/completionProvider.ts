import * as vscode from 'vscode';

export class ModelfileCompletionProvider implements vscode.CompletionItemProvider {
    private instructions: vscode.CompletionItem[] = [
        new vscode.CompletionItem('FROM', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('PARAMETER', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('SYSTEM', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('TEMPLATE', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('MESSAGE', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('ADAPTER', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('LICENSE', vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem('REQUIRES', vscode.CompletionItemKind.Keyword),
    ];

    private fromModelSuggestions: vscode.CompletionItem[] = [
        new vscode.CompletionItem('llama3', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('llama3:8b', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('llama3:70b', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('mistral', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('codellama', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('gemma:2b', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('gemma:7b', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('mixtral:8x7b', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('phi3', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('qwen2:7b', vscode.CompletionItemKind.Value),
    ];

    private licenseSuggestions: vscode.CompletionItem[] = [
        new vscode.CompletionItem('MIT', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('Apache-2.0', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('GPL-3.0', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('BSD-3-Clause', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('CC-BY-4.0', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('LGPL-3.0', vscode.CompletionItemKind.Value),
    ];

    private adapterSuggestions: vscode.CompletionItem[] = [
        new vscode.CompletionItem('llama-adapter', vscode.CompletionItemKind.Value),
        new vscode.CompletionItem('lora', vscode.CompletionItemKind.Value),
    ];

    private parameters: vscode.CompletionItem[] = [
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

    private messageRoles: vscode.CompletionItem[] = [
        new vscode.CompletionItem('user', vscode.CompletionItemKind.Enum),
        new vscode.CompletionItem('assistant', vscode.CompletionItemKind.Enum),
        new vscode.CompletionItem('system', vscode.CompletionItemKind.Enum),
    ];

    private paramValueSuggestions: Map<string, vscode.CompletionItem[]> = new Map([
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
            new vscode.CompletionItem("\"\\n\"", vscode.CompletionItemKind.Value),
            new vscode.CompletionItem("\"\\n\\n\"", vscode.CompletionItemKind.Value),
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

    private createParamItem(label: string, type: string, range: string, detail: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Variable);
        item.detail = `${type} — ${range}`;
        item.documentation = new vscode.MarkdownString(detail);
        return item;
    }

    provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            context: vscode.CompletionContext
        ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const lineText = document.lineAt(position.line).text;
        const lineUpToCursor = lineText.substring(0, position.character);

        const exactParamMatch = lineUpToCursor.match(/^\s*PARAMETER\s+([a-z_0-9]+)\s*$/i);
        if (exactParamMatch) {
            const paramName = exactParamMatch[1].toLowerCase();
            const isRealParam = this.parameters.some(p => String(p.label).toLowerCase() === paramName);
            if (isRealParam) {
                const suggestions = this.paramValueSuggestions.get(paramName);
                if (suggestions) {
                    return suggestions;
                }
                return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Value)];
            }
        }

        const paramPrefixMatch = lineUpToCursor.match(/^\s*PARAMETER\s+(\w*)$/i);
        if (paramPrefixMatch) {
            const prefix = paramPrefixMatch[1].toLowerCase();
            if (prefix.length === 0) { return this.parameters; }
            return this.parameters.filter(item => String(item.label).toLowerCase().startsWith(prefix));
        }

        const rolePrefixMatch = lineUpToCursor.match(/^\s*MESSAGE\s+(\w*)$/i);
        if (rolePrefixMatch) {
            const prefix = rolePrefixMatch[1].toLowerCase();
            if (prefix.length === 0) { return this.messageRoles; }
            return this.messageRoles.filter(item => String(item.label).toLowerCase().startsWith(prefix));
        }

        if (/^\s*MESSAGE\s+(user|assistant|system)\s+$/i.test(lineUpToCursor)) {
            const item = new vscode.CompletionItem('"""..."\"', vscode.CompletionItemKind.Snippet);
            item.insertText = new vscode.SnippetString('"""$0"""');
            item.detail = 'Triple-quoted string';
            return [item];
        }

        const paramValueMatch = lineUpToCursor.match(/^\s*PARAMETER\s+([a-z_0-9]+)\s+$/i);
        if (paramValueMatch) {
            const paramName = paramValueMatch[1].toLowerCase();
            const suggestions = this.paramValueSuggestions.get(paramName);
            if (suggestions) return suggestions;
            return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Value)];
        }

        if (/^\s*FROM\s*$/i.test(lineUpToCursor.trim())) { return this.fromModelSuggestions; }
        const fromKeywordMatch = lineUpToCursor.match(/^\s*FROM\s+(.+)$/i);
        if (fromKeywordMatch) {
            return this.fromModelSuggestions.filter(item => String(item.label).toLowerCase().startsWith(fromKeywordMatch[1].toLowerCase()));
        }

        if (/^\s*TEMPLATE\s+$/i.test(lineUpToCursor)) {
            const item = new vscode.CompletionItem('"""..."\"', vscode.CompletionItemKind.Snippet);
            item.insertText = new vscode.SnippetString('"""$0"""');
            return [item];
        }

        if (/^\s*LICENSE\s*$/i.test(lineUpToCursor.trim())) { return this.licenseSuggestions; }
        const licenseKeywordMatch = lineUpToCursor.match(/^\s*LICENSE\s+(.+)$/i);
        if (licenseKeywordMatch) {
            return this.licenseSuggestions.filter(item => String(item.label).toLowerCase().startsWith(licenseKeywordMatch[1].toLowerCase()));
        }

        if (/^\s*ADAPTER\s*$/i.test(lineUpToCursor.trim())) { return this.adapterSuggestions; }
        const adapterKeywordMatch = lineUpToCursor.match(/^\s*ADAPTER\s+(.+)$/i);
        if (adapterKeywordMatch) {
            return this.adapterSuggestions.filter(item => String(item.label).toLowerCase().startsWith(adapterKeywordMatch[1].toLowerCase()));
        }

        if (/^\s*REQUIRES\s*$/i.test(lineUpToCursor.trim()) || (/^\s*REQUIRES\s+/i.test(lineUpToCursor) && lineUpToCursor.replace(/^\s*REQUIRES\s+/i, '').trim().length === 0)) {
            return [new vscode.CompletionItem('>= 0.14.0', vscode.CompletionItemKind.Value)];
        } else if (/^\s*REQUIRES\s+/i.test(lineUpToCursor)) {
            return [];
        }

        if (/^\s*$/.test(lineUpToCursor)) {
            return this.instructions;
        }

        return [];
    }
}