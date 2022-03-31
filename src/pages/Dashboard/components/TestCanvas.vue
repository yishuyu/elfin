<template>
  <div>
      <canvas ref="bargraphCanvas" :width="canvasWidth" :height="canvasHeight" :style="'width:'+canvasWidth/2+'px;height:'+canvasHeight/2+'px;'"></canvas>
      <div class="img" @click="clickbig"> <img src="@/assets/images/big.png" /></div>
  </div>
</template>

<script>
// import { bigIcon, littleIcon, resetIcon } from "@/icon/index";
  export default {
    name: 'laborImage',
    components: {
        // bigIcon,
        // littleIcon,
        // resetIcon
    },
    data() {
      return {
        canvasWidth: 2400, // 画布大小
        canvasHeight: 1400,
        extraImgList: [
            {url:require("@/assets/images/defaulmap.jpg"), x: 0, y: 0, width: 2400, height: 1400},
            {url:require("@/assets/images/robot.png"), x: 700, y: 100, width: 40, height: 40} ,
        ],
        myCanvas: null,
        ctx: null,
        imgObject: [],
        imgX: 200, // 图片在画布中渲染的起点x坐标
        imgY: 100,
        imgScale: 0.9, // 图片的缩放大小
      }
    },
    mounted() {
      this.myCanvas = this.$refs.bargraphCanvas;
      this.ctx = this.myCanvas.getContext('2d');
      this.loadImg();
      this.canvasEventsInit();
    },
    methods: {
      loadImg() {
        var _this = this;
        let extraImgList = _this.extraImgList;
        let length = extraImgList.length;
        var imageList = [];
        let count = 0;
        //加载背景图片
        // var isBgLoaded = false;
        var img = new Image();
        var bgImg = extraImgList[0];
        img.src = bgImg.url;
        img.onload = () => {
          imageList.push({img: img, x: bgImg.x, y: bgImg.y, width: bgImg.width, height: bgImg.height});
          ++count;
          if(length > 1) {
            //加载剩余图片
            for(let key = 1; key < length; key++) {
              let item = extraImgList[key];
              let extarImg = new Image();
              extarImg.src = item.url;
              extarImg.onload = () => {
                imageList.push({img: extarImg, x: item.x, y: item.y, width: item.width, height: item.height})
                if(++count >= length) {
                  _this.imgObject = imageList;
                  _this.drawImage(imageList);
                }
              }
            }
          } else {
            _this.imgObject = imageList;
             _this.drawImage(imageList);
          }
        }
      },
      drawImage(imgList) {
        var _this = this;
        _this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for(let i = 0; i < imgList.length; i++) {
          _this.ctx.drawImage(
            imgList[i].img, //规定要使用的图片
            _this.imgX + imgList[i].x * _this.imgScale, _this.imgY+ imgList[i].y * _this.imgScale,//在画布上放置图像的 x 、y坐标位置。
            imgList[i].width*_this.imgScale, imgList[i].height*_this.imgScale //要使用的图像的宽度、高度
          );
        }
        // this.ctx.font="15px Arial";
        // this.ctx.fillStyle = "black"
        // this.ctx.fillText("name",this.imgX + 120 * this.imgScale, this.imgY+ 25 * this.imgScale);
      },
      /**
       * 为画布上鼠标的拖动和缩放注册事件
      */
     clickbig(){
         console.log(11111)
          this.imgScale *= 1.1;
          this.drawImage(this.imgObject);
     },
      canvasEventsInit() {
        var _this = this;
        var canvas = _this.myCanvas;

        

       
        canvas.onmousedown = function (event) {
          console.log("onmousedown")
          var imgx = _this.imgX;
          var imgy = _this.imgY;
          var pos = {x:event.clientX, y:event.clientY};  //坐标转换，将窗口坐标转换成canvas的坐标
          canvas.onmousemove = function (evt) {  //移动
           console.log("onmousemove")
            canvas.style.cursor = 'move';

            var x = (evt.clientX - pos.x) * 2 + imgx;
            var y = (evt.clientY - pos.y) * 2 + imgy;
            _this.imgX  = x;
            _this.imgY  = y;
            _this.drawImage(_this.imgObject);  //重新绘制图片
          };
          canvas.onmouseup = function () {
              console.log("onmouseup")
            canvas.onmousemove = null;
            canvas.onmouseup = null;
            canvas.style.cursor = 'default';
          };
        };
  
        canvas.onmousewheel = canvas.onwheel = function (event) {    //滚轮放大缩小
          var wheelDelta = event.wheelDelta ? event.wheelDelta : (event.deltalY * (-40));  //获取当前鼠标的滚动情况
          if (wheelDelta > 0) {
              _this.imgScale *= 1.1;
          } else {
              if(_this.imgScale > 0.9) {
                 _this.imgScale *= 0.9;
              }
          }
          _this.drawImage(_this.imgObject);   //重新绘制图片
          event.preventDefault  && event.preventDefault();
          return false;
        };
      },
    },
  }
</script>
<style scoped>
.img{
    position: absolute;
    right:200px;
    top: 100px;
}
</style>