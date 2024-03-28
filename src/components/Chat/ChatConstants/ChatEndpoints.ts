const apiBase = '/chat/api/';

export const getMessageWithRestEndpoint =
    apiBase + 'messages/getMsgWithoutWebSocket/';

export const getAllMessagesEndpoint = apiBase + 'messages/getall/';

export const getMessageWithRestWithPaginationEndpoint =
    apiBase + 'messages/getMsgWithoutWebSocket/';

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
