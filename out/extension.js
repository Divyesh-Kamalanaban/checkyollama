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
    // This console.log will show up in the "Extension Development Host" debug console
    console.log('Ollama Modelfile support is now active.');
    // Create the "bucket" for our syntax errors
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('modelfile');
    // Register the logic to run whenever a document is opened or changed
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => validateModelfile(doc, diagnosticCollection)), vscode.workspace.onDidChangeTextDocument(event => validateModelfile(event.document, diagnosticCollection)), diagnosticCollection);
}
function deactivate() { }
function validateModelfile(doc, collection) {
    if (doc.languageId !== 'modelfile')
        return;
    const diagnostics = [];
    checkRequiredFrom(doc, diagnostics);
    checkValidParams(doc, diagnostics);
    // Apply the errors to the UI
    collection.set(doc.uri, diagnostics);
}
// Checking whether FROM is there or not
function checkRequiredFrom(doc, diagnostics) {
    const text = doc.getText();
    // Regex: Start of line, optional whitespace, 'FROM' (case insensitive), word boundary
    const fromRegex = /^\s*FROM\b/im;
    if (!fromRegex.test(text)) {
        // Create an error on the first line
        const firstLine = doc.lineAt(0);
        const range = firstLine.range;
        const diagnostic = new vscode.Diagnostic(range, "A Modelfile must begin with a 'FROM' instruction (e.g., FROM llama3).", vscode.DiagnosticSeverity.Error);
        diagnostics.push(diagnostic);
    }
}
function checkValidParams(document, diagnostics) {
    //defining parameter values
    const allowedparams = ['num_ctx', 'min_p', 'repeat_last_n', 'repeat_penalty', 'temperature', 'seed', 'stop', 'num_predict', 'top_k', 'top_p'];
    //let's use a for loop to loop over the lines of text document and find the lines where PARAMETER is used!
    //then we have to check whether the second group contains the allowedparams
    for (let i = 0; i < document.lineCount; i++) {
        let currline = document.lineAt(i);
        let linetext = currline.text;
        const match = currline.text.match(/^\s*(PARAMETER)\b\s([a-z_]+)\s(.*)$/);
        //adding type safety
        if (match) {
            const paramcheck = match[2];
            if (!allowedparams.includes(paramcheck)) {
                //defining startpos for range value for diagnostics.
                const startpos = linetext.indexOf(paramcheck);
                //range needs 4 parameters: starting line no, start position in that line, ending line number, ending postion in that line. end line number is calculated by startposition + the length of the word.
                const range = new vscode.Range(i, startpos, i, startpos + paramcheck.length);
                //now lets define a diagnostic
                const diagnostic = new vscode.Diagnostic(range, `${paramcheck} is not a valid Ollama Modelfile parameter. Check valid parameters at https://docs.ollama.com/modelfile#parameter`, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            }
        }
    }
}
//# sourceMappingURL=extension.js.map