import {
  apiCheckAuth,
  apiLogin,
  apiLogout,
  apiUserAvatarDelete,
  apiUserAvatarSet,
} from "@/api";
import { computed, ref } from "vue";

// State
const initiated = ref(false);
const authorized = ref(false);
const user = ref(null);

// Getters
export const getInitiated = computed(() => initiated.value);
export const getAuthorized = computed(() => authorized.value);
export const getAvatarUrl = computed(() =>
  user.value?.avatar ? user.value.avatar.full_url : "/images/default_avatar.png"
);
export const getAvatarId = computed(() => user.value.avatar_id);
export const getUserName = computed(() => user.value?.name ?? "...");
export const getIsAdmin = computed(() => +user.value?.is_admin ?? 0);

// Setters
const setAuthData = (userData = null) => {
  if (userData === null) {
    user.value = null;
    authorized.value = false;
  } else {
    user.value = userData;
    authorized.value = true;
  }
};
const setEndOfInitialization = () => {
  initiated.value = true;
  // console.log("Initialization is completed");
};

// Actions
export async function actionInitApp() {
  return new Promise((resolve) => {
    setTimeout(() => {
      actionStartAuth()
        .then(() => {
          setEndOfInitialization();
          resolve(true);
        })
        .catch((err) => {
          console.log("actionInitApp() error: " + err);
          setEndOfInitialization();
          resolve(true);
        });
    }, 1000);
  });
}

async function actionStartAuth() {
  return new Promise((resolve, reject) => {
    apiCheckAuth()
      .then((userData) => {
        // console.log("storeAuth->actionStartAuth", userData);
        setAuthData(userData);
        resolve(userData);
      })
      .catch((err) => {
        setAuthData();
        reject(err);
      });
  });
}

export async function actionLogin(auth) {
  return new Promise((resolve, reject) => {
    // console.log(auth);
    apiLogin(auth)
      .then((userData) => {
        setAuthData(userData);
        resolve(userData);
      })
      .catch((err) => {
        setAuthData();
        reject(err);
      });
  });
}

export async function actionLogout() {
  return new Promise((resolve, reject) => {
    if (!authorized.value) reject("You are not auth");
    else {
      apiLogout()
        .then(() => {
          setAuthData();
          resolve(true);
        })
        .catch((err) => {
          console.log("storeAuth->actionLogout error:", err);
          reject(err);
        });
    }
  });
}

export async function actionAvatarSet(imageId) {
  return new Promise((resolve, reject) => {
    apiUserAvatarSet(imageId)
      .then((data) => {
        setAuthData(data);
        resolve(data);
      })
      .catch((err) => {
        console.log("storeAuth->actionAvatarSet catch", err);
        reject(err);
      });
  });
}

export async function actionAvatarDelete() {
  return new Promise((resolve, reject) => {
    apiUserAvatarDelete()
      .then((data) => {
        setAuthData(data);
        resolve(data);
      })
      .catch((err) => {
        console.log("storeAuth->actionAvatarDelete catch", err);
        reject(err);
      });
  });
}
