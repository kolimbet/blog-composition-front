import {
  getAuthorized,
  getInitiated,
  actionInitApp,
} from "@/composables/storeAuth";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // {
  //   path: "/loading",
  //   name: "loading",
  //   component: () => import("@/components/TheLoadingComponent.vue"),
  //   meta: {
  //     // initializationIsComplete: false,
  //     requiresAuthorization: false,
  //   },
  // },
  {
    path: "/",
    name: "home",
    component: () => import("@/components/post/ThePostFeed.vue"),
    meta: {
      requiresAuthorization: false,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/components/auth/TheLoginPage.vue"),
    meta: {
      requiresAuthorization: false,
    },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/components/auth/TheRegisterPage.vue"),
    meta: {
      requiresAuthorization: false,
    },
  },
  {
    path: "/account/:section/:identifier",
    name: "account_section_with_id",
    component: () => import("@/components/account/TheUserAccount.vue"),
    meta: {
      requiresAuthorization: true,
    },
  },
  {
    path: "/account/:section",
    name: "account_section",
    component: () => import("@/components/account/TheUserAccount.vue"),
    meta: {
      requiresAuthorization: true,
    },
  },
  {
    path: "/account",
    name: "account",
    component: () => import("@/components/account/TheUserAccount.vue"),
    meta: {
      requiresAuthorization: true,
    },
  },
  {
    path: "/:pathMatch(.*)",
    name: "not_found",
    component: () => import("@/components/ThePageNotFound.vue"),
    meta: {
      requiresAuthorization: false,
    },
  },
];

const router = createRouter({
  base: "/",
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log("Routing to " + to.fullPath);

  if (getInitiated.value) {
    routing(to, next);
  } else {
    actionInitApp().then(() => {
      routing(to, next);
    });
  }
});

function routing(to, next) {
  // console.log(`start routing(${to.fullPath})`);
  if (to.meta.requiresAuthorization) {
    // console.log("Сhecking Autorized", getAuthorized.value);
    if (!getAuthorized.value) {
      // console.log("Router requiresAuthorization check redirect to: /login");
      next({ name: "login" });
    } else next();
  } else {
    next();
  }
}

export default router;
