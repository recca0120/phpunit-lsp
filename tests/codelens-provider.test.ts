import { CodeLens, TextDocument } from 'vscode-languageserver';

import { CodeLensProvider } from './../src/codelens-provider';
import { Filesystem } from './../src/filesystem';
import { resolve } from 'path';
import { readFileSync } from 'fs';

describe('CodeLensProvider Test', () => {
    const path: string = resolve(__dirname, 'fixtures/PHPUnitTest.php');
    let codeLens: CodeLens[] = [];

    beforeEach(async () => {
        const codeLensProvider: CodeLensProvider = new CodeLensProvider();
        const textDocument: TextDocument = TextDocument.create(path, 'php', 0.1, readFileSync(path).toString('utf8'));
        codeLens = codeLensProvider.provideCodeLenses(textDocument);
    });

    it('it should resolve class PHPUnitTest codelens', () => {
        expect(codeLens[0]).toEqual({
            command: {
                arguments: [path],
                command: 'phpunit.test.file',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 11,
                    line: 5,
                },
                start: {
                    character: 0,
                    line: 5,
                },
            },
        });
    });

    it('it should resolve method testPassed codelens', () => {
        expect(codeLens[1]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testPassed$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 21,
                    line: 12,
                },
                start: {
                    character: 11,
                    line: 12,
                },
            },
        });
    });

    it('it should resolve method testFailed codelens', () => {
        expect(codeLens[2]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testFailed$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 21,
                    line: 17,
                },
                start: {
                    character: 11,
                    line: 17,
                },
            },
        });
    });

    it('it should resolve method testSkipped codelens', () => {
        expect(codeLens[3]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testSkipped$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 22,
                    line: 22,
                },
                start: {
                    character: 11,
                    line: 22,
                },
            },
        });
    });

    it('it should resolve method testIncomplete codelens', () => {
        expect(codeLens[4]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testIncomplete$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 25,
                    line: 27,
                },
                start: {
                    character: 11,
                    line: 27,
                },
            },
        });
    });

    it('it should resolve method testNoAssertions codelens', () => {
        expect(codeLens[5]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testNoAssertions$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 27,
                    line: 32,
                },
                start: {
                    character: 11,
                    line: 32,
                },
            },
        });
    });

    it('it should resolve method testAssertNotEquals codelens', () => {
        expect(codeLens[6]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::testAssertNotEquals$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 30,
                    line: 37,
                },
                start: {
                    character: 11,
                    line: 37,
                },
            },
        });
    });

    it('it should resolve method it_should_be_test_case codelens', () => {
        expect(codeLens[7]).toEqual({
            command: {
                arguments: [path, '--filter', '^.*::it_should_be_test_case$'],
                command: 'phpunit.test.cursor',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 33,
                    line: 46,
                },
                start: {
                    character: 11,
                    line: 46,
                },
            },
        });
    });

    it('it should resolve class PHPUnitTest2 with namespace codelens', () => {
        const path = resolve(__dirname, 'fixtures/PHPUnit2Test.php');
        const codeLensProvider: CodeLensProvider = new CodeLensProvider();
        const textDocument: TextDocument = TextDocument.create(path, 'php', 0.1, readFileSync(path).toString('utf8'));
        codeLens = codeLensProvider.provideCodeLenses(textDocument);

        expect(codeLens[0]).toEqual({
            command: {
                arguments: [path],
                command: 'phpunit.test.file',
                title: 'Run Test',
            },
            data: {
                textDocument: {
                    uri: path,
                },
            },
            range: {
                end: {
                    character: 12,
                    line: 7,
                },
                start: {
                    character: 0,
                    line: 7,
                },
            },
        });
    });
});
