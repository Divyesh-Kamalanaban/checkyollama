import { expect } from 'chai';
import { checkRequiredFrom, checkValidParams, checkValidInstructions, checkMessageBlocks } from '../validation';

declare const vscode: any;

function createDocument(content: string): any {
    return {
        uri: 'untitled:modelfile',
        languageId: 'modelfile',
        getText: () => content,
        lineCount: content.split('\n').length,
        lineAt: (i: number) => ({ text: content.split('\n')[i] || '', range: {} }),
    };
}

function countDiagnostics(diagnostics: any[], code?: string): number {
    if (!code) return diagnostics.length;
    return diagnostics.filter((d: any) => d.code && d.code.value === code).length;
}

describe('Diagnostics', () => {
    describe('checkRequiredFrom', () => {
        it('reports error when FROM is missing', () => {
            const doc = createDocument('PARAMETER temperature 0.7');
            const diags: any[] = [];
            checkRequiredFrom(doc, diags);
            expect(countDiagnostics(diags, 'Missing FROM')).to.equal(1);
        });

        it('no error when FROM is present', () => {
            const doc = createDocument('FROM llama3');
            const diags: any[] = [];
            checkRequiredFrom(doc, diags);
            expect(countDiagnostics(diags, 'Missing FROM')).to.equal(0);
        });
    });

    describe('checkValidParams', () => {
        it('reports error for unknown parameter', () => {
            const doc = createDocument('FROM llama3\nPARAMETER unknowntest 42');
            const diags: any[] = [];
            checkValidParams(doc, diags);
            expect(countDiagnostics(diags, 'Invalid Parameter')).to.equal(1);
        });

        it('reports error for invalid parameter value', () => {
            const doc = createDocument('FROM llama3\nPARAMETER temperature 3.5');
            const diags: any[] = [];
            checkValidParams(doc, diags);
            expect(countDiagnostics(diags, 'Invalid Parameter Value')).to.equal(1);
        });

        it('passes for valid param', () => {
            const doc = createDocument('FROM llama3\nPARAMETER temperature 0.7');
            const diags: any[] = [];
            checkValidParams(doc, diags);
            expect(countDiagnostics(diags, 'Invalid Parameter Value')).to.equal(0);
        });

        it('flags unknown instruction keyword', () => {
            const doc = createDocument('FROM llama3\nHELLO world');
            const diags: any[] = [];
            checkValidParams(doc, diags);
            expect(countDiagnostics(diags, 'Unknown Instruction')).to.equal(1);
        });
    });

    describe('checkValidInstructions', () => {
        it('flags duplicate FROM as warning', () => {
            const doc = createDocument('FROM llama3\nFROM mistral');
            const diags: any[] = [];
            checkValidInstructions(doc, diags);
            expect(diags.length).to.be.greaterThan(0);
            const fromWarnings = diags.filter((d: any) => d.message.includes('Duplicate FROM'));
            expect(fromWarnings.length).to.equal(1);
        });

        it('reports error when PARAMETER has no value', () => {
            const doc = createDocument('FROM llama3\nPARAMETER temperature ');
            const diags: any[] = [];
            checkValidInstructions(doc, diags);
            expect(diags.some((d: any) => d.message.includes('missing a value'))).to.be.true;
        });
    });

    describe('checkMessageBlocks', () => {
        it('reports error for invalid MESSAGE role', () => {
            const doc = createDocument('FROM llama3\nMESSAGE invalidrole hello');
            const diags: any[] = [];
            checkMessageBlocks(doc, diags);
            expect(diags.length).to.equal(1);
            expect(diags[0].message).to.include('Invalid MESSAGE role');
        });

        it('reports error when MESSAGE has no content', () => {
            const doc = createDocument('FROM llama3\nMESSAGE user ');
            const diags: any[] = [];
            checkMessageBlocks(doc, diags);
            expect(diags.length).to.equal(1);
            expect(diags[0].message).to.include('missing content');
        });

        it('passes for valid MESSAGE', () => {
            const doc = createDocument('FROM llama3\nMESSAGE user Hello there');
            const diags: any[] = [];
            checkMessageBlocks(doc, diags);
            expect(countDiagnostics(diags)).to.equal(0);
        });

        it('flags unknown instruction in message block', () => {
            const doc = createDocument('FROM llama3\nUNKNOWNFOO bar');
            const diags: any[] = [];
            checkValidParams(doc, diags);
            expect(countDiagnostics(diags, 'Unknown Instruction')).to.equal(1);
        });
    });
});