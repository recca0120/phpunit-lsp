export enum OS {
    WINDOWS = 1,
    WIN = 1,
    POSIX = 2,
    LINUX = 2,
}

export function os(): OS {
    return /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform) ? OS.WIN : OS.POSIX;
}

export function tap<T>(value: T, callback: Function): T {
    callback(value);

    return value;
}

export function value<T>(value: T, callback: Function): T {
    return callback(value);
}

export function when<T>(value: T, success: any, fail?: any): any {
    if (value) {
        return success instanceof Function ? success(value) : success;
    } else if (fail) {
        return fail instanceof Function ? fail(value) : fail;
    }

    return '';
}

export function groupBy(items: any[], key: string): Map<string, any[]> {
    return items.reduce((groups: Map<string, any[]>, item: any) => {
        const group: any[] = groups.get(item[key]) || [];
        group.push(item);
        groups.set(item[key], group);

        return groups;
    }, new Map<string, any[]>());
}
