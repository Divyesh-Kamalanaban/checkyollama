import * as vscode from 'vscode';

export class ModelfileHoverProvider implements vscode.HoverProvider {
    private paramDocs: Map<string, { type: string; range: string; desc: string }> = new Map([
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

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return undefined;

        const word = document.getText(wordRange).trim();
        const info = this.paramDocs.get(word);
        if (!info) return undefined;

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${word}**\n\n`);
        md.appendMarkdown(`- **Type:** \`${info.type}\`\n`);
        md.appendMarkdown(`- **Range:** ${info.range}\n\n`);
        md.appendMarkdown(info.desc);
        md.appendMarkdown(`\n\n[Ollama Docs](https://docs.ollama.com/modelfile#parameter)`);

        return new vscode.Hover(md, wordRange);
    }
}