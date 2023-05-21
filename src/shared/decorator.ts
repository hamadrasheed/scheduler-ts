// tslint:disable-next-line: ban-types
export function Frozen(constructor: Function): void {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
}
