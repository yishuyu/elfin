<template>
  <div class="btn-box">
    <div class="task-button" @click="onTaskClick(0)"><startIcon />开始</div>
    <div class="task-button" @click="onTaskClick(1)"><pauseIcon />暂停</div>
  </div>
  <div class="btn-box">
    <div class="task-button" @click="onTaskClick(2)"><continueIcon />继续</div>
    <div class="task-button" @click="onTaskClick(3)"><endIcon />结束</div>
  </div>
</template>

<script>
import { ctrlTask } from "@/service/robot";
import { ElMessage } from "element-plus";
import { startIcon, pauseIcon, continueIcon, endIcon } from "@/icon/index";
export default {
  name: "RobotTask",
  components: {
    startIcon,
    pauseIcon,
    continueIcon,
    endIcon,
  },
  methods: {
    async onTaskClick(cmd) {
      const res = await ctrlTask({ cmd, taskType: "delivery_all_same_floor" });
      if (res.code === 0) {
        ElMessage({
          message: `指令发送成功`,
          type: "success",
        });
      }
    },
  },
};
</script>

<style scoped lang='scss'>
.btn-box {
  display: flex;
  width: 1000px;
  justify-content: space-around;
  margin: 0 auto;
  margin-top: 35px;
}
.task-button {
  width: 368px;
  height: 282px;
  background: linear-gradient(180deg, #f2f8ff 0%, #ffffff 112.66%);
  box-shadow: 0px 0px 5px rgba(184, 190, 217, 0.5);
  border-radius: 20.0355px;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align: center;
  border: 2px solid #9ABDF8
;
}
</style>
