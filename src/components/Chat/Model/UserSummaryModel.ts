export interface UserSummaryModel {
    _id: string;
    ensName: string;
    walletID: string;
    status: boolean;
    totalMessages: number;
    deletedMessages: number;
    avatarImage: string;
    avatarThumbnail: string;
    avatarCompressed: string;
}

const hasEnsName = (user: UserSummaryModel) => {
    return (
        user.ensName != null &&
        user.ensName != '' &&
        user.ensName != undefined &&
        user.ensName != 'undefined' &&
        user.ensName != 'defaultValue' &&
        user.ensName != 'null'
    );
};

export function getUserLabel(user: UserSummaryModel | null): string {
    if (user == null) return '';

    if (hasEnsName(user)) {
        return user.ensName;
    }
    return (
        user.walletID.substring(0, 8) + '...'
        // + user.walletID.substring(user.walletID.length - 4)
    );
}

export function getUserLabelforSummary(user: UserSummaryModel | null): string {
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
