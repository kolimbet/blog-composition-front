import { computed, ref } from "vue";

export function useUserAbout() {
    const user = ref(null);
    const uaCommentsList = ref(null);
    const uaLastPost = ref(null);

    // Getters
    const uaAvatarUrl = computed(() =>
      user.value?.avatar ? user.value.avatar.full_url : "/images/default_avatar.png"
    );
    const uaUserName = computed(() => user.value?.name ?? "...");
    const uaIsAdmin = computed(() => +user.value?.is_admin ?? 0);
    const uaIsBanned = computed(() => user.value?.is_banned);

    const uaCommentsCounter = computed(() => user.value?.comments_count ?? 0);
    const uaPostsCounter = computed(() => user.value?.posts_count ?? 0);

    // Setters 
    function uaSetUserData(userData = null, comments = null, post = null) {
        user.value = userData;
        uaCommentsList.value = comments;
        uaLastPost.value = post;
    }

    function uaPostLikeAdd(newLike) {
        uaLastPost.value.likes.push(newLike);
    }
    
    function uaPostLikeDestroy(deletedLikeId) {
        uaLastPost.value.likes.splice(
            uaLastPost.value.likes.findIndex(
            (like) => like.id == deletedLikeId
            ),
            1
        );
    }

    return {
        uaAvatarUrl,
        uaUserName,
        uaIsAdmin,
        uaIsBanned,
        uaCommentsCounter,
        uaPostsCounter,
        uaCommentsList,
        uaLastPost,
        uaSetUserData,
        uaPostLikeAdd,
        uaPostLikeDestroy,
    };
}