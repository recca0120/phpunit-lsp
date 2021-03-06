export interface FilesystemContract {
    exists(path: string): Promise<boolean>;
    get(path: string): Promise<string>;
    normalizePath(path: string): string;
    setSystemPaths(systemPaths: string): FilesystemContract;
    getSystemPaths(): string[];
    where(search: string, cwd?: string): Promise<string>;
    which(search: string, cwd?: string): Promise<string>;
    findUp(search: string, cwd?: string, root?: string): Promise<string>;
    dirname(path: string): string;
    tmpfile(extension?: string, prefix?: string): string;
    unlink(path: string): Promise<boolean>;
    uri(path: string): string;
}
