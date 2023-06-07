export interface User {
    _id: string;
    ensName: string;
    walletID: string;
}

export function getUserLabel(user: User | null): string {
    if (user == null) return '';

    if (
        user.ensName != null &&
        user.ensName != '' &&
        user.ensName != undefined &&
        user.ensName != 'undefined' &&
        user.ensName != 'null'
    ) {
        return user.ensName;
    }
    return (
        user.walletID.substring(0, 6) +
        '...' +
        user.walletID.substring(user.walletID.length - 4)
    );
}
