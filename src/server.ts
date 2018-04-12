/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
    CodeLens,
    CodeLensParams,
    IConnection,
    InitializeResult,
    TextDocuments,
    createConnection,
    ExecuteCommandParams,
    DocumentSymbolParams,
    SymbolInformation,
    DidChangeConfigurationParams,
    ProposedFeatures,
} from 'vscode-languageserver';
import { CodeLensProvider, DocumentSymbolProvider } from './providers';
import { Runner } from './runner';

const runner: Runner = new Runner;
const documentSymbolProvider: DocumentSymbolProvider = new DocumentSymbolProvider();
const codeLensProvider: CodeLensProvider = new CodeLensProvider(runner);

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection: IConnection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
// connection.onInitialize((params: InitializeParams): InitializeResult => {
connection.onInitialize((): InitializeResult => {
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            // Tell the client that the server support code complete
            // completionProvider: {
            //     resolveProvider: true,
            // },
            codeLensProvider: {
                resolveProvider: true,
            },
            documentSymbolProvider: false,
            executeCommandProvider: {
                commands: ['phpunit.test.file', 'phpunit.test.method'],
            },
        },
    };
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
// documents.onDidChangeContent(change => {
//     validateTextDocument(change.document);
// });

// The settings interface describe the server relevant settings part
interface Settings {
    phpunit: PhpUnitSettings;
}

// These are the example settings we defined in the client's package.json
// file
interface PhpUnitSettings {
    execPath: string;
    args: string[];
}

// hold the maxNumberOfProblems setting
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
    const settings = <Settings>change.settings;
    runner.setBinary(settings.phpunit.execPath).setDefault(settings.phpunit.args);
});

connection.onDidChangeWatchedFiles(() => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
// connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
//     // The pass parameter contains the position of the text document in
//     // which code complete got requested. For the example we ignore this
//     // info and always provide the same completion items.
//     return [
//         {
//             label: 'TypeScript',
//             kind: CompletionItemKind.Text,
//             data: 1,
//         },
//         {
//             label: 'JavaScript',
//             kind: CompletionItemKind.Text,
//             data: 2,
//         },
//     ];
// });

// This handler resolve additional information for the item selected in
// the completion list.
// connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
//     if (item.data === 1) {
//         (item.detail = 'TypeScript details'), (item.documentation = 'TypeScript documentation');
//     } else if (item.data === 2) {
//         (item.detail = 'JavaScript details'), (item.documentation = 'JavaScript documentation');
//     }

//     return item;
// });

connection.onCodeLens((params: CodeLensParams): CodeLens[] => {
    return codeLensProvider.provideCodeLenses(documents.get(params.textDocument.uri));
});
connection.onCodeLensResolve(codeLensProvider.resolveCodeLens.bind(codeLensProvider));

connection.onExecuteCommand(async (params: ExecuteCommandParams) => {
    switch (params.command) {
        case 'phpunit.test.file':
        case 'phpunit.test.method':
            const args = params.arguments || [];
            const uri = args[0] || '';
            const output = await runner.run(uri, args.slice(1));
            connection.console.log(output);
            runner.sendDiagnostics(connection).sendNotification(connection, uri);

            break;
    }
});

connection.onRequest('assertions', params => {
    runner.sendNotification(connection, params.uri);
});

connection.onDocumentSymbol((params: DocumentSymbolParams): SymbolInformation[] => {
    return documentSymbolProvider.provideDocumentSymbols(documents.get(params.textDocument.uri));
});

// connection.onDidSaveTextDocument(async params => {
//     const uri: string = params.textDocument.uri;
//     await phpUnit.run(uri);
//     phpUnit.sendDiagnostics(connection).sendNotification(connection, uri);
//     connection.console.log(phpUnit.getOutput());
// });

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();
