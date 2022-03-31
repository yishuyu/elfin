<template>
  <!-- <div>
    导航区域
    <div v-for="i in positionsList" :key="i.id">
      <el-button
        type="primary"
        style="margin-top: 5px"
        @click="changeRobotPosition({ destPosition: i.id, cmd: 1 })"
        >{{ i.type }}</el-button
      >
    </div>
  </div>
  <div style="margin-top: 10px">
    <div>机器人当前状态</div>
    {{ robotInfo.robotId ? robotInfo : initRobotInfo }}
  </div>
  <div v-if="polling" style="margin-top: 10px">
    <el-button>暂停导航</el-button><el-button>结束导航</el-button>
  </div>
  <div v-if="navResult" style="margin-top: 10px">
    <div>导航已结束，当前状态:{{ codeMessage[navResult.errCode] }}</div>
  </div> -->
  <div style="margin-top: 10px">
    <!-- <div>机械臂控制</div> -->
    <div class="box">
      <el-button
        @click="controlArm(0, 'powerOn', true, 'flag')"
        class="task-button"
        :disabled="robotInfo.armPowerOn"
      >
        上电
      </el-button>
      <el-button
        @click="controlArm(0, 'powerOn', false)"
        class="task-button"
        :disabled="!robotInfo.armPowerOn"
      >
        断电
      </el-button>
      <el-button
        @click="controlArm(1, 'enable', true)"
        class="task-button"
        :disabled="robotInfo.armEnabled || !robotInfo.armPowerOn"
      >
        使能机械臂
      </el-button>
      <el-button
        @click="controlArm(1, 'enable', false)"
        class="task-button"
        :disabled="!robotInfo.armEnabled"
      >
        去使能机械臂
      </el-button>
    </div>
    <div class="box">
      <div @click="onDeleteErrors" class="task-button">清错</div>
      <div
        @touchstart="onArmBackOrigin"
        @touchend="onArmBackOriginEnd"
        class="task-button"
      >
        机械臂长按回原点
      </div>
      <div class="task-button" @click="startArmZeroForce(true)">
        开启零力示教
      </div>
      <div class="task-button" @click="startArmZeroForce(false)">
        关闭零力示教
      </div>
    </div>
    <el-dialog v-model="dialogVisible" title="Tips" width="30%">
      <span>上电中...</span>
    </el-dialog>
    <!-- <el-button @click="controlArm(1, 'enable', true)">使能机械臂</el-button>
    <el-button @click="controlArm(1, 'enable', false)">去使能机械臂</el-button>
    <el-button @click="controlArm(0, 'powerOn', true)">上电</el-button>
    <el-button @click="controlArm(0, 'powerOn', false)">断电</el-button>
    <el-button @click="controlArm(2, 'stop', true)"
      >停止机械臂当前动作</el-button
    > -->
  </div>
  <div class="meal-box">
    <div class="one">当前层：5层</div>
    <div class="two">
      <span>餐盒升降</span>
      <el-select
        v-model="meal"
        placeholder="Select"
        size="large"
        style="margin-left: 10px;margin-right: 10px"
      >
        <el-option>选项</el-option>
      </el-select>
      <el-button size="large" type="primary">餐盒升降</el-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { ElMessage } from "element-plus";
