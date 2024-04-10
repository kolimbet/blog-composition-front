import {
  getAuthorized,
  getInitiated,
  actionInitApp,
} from "@/composables/storeAuth";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/components/post/ThePostFeed.vue"),
    meta: {
      requiresAuthorization: false,
    },
  },
  {
    path: "/:postSlug",
    name: "post",
    component: () => import("@/components/post/ThePostItem.vue"),
    meta: {
      requiresAuthorization: false,
    },
    props: true,
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
    path: "/account",
    component: () => import("@/components/account/TheUserAccount.vue"),
    meta: {
      requiresAuthorization: true,
    },
    children: [
      {
        path: "home",
        alias: "",
        name: "account_home",
        component: () => import("@/components/account/TheAccountHome.vue"),
      },
      {
        path: "posts",
        children: [
          {
            path: "",
            name: "account_posts",
            component: () => import("@/components/post/ThePostListAccount.vue"),
          },
          {
            path: "create",
            name: "post_create",
            component: () => import("@/components/post/ThePostCreate.vue"),
          },
          {
            path: ":postId",
            name: "post_edit",
            component: () => import("@/components/post/ThePostEdit.vue"),
            props: true,
          },
        ],
      },
      {
        path: "comments",
        name: "account_comments",
        component: () => import("@/components/account/TheAccountComments.vue"),
      },
      {
        path: "avatar",
        name: "account_avatar",
        component: () => import("@/components/account/TheAccountAvatar.vue"),
      },
      {
        path: "password",
        name: "account_password",
        component: () => import("@/components/account/TheAccountPassword.vue"),
      },
    ],
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
