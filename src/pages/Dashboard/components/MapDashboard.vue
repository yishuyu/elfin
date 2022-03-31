<template>
  <div>
    <div>
      <div>
        <div class="map-header">
          <div>
            <span>地图列表</span>
            <el-select
              v-model="currentMap"
              class="m-2"
              placeholder="Select"
              size="large"
              style="margin-left: 10px"
            >
              <el-option
                v-for="(item, index) in mapList"
                :key="index"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-button type="primary" @click="changeMap">切换地图</el-button>
          </div>
          <div>
            当前地图：{{
              this.robotInfo.map ? this.robotInfo.map : "暂无"
            }}&nbsp;&nbsp;&nbsp;
          </div>
          <div class="map-footer">
            <span>目标站点</span>
            <el-select
              v-model="selectedPosition"
              class="m-2"
              placeholder="Select"
              size="large"
              style="margin-left: 10px"
            >
              <el-option
                v-for="item in positionsList"
                :key="item.id"
                :label="item.id"
                :value="item.id"
              />
            </el-select>
            <el-button type="primary" @click="onNavClick">导航</el-button>
            <el-button type="primary" @click="rediretorPosition"
              >重定位</el-button
            >
          </div>
          <el-dialog v-model="dialogVisible" title="Tips" width="30%">
            <span>确认切换地图吗？</span>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="comfireModel">确认</el-button>
              </span>
            </template>
          </el-dialog>
          <!-- <div
            v-for="(i, index) in mapList"
            :key="i"
            @click="onMapSWitchClick(i)"
            :class="currentMap === i ? 'map-radio select' : 'map-radio'"
            :style="{
              marginBottom: index === mapList.length - 1 ? 0 : '5px',
            }"
          >
            {{ i }}
          </div> -->
        </div>
      </div>
      <div
        className="map-container"
        id="map-container"
        @touchstart="mapstart"
        @touchmove="mapmove"
        @touchend="mapend"
      >
        <!--  :width="canvasWidth"
          :height="canvasHeight" -->
        <canvas
          id="map"
          :width="canvasWidth"
          :height="canvasHeight"
          style="border: 1px solid #ccc"
        ></canvas>
        <div class="btn-box">
          <div @click="bigCanvas"><img src="@/assets/images/big.png" /></div>
          <div @click="littleCanvas">
            <img src="@/assets/images/little.png" />
          </div>
          <div @click="resetCanvas">
            <img src="@/assets/images/reset.png" />
          </div>
        </div>
        <div class="state-box">
          <ul>
            <li>机械臂状态：{{ armState }}</li>
            <li>AGV状态：{{ agvState }}</li>
            <li>机械臂处于原点：{{ robotInfo.armInHomePose ? "是" : "否" }}</li>
            <li>定位是否准确：{{ robotInfo.locationCorrect ? "是" : "否" }}</li>
            <li>软急停开启：{{ robotInfo.softEmergency ? "是" : "否" }}</li>
            <li>硬件急停按钮按下：{{ robotInfo.estop ? "是" : "否" }}</li>
            <li>前方阻挡：</li>
            <li>当前电量：{{ Number(robotInfo.power) * 100 }}%</li>
          </ul>
          <el-dialog v-model="dialogPositionVisible" title="Tips" width="30%">
            <span>定位是否准确？</span>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogPositionVisible = false">否</el-button>
                <el-button type="primary" @click="comfirePositionModel"
                  >是</el-button
                >
              </span>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>

    <!-- <div className="right-area">
        <RobotOperation
          :positionsList="positionsList"
          :drawPoint="drawPoint"
          :calculatePointPosition="calculatePointPosition"
          :initRobotInfo="robotInfo"
        />
      </div> -->
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { ElMessage } from "element-plus";
import { toRaw } from "@vue/reactivity";
import RobotOperation from "./RobotOperation.vue";
import { armStateEnum } from "./enum";
import { agvStateEnum } from "./enum";
import {
  getMapList,
  switchMap,
  getMapInfo,
  getPositions,
  robotlocationConfirm,
  // registerCallbackApi,
} from "@/service/map";
import { getRobotInfoApi, robotNavigationApi } from "@/service/robot";
export default {
  name: "MapDashboard",
  // eslint-disable-next-line vue/no-unused-components
  components: { RobotOperation },
  data() {
    return {
      // 0:未知位置 1：定位不准确 2：定位准确
      // 0变1  2变1 都进行弹框 点是1-2
      flag: 0,
      timer: null,
      pos: {},
      dialogPositionVisible: false,
      dialogVisible: false,
      selectedPosition: "",
      defaultMap: "",
      logo: require("@/assets/logo.png"),
      robotLogo: require("@/assets/images/robot.png"),
      canvasWidth: 1000, //1200
      canvasHeight: 500, //600
      imgScale: 1, // 图片启示的缩放大小
      count: 0, // 用来记录机器人的位置是否连续5次一样，5次一样的话停止轮询
      mapList: [],
      currentMap: "",
      mapLoading: false,
      mapInfo: {},
      positionsList: [],
      robotInfo: {},
      positionType: {
        NAV_POS_TYPE: "导航点位",
        PARK_POS_TYPE: "停车点位",
        CHARGE_POS_TYPE: "充电点位",
        ACTION_POS_TYPE: "工作点位",
      },
      canvasCtx: "",
      agvState: "",
      armState: "",
    };
  },
  methods: {
    mapstart(event) {
      console.log("touchstart", event);
      this.pos = { x: event.clientX, y: event.clientY };
    },
    mapmove(evt) {
      console.log("touchmove", evt);
      var x = (evt.clientX - this.pos.x) * 2;
      var y = (evt.clientY - this.pos.y) * 2;
      this.clearCanvas();
      this.getMapInfo(this.currentMap); //重新绘制图片
    },
    mapend() {
      console.log("touchend");
    },
    initCanvasEvent() {
      var canvas = this.map;
      canvas.touchstart = function (event) {
        console.log("event", event);
        console.log("touchstart");
        var pos = { x: event.clientX, y: event.clientY }; //坐标转换，将窗口坐标转换成canvas的坐标
        canvas.touchmove = function (evt) {
          //移动
          console.log("touchmove");
          canvas.style.cursor = "move";

          var x = (evt.clientX - pos.x) * 2;
          var y = (evt.clientY - pos.y) * 2;
          this.clearCanvas();
          this.getMapInfo(this.currentMap); //重新绘制图片
        };
        canvas.touchend = function () {
          console.log("touchend");
          canvas.touchmove = null;
          canvas.touchend = null;
          canvas.style.cursor = "default";
        };
      };
    },
    comfirePositionModel() {
      this.flag = 2
      robotlocationConfirm().then((res) => {
        if (res.code == 0) {
          this.dialogPositionVisible = false;
        }
      });
    },
    //todo 重定向
    rediretorPosition() {},
    bigCanvas() {
      this.imgScale *= 1.1;
      this.clearCanvas();
      this.getMapInfo(this.currentMap);
    },
    littleCanvas() {
      this.imgScale *= 0.9;
      this.clearCanvas();
      this.getMapInfo(this.currentMap);
    },
    resetCanvas() {
      this.imgScale = 1;
      this.clearCanvas();
      this.getMapInfo(this.currentMap);
    },
    changeMap() {
      this.dialogVisible = true;
    },
    comfireModel() {
      //确认切换地图
      this.clearCanvas();
      this.getMapInfo(this.currentMap);
    },
    startPolling() {
      this.polling = setInterval(() => {
        this.getMapInfo(this.currentMap);
      }, 3000); // 3秒查询一次
    },
    async onNavClick() {
      if (this.selectedPosition) {
        const res = await robotNavigationApi({
          destPosition: this.selectedPosition,
          cmd: 0,
        });
        const { data, code } = res;
        // this.currentNavRequestId = data.requestId;
        if (code === 0) {
          ElMessage({
            message: `导航开始，当前目标点：${
              this.positionsList.find((i) => i.id === this.selectedPosition)
                .type
            }`,
            type: "success",
          });
          this.startPolling();
        }
      } else {
        ElMessage({
          message: `请先选择一个导航点`,
          type: "warning",
        });
      }
    },
    async getCurrentRobotInfo() {
      const { data } = await getRobotInfoApi();
      this.robotInfo = data;
      this.armState = armStateEnum[data.armState];
      this.agvState = agvStateEnum[data.agvState];
      this.flag = data.locationCorrect?"2":"1"
      if (!data.locationCorrect && this.flag==0) {
        this.dialogPositionVisible = true;
      }
      // if (data.map == this.currentMap) {
      const { x, y } = this.calculatePointPosition(data.x, data.y);
      // 渲染机器人位置
      // console.log("渲染", x, y);
      // console.log("this.robotInfo333", this.robotInfo.robotId);
      this.drawPoint(
        this.robotInfo.robotId,
        this.robotLogo,
        x,
        y,
        40,
        this.robotInfo.angle
      );
      // }
    },
    async getMapList() {
      const { data } = await getMapList();
      console.log("getMapList", data);
      this.mapList = data.mapList;
      this.currentMap = data.currentMap;
      return data.mapList;
    },
    async getMapInfo(mapName) {
      const { data } = await getMapInfo({
        mapName,
        containPixelData: true,
      });
      console.log("MapInfo", data);
      this.mapInfo = data;
      // 获取到地图数据后渲染地图和相关位置点
      if (this.mapList.length > 0) {
        // let realWidth = data.width/data.resolution
        // let realHeight = data.height/data.resolution
        // let rate = realHeight/realWidth
        this.canvasWidth = data.width / data.resolution;
        this.canvasHeight = data.height / data.resolution;
        this.dialogVisible = false;
        this.drawMap(data.mapUrl, () => {
          this.getMapPositions();
        });
      }
    },
    async getMapPositions() {
      const { data } = await getPositions();
      console.log("========getMapPositions", data);
      this.positionsList = data.posArray;
      this.getCurrentRobotInfo();
      data.posArray.forEach((item) => {
        const { x, y } = this.calculatePointPosition(item.x, item.y);
        // 渲染地图上的点
        this.drawPoint(item.id, this.logo, x, y, 20, item.r);
      });
    },
    getCanvasCtx() {
      const map = document.getElementById("map");
      const ctx = map.getContext("2d");
      this.canvasCtx = ctx;
    },
    clearCanvas() {
      // TODO 目前是清空整个canvas重绘 后续可以针对某个点清空重绘？
      this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    drawMap(mapUrl, onImageLoadCallback) {
      const img = new Image();
      img.src = mapUrl;
      //  加载图片
      img.onload = () => {
        if (img.complete) {
          this.canvasCtx.drawImage(
            img,
            0,
            0,
            this.canvasWidth * this.imgScale,
            this.canvasHeight * this.imgScale
          );
          if (onImageLoadCallback) {
            onImageLoadCallback();
          }
        }
      };
    },
    async onMapSWitchClick(map) {
      const { code } = await switchMap({ mapName: map });
      if (code === 0) {
        this.currentMap = map;
      }
    },
    calculatePointPosition(x, y) {
      // 给的是地图左下角的点，canvas原点在左上角
      console.log("机器人", x, y);
      let origin = {
        x: this.mapInfo.leftBottomX,
        y: this.mapInfo.leftBottomY,
      };
      return {
        x: ((x - origin.x) / this.mapInfo.resolution) * this.imgScale,
        y: ((y - origin.y) / this.mapInfo.resolution) * this.imgScale,
      };
    },
    drawPoint(text, logoUrl, x, y, dottedSize, rotate) {
      const img = new Image();
      img.src = logoUrl;
      //  加载图片
      img.onload = () => {
        if (img.complete) {
          // this.canvasCtx.rotate((rotate * Math.PI) / 180);
          this.canvasCtx.drawImage(img, x, y, dottedSize, dottedSize);
          //todo 机器人旋转
          // ctx.rotate(45 * Math.PI / 180);
          this.canvasCtx.font = "12px bold 黑体";
          this.canvasCtx.fillText(text, x + dottedSize, y + dottedSize);
          // if (onImageLoadCallback) {
          //   onImageLoadCallback();
          // }
        }
      };
    },
    mySetInterval() {
      this.getCurrentRobotInfo();
      this.timer = setTimeout(() => this.mySetInterval(), 1000);
    },
  },
  mounted() {
    this.getMapList().then((res) => {
      console.log("res", res);
      this.getMapInfo(res[res.length - 1]);
      this.initCanvasEvent();
    });

    clearTimeout(this.timer);
    this.timer = null;
    this.mySetInterval();
    // registerCallbackApi({
    //   robotStatus: "/robotStatus",
    //   resultNotify: "/resultNotify",
    // });
    this.getCanvasCtx();
    this.drawMap(this.defaultMap);
  },
  beforeUnmount() {
    clearTimeout(this.timer);
    this.timer = null;
  },

  watch: {
    // currentMap(newVal) {
    //   this.getMapInfo(newVal);
    // },
    robotInfo(newVal, oldVal) {
      this.robotInfo = newVal;
      // 如果位置五次都一样，停止轮询
      if (newVal.x === oldVal.x && newVal.y === oldVal.y) {
        this.count += 1;
        if (this.count > 5) {
          clearInterval(this.polling);
          this.polling = null;
        }
      }
    },
    flag(newVal, oldVal) {
      if (newVal == 1 && oldVal == 0) {
        this.dialogPositionVisible = true;
      }
      if (newVal == 1 && oldVal == 2) {
        this.dialogPositionVisible = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.map-container {
  width: "100%";
  height: 500px;
}
.dashboard-container {
  display: flex;
  /* justify-content: space-between; */
}
.map-header {
  position: fixed;
  top: 20px;
  width: 1264px;
  height: 80px;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 10px;
  background: #fff;
}
.map-container {
  margin-top: 80px;
}
.map-radio {
  border: 1px solid #f0f0f0;
  padding: 5px 14px;
  cursor: pointer;
}
.map-radio:hover {
  border: 1px solid #adbbff;
  color: #adbbff;
}
.map-radio.select {
  border: 1px solid #6882ff;
  color: #6882ff;
}
.state-box {
  position: absolute;
  top: 115px;
  right: 70px;
  width: 228px;
  height: 500px;
  background: rgba(242, 245, 247, 0.5);
  box-shadow: -2px 0px 4px rgba(0, 0, 0, 0.12);
  border-radius: 6px 0px 0px 6px;
}
.state-box ul {
  list-style: none;
  line-height: 50px;
}
.btn-box {
  position: absolute;
  top: 120px;
  left: 1100px;
  div {
    margin-top: 10px;
  }
}
.el-button.el-button--primary {
  margin-left: 20px;
  margin-right: 20px;
}
</style>