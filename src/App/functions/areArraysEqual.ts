export default function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
    // return `false` if arrays are not equal length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // create a map of data from first array for comparison
    const countMap = new Map<T, number>();
    for (const element of arr1) {
        countMap.set(element, (countMap.get(element) || 0) + 1);
    }

    // decrement occurrences for elements in second array
    for (const element of arr2) {
        const count = countMap.get(element);

        if (!count) {
            return false; // Element not present in arr1
        } else if (count === 1) {
            countMap.delete(element);
        } else {
            countMap.set(element, count - 1);
        }
    }

    return true;
}
