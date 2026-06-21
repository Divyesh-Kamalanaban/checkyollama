import { expect } from 'chai';
import * as vscode from 'vscode'; // Native import
import { ModelfileHoverProvider } from '../hoverProvider';

function createDocument(content: string): vscode.TextDocument {
    const lines = content.split('\n');
    return {
        uri: vscode.Uri.parse('untitled:modelfile'),
        fileName: 'untitled:modelfile',
        languageId: 'modelfile',
        version: 1,
        lineCount: lines.length,
        getText: (range?: vscode.Range) => {
            if (range) {
                // If your extension asks for specific text within a range
                const lineText = lines[range.start.line] || '';
                return lineText.substring(range.start.character, range.end.character);
            }
            return content;
        },
        lineAt: (line: number) => {
            const lineText = lines[line] ?? '';
            return {
                lineNumber: line,
                text: lineText,
                isEmptyOrWhitespace: !lineText.trim(),
            } as vscode.TextLine;
        },
        // ✨ FIXED: This now respects the cursor position instead of returning the first word
        getWordRangeAtPosition: (pos: vscode.Position) => {
            const lineText = lines[pos.line] || '';
            
            // Match standalone words globally on the line
            const regex = /[a-zA-Z_]\w*/g;
            let match;
            
            while ((match = regex.exec(lineText)) !== null) {
                const start = match.index;
                const end = start + match[0].length;
                
                // Verify if the cursor position drops directly inside this specific word's boundaries
                if (pos.character >= start && pos.character <= end) {
                    return new vscode.Range(
                        new vscode.Position(pos.line, start),
                        new vscode.Position(pos.line, end)
                    );
                }
            }
            return undefined;
        }
    } as unknown as vscode.TextDocument;
}

function position(line: number, character: number): vscode.Position {
    return new vscode.Position(line, character);
}

describe('ModelfileHoverProvider', () => {
    const provider = new ModelfileHoverProvider();

    it('returns markdown hover for known parameter', () => {
        const doc = createDocument('PARAMETER temperature 0.7');
        // Position 12 points precisely to the middle of "temperature"
        const hover = provider.provideHover(doc, position(0, 12), new vscode.CancellationTokenSource().token) as vscode.Hover;
        
        expect(hover).to.not.be.undefined;
        expect(hover).to.not.be.null;

        // Extract markdown string value safely from VS Code Hover shape
        const mdString = (hover.contents[0] as vscode.MarkdownString).value;
        expect(mdString).to.include('**temperature**');
        expect(mdString).to.include('Controls randomness');
    });

    it('includes Ollama docs link in hover', () => {
        const doc = createDocument('PARAMETER num_ctx 4096');
        // Position 11 points precisely to the middle of "num_ctx"
        const hover = provider.provideHover(doc, position(0, 11), new vscode.CancellationTokenSource().token) as vscode.Hover;
        
        expect(hover).to.not.be.undefined;
        expect(hover).to.not.be.null;

        const mdString = (hover.contents[0] as vscode.MarkdownString).value;
        expect(mdString).to.include('docs.ollama.com/modelfile#parameter');
    });

    it('returns undefined for unknown word', () => {
        const doc = createDocument('FROM llama3');
        const hover = provider.provideHover(doc, position(0, 5), new vscode.CancellationTokenSource().token);
        expect(hover).to.be.undefined;
    });

    it('handles empty document gracefully', () => {
        const doc = createDocument('\n');
        const hover = provider.provideHover(doc, position(0, 0), new vscode.CancellationTokenSource().token);
        expect(hover).to.be.undefined;
    });
});