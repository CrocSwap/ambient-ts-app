const apiBase = '/chat/api/';

export const getMessageWithRestEndpoint =
    apiBase + 'messages/getMsgWithoutWebSocket2/';

export const getAllMessagesEndpoint = apiBase + 'messages/getall/';

export const getMessageWithRestWithPaginationEndpoint =
    apiBase + 'messages/getMsgWithoutWebSocket2/';

export const updateLikesDislikesCountEndpoint =
    apiBase + 'messages/updateLikeDislike';

export const getMentionsWithRestEndpoint = apiBase + 'messages/getMentions/';

export const getUserListWithRestEndpoint = apiBase + 'auth/getUsersForMent';

export const getUserIsVerified = apiBase + 'auth/isUserVerified/';

export const verifyUserEndpoint = apiBase + 'auth/verifyUser';

export const updateVerifiedDateEndpoint = apiBase + 'auth/updateVerifyDate';

export const addReactionEndpoint = apiBase + 'messages/addReaction';

export const getUserDetailsEndpoint = apiBase + 'auth/getUserByWalletID';

export const updateUnverifiedMessagesEndpoint =
    apiBase + 'messages/updateUnverifiedMessages';

export const saveuserWithAvatarEndpoint =
    apiBase + 'auth/saveUserWithAvatarImage';
export const updateUserWithAvatarImageEndpoint =
    apiBase + 'auth/updateUserWithAvatarImage';
export const getUserAvatarImageByAccountEndpoint =
    apiBase + 'auth/getUserAvatarImageByAccount';

export const getUserAvatarEndpoint = apiBase + 'auth/getUserAvatar';

export const getTopRoomsEndpoint = apiBase + 'messages/getTopRooms';

export const getVerificationMessageEndpoint =
    apiBase + 'auth/getVerificationMessage';

export const getUsersByIdListEndpoint = apiBase + 'auth/getUsersByIdList/';
