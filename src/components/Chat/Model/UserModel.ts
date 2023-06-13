export interface User {
    _id: string;
    ensName: string;
    walletID: string;
}

const hasEnsName = (user: User) => {
    return (
        user.ensName != null &&
        user.ensName != '' &&
        user.ensName != undefined &&
        user.ensName != 'undefined' &&
        user.ensName != 'defaultValue' &&
        user.ensName != 'null'
    );
};

export function getUserLabel(user: User | null): string {
    if (user == null) return '';

    if (hasEnsName(user)) {
        return user.ensName;
    }
    return (
        user.walletID.substring(0, 6) +
        '...' +
        user.walletID.substring(user.walletID.length - 4)
    );
}

export function userLabelForFilter(user: User | null): string {
    if (user == null) return '';

    if (hasEnsName(user)) {
        return user.ensName.toLowerCase();
    }
    return user.walletID.toLowerCase();
}
