import {
  getAuthorized,
  getInitiated,
  getIsAdmin,
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
      forAdmin: false,
    },
  },
  {
    path: "/tag/:tagSlug",
    name: "posts_by_tag",
    component: () => import("@/components/post/ThePostListByTag.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
    props: true,
  },
  {
    path: "/:postSlug",
    name: "post",
    component: () => import("@/components/post/ThePostItem.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
    props: true,
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/components/auth/TheLoginPage.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/components/auth/TheRegisterPage.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
  },
  {
    path: "/user/:userId",
    name: "user_about",
    component: () => import("@/components/user/TheUserAboutSome.vue"),
    props: true,
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
  },
  {
    path: "/account",
    component: () => import("@/components/account/TheUserAccount.vue"),
    meta: {
      requiresAuthorization: true,
      forAdmin: false,
    },
    children: [
      {
        path: "home",
        alias: "",
        name: "account_home",
        component: () => import("@/components/account/TheAccountHome.vue"),
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
    path: "/admin",
    component: () => import("@/components/admin/TheAdminPanel.vue"),
    meta: {
      requiresAuthorization: true,
      forAdmin: true,
    },
    children: [
      {
        path: "home",
        alias: "",
        name: "admin_home",
        component: () => import("@/components/account/TheAccountHome.vue"),
      },
      {
        path: "posts",
        children: [
          {
            path: "",
            name: "admin_posts",
            component: () => import("@/components/post/ThePostListAdmin.vue"),
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
        path: "tags",
        name: "admin_tags",
        component: () => import("@/components/tag/TheTagListAdmin.vue"),
      },
      {
        path: "comments",
        name: "admin_comments",
        component: () => import("@/components/admin/TheAdminComments.vue"),
      },
      {
        path: "avatar",
        name: "admin_avatar",
        component: () => import("@/components/account/TheAccountAvatar.vue"),
      },
      {
        path: "password",
        name: "admin_password",
        component: () => import("@/components/account/TheAccountPassword.vue"),
      },
    ],
  },
  {
    path: "/access-denied",
    name: "access_denied",
    component: () => import("@/components/TheAccessDenied.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
    },
  },
  {
    path: "/:pathMatch(.*)",
    name: "not_found",
    component: () => import("@/components/ThePageNotFound.vue"),
    meta: {
      requiresAuthorization: false,
      forAdmin: false,
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
    } else {
      if (to.meta.forAdmin && !getIsAdmin.value) {
        console.log("Router forAdmin check redirect to: /access-denied");
        next({ name: "access_denied", query: { deniedURL: to.fullPath } });
      } else {
        next();
      }
    }
  } else {
    next();
  }
}

export default router;
