<template>
  <BasicLayout>
    <el-container>
      <el-aside width="176px">
        <img src="@/assets/logo-robot.png" />
        <el-menu
          text-color="#B8BED9"
          active-text-color="#fff"
          unique-opened
          background-color="#F2F8FF"
          :default-active="activeTabName"
          class="el-menu-vertical-demo"
          @select="changeTab"
        >
          <el-menu-item
            v-for="(item, index) in menusList"
            :key="index"
            :index="item.name"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main><router-view /></el-main>
      </el-container>
    </el-container>
  </BasicLayout>
</template>

<script>
import BasicLayout from "@/components/BasicLayout.vue";
import { homeIcon, trackIcon, setIcon } from "@/icon/index";
export default {
  name: "DashboardPage",
  components: {
    BasicLayout,
    homeIcon,
    trackIcon,
    setIcon,
  },
  data() {
    return {
      activeTabName: "",
      menusList: [
        {
          icon: <homeIcon />,
          label: "监测",
          name: "moint",
        },
        {
          icon: <trackIcon />,
          label: "任务",
          name: "task",
        },
        {
          icon: <setIcon />,
          label: "工具",
          name: "operation",
        },
        {
          icon: <setIcon />,
          label: "TestCanvas",
          name: "TestCanvas",
        },
      ],
    };
  },
  mounted() {
    console.log("this.$route.name", this.$route);
    this.activeTabName = this.$route.name;
  },
  methods: {
    changeTab(name) {
      console.log(11111, name);
      this.activeTabName = name;
      this.$router.push({
        name: name,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.el-container{
  background: linear-gradient(180deg, #F9FBFE 0%, rgba(251, 253, 255, 0) 100%);
  border-radius: 6px 0px 0px 6px;
}
.el-menu-item.is-active {
  background: #2677ff;
}

::v-deep.el-menu-item.is-active i svg path[fill] {
  fill: #fff;
}
.el-menu-item{
  border-radius: 12px;
  width: 158px;
  margin: auto;
}
.el-aside{
  background: #F2F8FF;
  box-shadow: 1px 0px 4px #B8BED9;
  height: 650px;
}
.el-main{
  padding: 0 0 0 20px;
  // overflow: hidden;
}
.el-menu-item:hover{
  background-color: #F2F8FF;
}
.el-menu-item.is-active:hover{
  background-color: #2677ff;
}
</style>