import {
  getRobotInfoApi,
  robotNavigationApi,
  getNavigationResultApi,
  ctrlArmApi,
  deleteErrors,
  armBackOrigin,
  armEndOrigin,
  startArmZeroForce,
} from "@/service/robot";
import { codeMessage } from "@/utils/request";
export default {
  name: "RobotOperation",
  props: {
    positionsList: Array,
    drawPoint: Function,
    calculatePointPosition: Function,
    initRobotInfo: Object,
  },
  data() {
    return {
      dialogVisible: false,
      timer: null,
      //机械臂是否已上电
      disabledarmPowerOn: false,
      // 机械臂是否已使能
      disablearmEnabled: false,
      codeMessage: codeMessage,
      robotInfo: {},
      currentNavRequestId: "",
      navResult: null,
      polling: null,
      navCmdMap: {
        1: "开始",
        2: "暂停",
        3: "继续",
        4: "结束",
      },
      validParam: {
        0: "powerOn",
        1: "enable",
        2: "stop",
        3: "clearFaults",
      },
    };
  },
  methods: {
    endLoading(loading) {
      loading.close();
    },
    startLoading() {
      const loading = this.$loading({
        lock: true,
        text: "上电中...",
        background: "rgba(0,0,0,0.7)",
      });
      return loading;
    },
    async startArmZeroForce(flag) {
      const res = await startArmZeroForce({ param: flag });
      if (res.code === 0) {
        ElMessage({
          message: `操作成功`,
          type: "success",
        });
      }
    },
    async onArmBackOriginEnd() {
      // console.log('end')
      const res = await armEndOrigin({ cmd: 3 });
    },
    async onArmBackOrigin() {
      // console.log(111)
      const res = await armBackOrigin();
      if (res.code === 0) {
        ElMessage({
          message: `操作成功`,
          type: "success",
        });
      }
    },
    async onDeleteErrors() {
      const res = await deleteErrors();
      if (res.code === 0) {
        ElMessage({
          message: `操作成功`,
          type: "success",
        });
      }
    },
    async getRobotInfo() {
      const { data } = await getRobotInfoApi();
      this.robotInfo = data;
      // const { x, y } = this.calculatePointPosition(data.x, data.y);
      // // 渲染机器人位置
      // this.drawPoint(x, y, 20);
      return data;
    },
    mySetInterval() {
      this.getRobotInfo();
      this.timer = setTimeout(() => this.mySetInterval(), 1000);
    },
    async changeRobotPosition({ destPosition, cmd }) {
      this.navResult = null;
      const res = await robotNavigationApi({ destPosition, cmd });
      const { data, code } = res;
      this.currentNavRequestId = data.requestId;
      if (code === 0) {
        ElMessage({
          message: `设置导航点成功，当前目标点：${
            this.positionsList.find((i) => i.id === destPosition).type
          }`,
          type: "success",
        });
        this.startPolling();
      }
    },
    async getNavResultAndPosition() {
      // 轮询状态接口 如果接收到数据则说明导航结束了，停止轮询
      this.getRobotInfo();
      const res = await getNavigationResultApi();
      if (res.requestId === this.currentNavRequestId) {
        // 请求id校验
        this.navResult = res;
      }
    },
    async controlArm(validParam, action, status, flag) {
      await ctrlArmApi({ validParam, [action]: status, armIndex: 0 });
      if (flag == "flag") {
        // this.startLoading()
        this.dialogVisible = true;
      }
      //TODO 这里应该查询/轮询机器人状态？
    },
    startPolling() {
      this.polling = setInterval(() => {
        this.getNavResultAndPosition();
      }, 1000); //1秒查询一次
    },
  },
  beforeUnmount() {
    clearTimeout(this.timer);
    this.timer = null;
  },
  mounted() {
    // 机器人初始信息通过父组件传过来 避免第一次加载地图可能点渲染不上
    clearTimeout(this.timer);
    this.timer = null;
    this.mySetInterval();
  },
  watch: {
    navResult(newVal, oldVal) {
      // 轮询状态 如果接收到数据则说明导航结束了，停止轮询
      if (newVal) {
        ElMessage({
          message: `导航已经结束，当前状态：${codeMessage[newVal.errCode]}`,
          type: "success",
        });
        clearTimeout(this.polling);
        this.polling = null;
      }
    },
    robotInfo(newVal, oldVal) {
      // console.log("new",newVal)
      this.robotInfo = newVal;
      if (newVal.armPowerOn && !oldVal.armPowerOn) {
        this.dialogVisible = false;
        // this.endLoading(this.startLoading())
        // this.startLoading().close()
      }
    },
  },
};
</script>

<style scoped lang='scss'>
.box {
  width: 100%;
  display: flex;
  margin: 0 auto;
  .task-button {
    width: 261px;
    height: 147px;
    background: linear-gradient(180deg, #f2f8ff 0%, #ffffff 112.66%);
    box-shadow: 0px 0px 5px rgba(184, 190, 217, 0.5);
    border-radius: 20.0355px;
    border: 2px solid #9abdf8;
    margin-left: 40px;
    margin-top: 50px;
    text-align: center;
    line-height: 147px;
    font-size: 20px;
  }
}
.meal-box {
  width:95%;
  height: 236px;
  background: #ffffff;
  border: 1px solid #b8bed9;
  box-sizing: border-box;
  border-radius: 16px;
  margin: 0 auto;
  margin-top: 40px;
  font-size: 20px;
  .one {
    margin:20px 0 0 20px
  }
  .two {
    // line-height: 200px;
    text-align: center;
    margin-top: 50px;
  }
}
</style>