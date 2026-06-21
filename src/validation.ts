import * as vscode from 'vscode';

export function validateModelfile(doc: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
    if (doc.languageId !== 'modelfile') return;

    const diagnostics: vscode.Diagnostic[] = [];
    checkRequiredFrom(doc, diagnostics);
    checkValidParams(doc, diagnostics);
    checkValidInstructions(doc, diagnostics);
    checkMessageBlocks(doc, diagnostics);

    collection.set(doc.uri, diagnostics);
}

export function checkRequiredFrom(doc: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
    const text = doc.getText();

    if (!/\bFROM\b/i.test(text)) {
        const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 4));

        const diagnostic = new vscode.Diagnostic(
            range,
            "Missing required instruction 'FROM'",
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.code = { value: 'Missing FROM', target: vscode.Uri.parse('https://docs.ollama.com') };
        diagnostics.push(diagnostic);
    }
}

export function checkValidParams(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
    const allowedParamsMap = new Map<string, { type: string; validate?: (val: string) => boolean }>([
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
        if (!linetext) continue;

        const match = linetext.match(/^\s*(PARAMETER)\s+([a-z_0-9]+)\s+(\S+)/i);

        if (match) {
            const paramcheck = match[2].toLowerCase();

            if (!allowedParamsMap.has(paramcheck)) {
                const startpos = currline.text.toLowerCase().indexOf(paramcheck);
                const range = new vscode.Range(i, startpos, i, startpos + paramcheck.length);
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} is not a valid parameter.`, vscode.DiagnosticSeverity.Error);
                diagnostic.code = { value: 'Invalid Parameter', target: vscode.Uri.parse('https://docs.ollama.com') };
                diagnostics.push(diagnostic);
                continue;
            }

            if (!allowedParamsMap.get(paramcheck)!.validate!(match[3])) {
                const startpos = currline.text.indexOf(match[3]);
                const range = new vscode.Range(i, startpos, i, startpos + match[3].length);
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} has an invalid value.`, vscode.DiagnosticSeverity.Error);
                diagnostic.code = { value: 'Invalid Parameter Value', target: vscode.Uri.parse('https://docs.ollama.com') };
                diagnostics.push(diagnostic);
            }
        }

        const instructionMatch = currline.text.trim().match(/^([A-Za-z_]+)\b/);
        if (instructionMatch) {
            const upperKeyword = instructionMatch[1].toUpperCase();
            if (!validInstructions.has(upperKeyword)) {
                const startpos = currline.text.indexOf(instructionMatch[1]);
                const range = new vscode.Range(i, startpos, i, startpos + instructionMatch[1].length);
                const diagnostic = new vscode.Diagnostic(range, `${instructionMatch[1]} is not a recognized Modelfile instruction.`, vscode.DiagnosticSeverity.Warning);
                diagnostic.code = { value: 'Unknown Instruction', target: vscode.Uri.parse('https://docs.ollama.com') };
                diagnostics.push(diagnostic);
            }
        }
    }
}

export function checkValidInstructions(doc: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
    let fromCount = 0;

    for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i);
        const text = line.text.replace(/#.*$/, '').trim();
        if (!text) continue;

        if (/^FROM\b/i.test(text)) {
            fromCount++;
            if (fromCount > 1) {
                const startpos = line.text.toUpperCase().indexOf('FROM');
                const range = new vscode.Range(i, startpos, i, startpos + 4);
                diagnostics.push(new vscode.Diagnostic(range, 'Duplicate FROM instruction.', vscode.DiagnosticSeverity.Warning));
            }
        }

        const paramMatch = text.match(/^PARAMETER\s+([a-z_0-9]+)\s*$/i);
        if (paramMatch) {
            const startpos = line.text.toLowerCase().indexOf(paramMatch[1].toLowerCase());
            const range = new vscode.Range(i, startpos, i, startpos + paramMatch[1].length);
            diagnostics.push(new vscode.Diagnostic(range, `PARAMETER ${paramMatch[1]} is missing a value.`, vscode.DiagnosticSeverity.Error));
        }
    }
}

export function checkMessageBlocks(doc: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
    for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i);
        const text = line.text.replace(/#.*$/, '').trim();
        if (!text) continue;

        if (/^MESSAGE\b/i.test(text)) {
            const parts = text.split(/\s+/);
            const role = parts[1] ? parts[1].toLowerCase() : '';
            const validRoles = ['user', 'assistant', 'system'];

            if (!role || !validRoles.includes(role)) {
                const startpos = line.text.indexOf(parts[1] || 'MESSAGE');
                const range = new vscode.Range(i, startpos, i, startpos + (parts[1] ? parts[1].length : 7));
                diagnostics.push(new vscode.Diagnostic(range, `Invalid MESSAGE role.`, vscode.DiagnosticSeverity.Error));
                continue;
            }

            const contentParts = text.substring(text.indexOf(parts[1]) + parts[1].length).trim();
            if (!contentParts || contentParts === '"""' || contentParts === '"') {
                const startpos = line.text.indexOf(parts[1]);
                const range = new vscode.Range(i, startpos, i, line.text.length);
                diagnostics.push(new vscode.Diagnostic(range, 'MESSAGE is missing content.', vscode.DiagnosticSeverity.Error));
            }
        }
    }
}