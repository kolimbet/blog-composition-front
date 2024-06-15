import axios from "axios";
import { backendDomain } from "./config";
import { parseApiError } from "./service-functions";

axios.defaults.baseURL = backendDomain;
axios.defaults.headers.common["Accept"] = "application/json";

const sourceUrls = {
  login: "/api/login",
  logout: "/api/logout",
  user: "/api/user",
  userRegister: "/api/register",
  userNameIsFree: "/api/name-is-free",
  userEmailIsFree: "/api/email-is-free",
  userPasswordCheck: "/api/user/check-password",
  userPasswordUpdate: "/api/user/update-password",
  userAvatar: "/api/user/avatar",
  avatars: "/api/avatars",
  postImages: "/api/images",
  posts: "/api/posts",
  adminPosts: "/api/admin/posts",
  adminTags: "/api/admin/tags",
};

let token = localStorage.getItem("token") ?? null;

// --------------------------- Api methods --------------------------- //
// ------------------------------- Auth --------------------------- //
export async function apiLogin(auth) {
  return new Promise((resolve, reject) => {
    // console.log("apiLogin", auth);
    axios
      .post(sourceUrls.login, auth)
      .then(({ data }) => {
        if (data.access_token) {
          if (data.user) {
            token = "Bearer " + data.access_token;
            localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = token;
            resolve(data.user);
          } else {
            reject("ERROR: user data wasn't received");
          }
        } else {
          reject("ERROR: auth token wasn't received");
        }
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiLogout() {
  return new Promise((resolve, reject) => {
    // console.log("apiLogout");
    axios
      .get(sourceUrls.logout)
      .then(() => {
        // console.log("apiLogout completed successfully");
        token = null;
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        resolve(true);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiCheckAuth() {
  return new Promise((resolve, reject) => {
    if (!token) reject("no auth Token");
    else {
      // console.log("token is:", token);
      axios.defaults.headers.common["Authorization"] = token;

      axios
        .get(sourceUrls.user)
        .then(({ data }) => {
          // console.log("apiCheckAuth completed successfully", data);
          resolve(data);
        })
        .catch((err) => {
          token = null;
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          reject("ERROR: " + parseApiError(err));
        });
    }
  });
}

// --------------------------- User: registering a new one  --------------------------- //
export async function apiUserRegister(regData) {
  return new Promise((resolve, reject) => {
    // reject("apiUserRegister test stopper");
    axios
      .post(sourceUrls.userRegister, regData)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject("ERROR: " + parseApiError(err));
      });
  });
}

export async function apiUserNameIsFree(name) {
  return new Promise((resolve, reject) => {
    axios
      .post(sourceUrls.userNameIsFree, { name })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiUserEmailIsFree(email) {
  return new Promise((resolve, reject) => {
    axios
      .post(sourceUrls.userEmailIsFree, { email })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// --------------------------- User: changing password  --------------------------- //
export async function apiUserPasswordCheck(password) {
  return new Promise((resolve, reject) => {
    // reject("apiUserPasswordCheck test stopper");
    axios
      .post(sourceUrls.userPasswordCheck, { password: password })
      .then(({ data }) => {
        // console.log("apiUserPasswordCheck completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiUserPasswordUpdate(form) {
  return new Promise((resolve, reject) => {
    // reject("apiUserPasswordUpdate test stopper");
    axios
      .post(sourceUrls.userPasswordUpdate, form)
      .then(({ data }) => {
        // console.log("apiUserPasswordUpdate completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// --------------------------- User: avatar  --------------------------- //
export async function apiUserAvatarSet(imageId) {
  return new Promise((resolve, reject) => {
    // reject("apiUserAvatarSet test stopper");
    axios
      .post(sourceUrls.userAvatar, { id: imageId })
      .then(({ data }) => {
        // console.log("apiUserAvatarSet completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiUserAvatarDelete() {
  return new Promise((resolve, reject) => {
    // reject("apiUserAvatarDelete test stopper");
    axios
      .delete(sourceUrls.userAvatar)
      .then(({ data }) => {
        // console.log("apiUserAvatarDelete completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// ---------------------------     Images    --------------------------- //
// ---------------------------     Avatars    ---------------------------//
export async function apiAvatarList() {
  return new Promise((resolve, reject) => {
    // reject("apiAvatarList test stopper");
    axios
      .get(sourceUrls.avatars)
      .then(({ data }) => {
        // console.log("apiAvatarList completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiAvatarStore(image) {
  return new Promise((resolve, reject) => {
    // reject("apiAvatarStore test stopper");
    axios
      .post(sourceUrls.avatars, image, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(({ data }) => {
        // console.log("apiAvatarStore completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiAvatarDelete(imageId) {
  return new Promise((resolve, reject) => {
    // reject("apiAvatarDelete test stopper");
    axios
      .delete(sourceUrls.avatars + `/${imageId}`)
      .then((/* { data } */) => {
        // console.log("apiAvatarDelete completed successfully", data);
        resolve(true);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// ---------------------------   Post Images   ---------------------------//
export async function apiImageList(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiImageList test stopper");
    axios
      .get(sourceUrls.postImages + "/post/" + postId)
      .then(({ data }) => {
        // console.log("apiImageList completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiImageStore(image) {
  return new Promise((resolve, reject) => {
    // reject("apiImageStore test stopper");
    axios
      .post(sourceUrls.postImages, image, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(({ data }) => {
        // console.log("apiImageStore completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiImageDelete(imageId) {
  return new Promise((resolve, reject) => {
    // reject(
    //   "apiImageDelete test stopper" +
    //     " - " +
    //     sourceUrls.postImages +
    //     `/${imageId}`
    // );
    axios
      .delete(sourceUrls.postImages + `/${imageId}`)
      .then((/* { data } */) => {
        // console.log("apiImageDelete completed successfully", data);
        resolve(true);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiImageClearNonAttached(imageFolder, imageCounter) {
  return new Promise((resolve, reject) => {
    // reject("apiImageDelete test stopper");
    axios
      .post(sourceUrls.postImages + "/clear", {
        image_path: imageFolder,
        image_counter: imageCounter,
      })
      .then((/* { data } */) => {
        // console.log("apiImageDelete completed successfully", data);
        resolve(true);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}
/* ------------------------- Posts ------------------------ */
export async function apiPostListFeed(page = 1) {
  return new Promise((resolve, reject) => {
    // reject("apiPostListFeed test stopper");
    const requestURL = new URL(sourceUrls.posts, backendDomain);
    if (page > 1) requestURL.searchParams.append("page", page);
    axios
      .get(requestURL)
      .then(({ data }) => {
        // console.log("apiPostListFeed completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostListByTag(tagSlug, page = 1) {
  return new Promise((resolve, reject) => {
    // reject("apiPostListAdmin test stopper");
    const requestURL = new URL(
      sourceUrls.posts + `/by-tag/${tagSlug}`,
      backendDomain
    );
    if (page > 1) requestURL.searchParams.append("page", page);
    axios
      .get(requestURL)
      .then(({ data }) => {
        // console.log("apiPostListByTag completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostListAdmin(page = 1) {
  return new Promise((resolve, reject) => {
    // reject("apiPostListAdmin test stopper");
    const requestURL = new URL(sourceUrls.adminPosts, backendDomain);
    if (page > 1) requestURL.searchParams.append("page", page);
    axios
      .get(requestURL)
      .then(({ data }) => {
        // console.log("apiPostListAdmin completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostItemFeed(postSlug) {
  return new Promise((resolve, reject) => {
    // reject("apiPostItemFeed test stopper");
    axios
      .get(sourceUrls.posts + "/" + postSlug)
      .then(({ data }) => {
        // console.log("apiPostItemFeed completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostItemAdmin(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiPostItemAccount test stopper");
    axios
      .get(sourceUrls.adminPosts + "/" + postId)
      .then(({ data }) => {
        // console.log("apiPostItemAccount completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        console.log("apiPostItemAccount failed", err);
        reject(parseApiError(err));
      });
  });
}

export async function apiPostStore(post) {
  return new Promise((resolve, reject) => {
    // reject("apiPostStore test stopper");
    axios
      .post(sourceUrls.adminPosts, post)
      .then(({ data }) => {
        // console.log("apiPostStore completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostUpdate(postId, post) {
  return new Promise((resolve, reject) => {
    // reject("apiPostUpdate test stopper");
    axios
      .post(sourceUrls.adminPosts + "/" + postId, post)
      .then(({ data }) => {
        // console.log("apiPostUpdate completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostDelete(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiPostDelete test stopper");
    axios
      .delete(sourceUrls.adminPosts + "/" + postId)
      .then(({ data }) => {
        // console.log("apiPostDelete completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// ---------------------- PostLikes ------------------------------------
export async function apiPostLikeAdd(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiPostLikeAdd test stopper");
    axios
      .get(sourceUrls.posts + "/" + postId + "/like-add")
      .then(({ data }) => {
        // console.log("apiPostLikeAdd completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}
export async function apiPostLikeDestroy(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiPostLikeDestroy test stopper");
    axios
      .get(sourceUrls.posts + "/" + postId + "/like-destroy")
      .then(({ data }) => {
        // console.log("apiPostLikeDestroy completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

// ------------------------ Tags ---------------------------------------
export async function apiTagList() {
  return new Promise((resolve, reject) => {
    // reject("apiTagList test stopper");
    axios
      .get(sourceUrls.adminTags)
      .then(({ data }) => {
        // console.log("apiTagList completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiTagCheckName(tagName, tagId = 0) {
  return new Promise((resolve, reject) => {
    // reject("apiTagCheckName test stopper");
    axios
      .post(sourceUrls.adminTags + "/check-name", {
        name: tagName,
        tag_id: tagId,
      })
      .then(({ data }) => {
        // console.log("apiTagCheckName completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiTagStore(tagName) {
  return new Promise((resolve, reject) => {
    // reject("apiTagStore test stopper");
    axios
      .post(sourceUrls.adminTags, { name: tagName })
      .then(({ data }) => {
        // console.log("apiTagStore completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiTagUpdate(tagId, tagName) {
  return new Promise((resolve, reject) => {
    // reject("apiTagUpdate test stopper");
    axios
      .post(sourceUrls.adminTags + "/" + tagId, { name: tagName })
      .then(({ data }) => {
        console.log("apiTagUpdate completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiTagDestroy(tagId) {
  return new Promise((resolve, reject) => {
    // reject("apiTagDestroy test stopper");
    axios
      .delete(sourceUrls.adminTags + "/" + tagId)
      .then(({ data }) => {
        // console.log("apiTagDestroy completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}
