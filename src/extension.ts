import * as vscode from 'vscode';
import { ModelfileCompletionProvider } from './completionProvider';
import { ModelfileHoverProvider } from './hoverProvider';
import {
    validateModelfile,
    checkRequiredFrom,
    checkValidParams,
    checkValidInstructions,
    checkMessageBlocks
} from './validation';

export function activate(context: vscode.ExtensionContext) {
    console.log('Ollama Modelfile support is now active.');

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('modelfile');

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'modelfile', scheme: 'file' },
        new ModelfileCompletionProvider(),
        ' ', '\n', '\t'
    );

    const hoverProvider = vscode.languages.registerHoverProvider(
        { language: 'modelfile', scheme: 'file' },
        new ModelfileHoverProvider()
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => validateModelfile(doc, diagnosticCollection)),
        vscode.workspace.onDidChangeTextDocument(event => validateModelfile(event.document, diagnosticCollection)),
        diagnosticCollection,
        completionProvider,
        hoverProvider
    );
}

export function deactivate() { }

export { validateModelfile, checkRequiredFrom, checkValidParams, checkValidInstructions, checkMessageBlocks };