import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "python-blocks-home",
      component: () => import("../views/PythonBlocksBoard.vue"),
    },
    {
      path: "/python-blocks",
      name: "python-blocks",
      component: () => import("../views/PythonBlocksBoard.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
