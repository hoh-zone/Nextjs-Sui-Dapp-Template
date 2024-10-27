export default function next<T>(index: number, array: T[]): [number, T] {
    const len = array.length;
    index = (index + 1) % len;
    return [index, array[index]];
}