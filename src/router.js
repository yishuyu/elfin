import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardPage from './pages/Dashboard/DashboardPage.vue';
import RobotOperation from "./pages/Dashboard/components/RobotOperation.vue";
import RobotTask from "./pages/Dashboard/components/RobotTask.vue";
import MapDashboard from "./pages/Dashboard/components/MapDashboard.vue";
import TestCanvas from "./pages/Dashboard/components/TestCanvas.vue";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/moint' },
    {
      path: '/dashboard',
      component: DashboardPage,
      children: [
        {
          path: '/moint',
          name: "moint",
          component: MapDashboard
        },
        {
          path: '/task',
          name: "task",
          component: RobotTask,
        },
        {
          path: '/operation',
          name: "operation",
          component: RobotOperation,
        },
        {
          path: '/testcanvas',
          name: "TestCanvas",
          component: TestCanvas,
        },
      ]
    },

  ],
});

export default router;
