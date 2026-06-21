import { expect } from 'chai';
import * as vscode from 'vscode'; // Import natively from VS Code API
import { ModelfileCompletionProvider } from '../completionProvider';

function createDocument(content: string): vscode.TextDocument {
    // Split lines cleanly without dropping empty elements
    const lines = content.split('\n');
    
    return {
        uri: vscode.Uri.parse('untitled:modelfile'),
        fileName: 'untitled:modelfile',
        languageId: 'modelfile',
        version: 1,
        lineCount: lines.length,
        getText: () => content,
        lineAt: (line: number) => {
            const lineText = lines[line] ?? '';
            return {
                lineNumber: line,
                text: lineText,
                isEmptyOrWhitespace: !lineText.trim(),
                firstNonWhitespaceCharacterIndex: lineText.search(/\S/) === -1 ? 0 : lineText.search(/\S/),
                range: new vscode.Range(
                    new vscode.Position(line, 0),
                    new vscode.Position(line, lineText.length)
                ),
                rangeIncludingLineBreak: new vscode.Range(
                    new vscode.Position(line, 0),
                    new vscode.Position(line + 1, 0)
                )
            } as vscode.TextLine;
        },
        offsetAt: (position: vscode.Position) => 0,
        positionAt: (offset: number) => new vscode.Position(0, 0),
        validatePosition: (p: vscode.Position) => p,
        validateRange: (r: vscode.Range) => r,
        isClosed: false,
        isDirty: false,
        isUntitled: true,
        save: () => Promise.resolve(true),
        notebook: undefined
    } as unknown as vscode.TextDocument;
}

function position(line: number, character: number): vscode.Position {
    return new vscode.Position(line, character);
}

function getItems(result: any): any[] {
    if (Array.isArray(result)) {
        return result;
    }
    // Handles if your provider returns a CompletionList instead of a flat array
    if (result && Array.isArray(result.items)) {
        return result.items;
    }
    throw new Error('Expected array or CompletionList');
}

describe('ModelfileCompletionProvider', () => {
    const provider = new ModelfileCompletionProvider();

    describe('instruction suggestions', () => {
        it('returns all instructions on empty line', () => {
            const doc = createDocument('\n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 0), undefined as any, {} as any));
            expect(items.length).to.equal(8);
            const labels = items.map((i: any) => i.label as string);
            expect(labels).to.include.members(['FROM', 'PARAMETER', 'SYSTEM', 'TEMPLATE', 'MESSAGE', 'ADAPTER', 'LICENSE', 'REQUIRES']);
        });

        it('returns all instructions on line with only spaces', () => {
            const doc = createDocument('   \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 3), undefined as any, {} as any));
            expect(items.length).to.equal(8);
        });
    });

    describe('PARAMETER completion', () => {
        it('returns all parameters after "PARAMETER "', () => {
            const doc = createDocument('PARAMETER \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 10), undefined as any, {} as any));
            expect(items.length).to.be.greaterThan(10);
            const labels = items.map((i: any) => i.label as string);
            expect(labels).to.include('temperature');
            expect(labels).to.include('num_ctx');
        });

        it('filters parameters by prefix (e.g., "PARAMETER te")', () => {
            const doc = createDocument('PARAMETER te\n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 12), undefined as any, {} as any));
            expect(items.every((i: any) => String(i.label).toLowerCase().startsWith('te'))).to.be.true;
            expect(items.some((i: any) => i.label === 'temperature')).to.be.true;
            expect(items.some((i: any) => i.label === 'top_k')).to.be.false;
        });

        it('returns 0 for unknown parameter names', () => {
            const doc = createDocument('PARAMETER unknownparam \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 23), undefined as any, {} as any));
            expect(items.length).to.equal(1);
            expect(items[0].label).to.equal('0');
        });
    });

    describe('MESSAGE completion', () => {
        it('returns all roles after "MESSAGE "', () => {
            const doc = createDocument('MESSAGE \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 8), undefined as any, {} as any));
            expect(items.length).to.equal(3);
            const labels = items.map((i: any) => i.label as string);
            expect(labels).to.include.members(['user', 'assistant', 'system']);
        });

        it('filters roles by prefix (e.g., "MESSAGE as")', () => {
            const doc = createDocument('MESSAGE as\n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 10), undefined as any, {} as any));
            expect(items.some((i: any) => i.label === 'assistant')).to.be.true;
            expect(items.some((i: any) => i.label === 'user')).to.be.false;
        });

        it('suggests triple-quote snippet after role is typed', () => {
            const doc = createDocument('MESSAGE user \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 13), undefined as any, {} as any));
            expect(items.length).to.equal(1);
            expect((items[0].insertText as any).value).to.include('"""$0"""');
            expect(items[0].kind).to.equal(vscode.CompletionItemKind.Snippet);
        });
    });

    describe('parameter value completion', () => {
        it('suggests temperature values', () => {
            const doc = createDocument('PARAMETER temperature \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 22), undefined as any, {} as any));
            expect(items.some((i: any) => i.label === '0.7')).to.be.true;
            expect(items.some((i: any) => i.label === '1.0')).to.be.true;
        });

        it('suggests num_ctx values', () => {
            const doc = createDocument('PARAMETER num_ctx \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 17), undefined as any, {} as any));
            const labels = items.map((i: any) => i.label as string);
            expect(labels).to.include('2048');
            expect(labels).to.include('4096');
        });

        it('returns generic 0 for parameters without predefined suggestions', () => {
            const doc = createDocument('PARAMETER chat_template \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 23), undefined as any, {} as any));
            expect(items.length).to.equal(1);
            expect(items[0].label).to.equal('0');
        });
    });

    describe('keyword value completion', () => {
        it('suggests model names for FROM', () => {
            const doc = createDocument('FROM \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 5), undefined as any, {} as any));
            expect(items.some((i: any) => i.label === 'llama3')).to.be.true;
            expect(items.some((i: any) => i.label === 'mistral')).to.be.true;
        });

        it('filters FROM models by prefix', () => {
            const doc = createDocument('FROM ll\n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 7), undefined as any, {} as any));
            expect(items.every((i: any) => String(i.label).toLowerCase().startsWith('ll'))).to.be.true;
        });

        it('suggests triple-quote snippet for TEMPLATE', () => {
            const doc = createDocument('TEMPLATE \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 9), undefined as any, {} as any));
            expect(items.length).to.equal(1);
            expect((items[0].insertText as any).value).to.include('"""$0"""');
        });

        it('suggests licenses for LICENSE', () => {
            const doc = createDocument('LICENSE \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 8), undefined as any, {} as any));
            expect(items.some((i: any) => i.label === 'MIT')).to.be.true;
            expect(items.some((i: any) => i.label === 'Apache-2.0')).to.be.true;
        });

        it('suggests adapters for ADAPTER', () => {
            const doc = createDocument('ADAPTER \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 8), undefined as any, {} as any));
            expect(items.some((i: any) => i.label === 'lora')).to.be.true;
        });

        it('shows placeholder for empty REQUIRES', () => {
            const doc = createDocument('REQUIRES \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 8), undefined as any, {} as any));
            expect(items.length).to.equal(1);
            expect(items[0].label).to.equal('>= 0.14.0');
        });

        it('returns empty for partial REQUIRES input', () => {
            const doc = createDocument('REQUIRES >= \n');
            const items = getItems(provider.provideCompletionItems(doc, position(0, 12), undefined as any, {} as any));
            expect(items.length).to.equal(0);
        });
    });
});