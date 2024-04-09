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
  images: "/api/images",
  posts: "/api/posts",
  accountPosts: "/api/account/posts",
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
export async function apiImageList(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiImageList test stopper");
    const request = axios.get(
      sourceUrls.images + (postId ? `/post/${postId}` : "/avatars")
    );

    request
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
      .post(sourceUrls.images, image, {
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
    // reject("apiImageDelete test stopper");
    axios
      .delete(sourceUrls.images + `/${imageId}`)
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
export async function apiPostListAccount(page = 1) {
  return new Promise((resolve, reject) => {
    // reject("apiPostListAccount test stopper");
    const requestURL = new URL(sourceUrls.accountPosts, backendDomain);
    if (page > 1) requestURL.searchParams.append("page", page);
    axios
      .get(requestURL)
      .then(({ data }) => {
        // console.log("apiPostListAccount completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostItemAccount(postId) {
  return new Promise((resolve, reject) => {
    // reject("apiPostItemAccount test stopper");
    axios
      .get(sourceUrls.accountPosts + "/" + postId)
      .then(({ data }) => {
        // console.log("apiPostItemAccount completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}

export async function apiPostStore(post) {
  return new Promise((resolve, reject) => {
    // reject("apiPostStore test stopper");
    axios
      .post(sourceUrls.accountPosts, post)
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
      .post(sourceUrls.accountPosts + "/" + postId, post)
      .then(({ data }) => {
        // console.log("apiPostUpdate completed successfully", data);
        resolve(data);
      })
      .catch((err) => {
        reject(parseApiError(err));
      });
  });
}
