import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // This console.log will show up in the "Extension Development Host" debug console
    console.log('Ollama Modelfile support is now active.');

    // Create the "bucket" for our syntax errors
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('modelfile');
    
    // Register the logic to run whenever a document is opened or changed
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => validateModelfile(doc, diagnosticCollection)),
        vscode.workspace.onDidChangeTextDocument(event => validateModelfile(event.document, diagnosticCollection)),
        diagnosticCollection
    );
}

export function deactivate() {}

function validateModelfile(doc: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
    if (doc.languageId !== 'modelfile') return;

    const diagnostics: vscode.Diagnostic[] = [];
    checkRequiredFrom(doc, diagnostics);
    checkValidParams(doc, diagnostics);

    // Apply the errors to the UI
    collection.set(doc.uri, diagnostics);
}
// Checking whether FROM is there or not
function checkRequiredFrom(doc: vscode.TextDocument, diagnostics: vscode.Diagnostic[]){
    const text = doc.getText();

    // Regex: Start of line, optional whitespace, 'FROM' (case insensitive), word boundary
    const fromRegex = /^\s*FROM\b/im;
    
    if (!fromRegex.test(text)) {
        // Create an error on the first line
        const firstLine = doc.lineAt(0);
        const range = firstLine.range;
        const diagnostic = new vscode.Diagnostic(
            range,
            "A Modelfile must begin with a 'FROM' instruction (e.g., FROM llama3).",
            vscode.DiagnosticSeverity.Error
        );

        diagnostics.push(diagnostic);
    }
}

function checkValidParams(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]){
    //defining parameter values
    const allowedparams = ['num_ctx','min_p','repeat_last_n','repeat_penalty','temperature','seed','stop','num_predict','top_k','top_p']

    const allowedParamsMap = new Map<string, { type: string; validate?: (val: string) => boolean }>([

    // 0.0 – 2.0 (or higher in some runtimes; safe cap at 2.0)
    ['temperature', { type: 'float',  validate: (v) => /^(\d+(\.\d+)?)$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 2 }],

    // Positive integer, typically 2048–131072 depending on model
    ['num_ctx', { type: 'int',    validate: (v) => /^\d+$/.test(v) && parseInt(v) > 0 }],

    // 0.0 – 1.0 (probability floor, disables tokens below this prob)
    ['min_p', { type: 'float',  validate: (v) => /^(0(\.\d+)?|1(\.0+)?)$/.test(v) }],

    // -1 (disabled) or any positive integer
    ['repeat_last_n', { type: 'int',    validate: (v) => /^(-1|\d+)$/.test(v) }],

    // >= 1.0; values below 1.0 increase repetition, 1.0 = neutral, typical max ~2.0
    ['repeat_penalty', { type: 'float',  validate: (v) => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 1.0 }],

    // Any integer including negative (negative = random seed)
    ['seed', { type: 'int',    validate: (v) => /^-?\d+$/.test(v) }],

    // Any non-empty string (stop token), no specific numeric bounds
    ['stop', { type: 'string', validate: (v) => typeof v === 'string' && v.length > 0 }],

    // -1 (infinite) or any positive integer (max tokens to generate)
    ['num_predict', { type: 'int',    validate: (v) => /^(-1|\d+)$/.test(v) }],

    // Non-negative integer; 0 = disabled (no top-k filtering), typical range 1–100
    ['top_k', { type: 'int',    validate: (v) => /^\d+$/.test(v) }],

    // 0.0 – 1.0 (nucleus sampling threshold)
    ['top_p', { type: 'float',  validate: (v) => /^(0(\.\d+)?|1(\.0+)?)$/.test(v) }],
    ])
    //let's use a for loop to loop over the lines of text document and find the lines where PARAMETER is used!
    //then we have to check whether the second group contains the allowedparams
    for (let i=0;i<document.lineCount;i++){
        let currline = document.lineAt(i);
        //Stripping all comments using regex
        let linetext = currline.text.replace(/#.*$/, '').trim()
        //it is a greedy approach (aka matches everything - .*) but comments are stripped so its all chill
        const match = linetext.match(/^\s*(PARAMETER)\b\s+([a-z_]+)\s+(".*?"|'.*?'|\S+)/);

        //adding type safety and guardrails.
        if (match){
            const paramcheck = match[2];

        
            if (!allowedParamsMap.has(paramcheck)){
                console.log('Invalid Parameter found')
                //defining startpos for range value for diagnostics.
                const startpos = currline.text.indexOf(paramcheck);
                //range needs 4 parameters: starting line no, start position in that line, ending line number, ending postion in that line. end line number is calculated by startposition + the length of the word.
                const range = new vscode.Range(i,startpos,i,startpos+paramcheck.length)
                //now lets define a diagnostic
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} is not a valid Ollama Modelfile parameter.`, vscode.DiagnosticSeverity.Error)
                //you cannot embed link directly in diagnostic content so add it into .code!
                diagnostic.code = {
                    value: 'Invalid Parameter',
                    target: vscode.Uri.parse('https://docs.ollama.com/modelfile#parameter')
                };
                diagnostics.push(diagnostic);
                //This continue is needed because it allows the below condition to get executed, aka the get() can get the match[2]... also the diagnostic does get pushed but the crash due to ! doesn't let the editor display it!
                continue;
            }
            // ! means non nulling assertion- telling typecript that this is 100% not null!
            if (!allowedParamsMap.get(match[2])!.validate!(match[3])){
                 //defining startpos for range value for diagnostics.
                const startpos = currline.text.indexOf(match[3]);
                //range needs 4 parameters: starting line no, start position in that line, ending line number, ending postion in that line. end line number is calculated by startposition + the length of the word.
                const range = new vscode.Range(i,startpos,i,startpos+match[3].length)
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} has an invalid value. It must be of the expected type`, vscode.DiagnosticSeverity.Error)
                diagnostic.code = {
                    value: 'Invalid Parameter Type',
                    target: vscode.Uri.parse('https://docs.ollama.com/modelfile#parameter')
                };
                diagnostics.push(diagnostic);
            }

        
    
    }
}
}