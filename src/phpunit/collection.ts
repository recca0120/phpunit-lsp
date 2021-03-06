import { Assertion, Detail, Test, TestNode, Type } from './common';
import { Diagnostic, DiagnosticRelatedInformation, DiagnosticSeverity } from 'vscode-languageserver-types';
import { Filesystem, FilesystemContract } from '../filesystem';
import { groupBy, tap } from '../helpers';

export class Collection {
    private errorTypes: Type[] = [Type.ERROR, Type.FAILED, Type.FAILURE, Type.RISKY];
    private items: Map<string, Test[]> = new Map<string, Test[]>();

    constructor(private files: FilesystemContract = new Filesystem()) {}

    put(tests: Test[]): Collection {
        const groups: Map<string, Test[]> = groupBy(tests, 'uri');

        for (const key of groups.keys()) {
            this.items.set(key, this.merge(this.items.get(key) || [], groups.get(key) || []));
        }

        return this;
    }

    get(uri: string): Test[] {
        return this.items.get(this.files.uri(uri)) || [];
    }

    map(callback: Function): any[] {
        const items: any[] = [];

        this.forEach((tests: Test[], uri: string) => {
            items.push(callback(tests, uri));
        });

        return items;
    }

    forEach(callback: Function): Collection {
        this.items.forEach((tests: Test[], uri: string) => {
            callback(tests, uri);
        });

        return this;
    }

    all(): Map<string, Test[]> {
        return this.items;
    }

    getTestNodes(uri: string): TestNode[] {
        return (this.getAssertions().get(uri) || []).map((assertion: Assertion) => {
            return Object.assign({}, this.cloneTest(assertion.related), {
                range: assertion.range,
            });
        });
    }

    getDiagnoics(): Map<string, Diagnostic[]> {
        return tap(new Map<string, Diagnostic[]>(), (map: Map<string, Diagnostic[]>) => {
            this.forEach((tests: Test[], uri: string) => {
                map.set(
                    uri,
                    tests.filter(this.filterByType.bind(this)).map((test: Test) => this.transformToDiagonstic(test))
                );
            });
        });
    }

    getAssertions(keepDetails: boolean = false): Map<string, Assertion[]> {
        const assertions: Assertion[] = [];
        this.forEach((tests: Test[]) => {
            tests.forEach((test: Test) => {
                const details: Detail[] = (test.fault && test.fault.details) || [];
                const related: Test = this.cloneTest(test, keepDetails);

                assertions.push({
                    uri: test.uri,
                    range: test.range,
                    related: related,
                });

                details.forEach((detail: Detail) => {
                    assertions.push({
                        uri: detail.uri,
                        range: detail.range,
                        related: related,
                    });
                });
            });
        });

        return groupBy(assertions, 'uri');
    }

    private transformToDiagonstic(test: Test): Diagnostic {
        return {
            severity: test.type === Type.RISKY ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error,
            range: test.range,
            message: test.fault ? test.fault.message : '',
            relatedInformation: this.transformToRelatedInformation(test),
            source: 'PHPUnit',
        };
    }

    private transformToRelatedInformation(test: Test): DiagnosticRelatedInformation[] {
        if (!test.fault || !test.fault.details) {
            return [];
        }
        const message: string = test.fault.message;
        const details = test.fault && test.fault.details ? test.fault.details : [];

        return details.map((detail: Detail) => {
            return {
                location: detail,
                message: message,
            };
        });
    }

    private filterByType(test: Test): boolean {
        return this.errorTypes.indexOf(test.type) !== -1;
    }

    private merge(oldTests: Test[], newTests: Test[]): Test[] {
        const merged: Test[] = oldTests
            .filter((oldTest: Test) => {
                for (const newTest of newTests) {
                    if (oldTest.uri === newTest.uri && oldTest.name === newTest.name) {
                        return false;
                    }
                }

                return true;
            })
            .concat(newTests);

        merged.sort((a: Test, b: Test) => {
            return a.range.start.line > b.range.start.line ? 1 : -1;
        });

        return merged;
    }

    private cloneTest(test: Test, keepDetails: boolean = false): Test {
        return tap(
            {
                name: test.name,
                class: test.class,
                classname: test.classname,
                uri: test.uri,
                range: test.range,
                time: test.time,
                type: test.type,
            },
            (related: Test) => {
                if (!test.fault) {
                    return;
                }

                related.fault = {
                    type: test.fault.type,
                    message: test.fault.message,
                };

                if (keepDetails === true) {
                    related.fault.details = test.fault.details;
                }
            }
        );
    }
}
