<template>
  <div class="source-streamer-container d-flex align-items-center justify-content-center">
    <div class="center-streamer">
      <div class="config-camera-float-button">
        <b-avatar
          v-if="captureDevices.length > 1"
          icon="arrow-repeat"
          :size="32"
          button
          @click="nextCamera"
        ></b-avatar>
      </div>
      <vue-web-cam
        v-show="deviceType == 'WEBCAM'"
        width="auto"
        :height="height"
        ref="webcam"
        @cameras="onCameras"
        @started="onStarted"
        @stopped="onStoped"
        :deviceId="captureDevice"
      />
      <div v-show="deviceType == 'STREAM' || deviceType == 'UPLOAD' || deviceType == 'SIM'" class="sim-display">
        <canvas width="320" height="240" id="streamCanvas" ref="displayCanvas" class="resizable-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  components:{
  },
  props: {
    source: {
      type: Object,
    },
    height: {
      type: Number,
      default: 220,
    }
  },
  data() {
    return {
      captureDevices: ["SIM", "UPLOAD"],
      currentCaptureDeviceIndex: 0,
      
      uploadImage : null,
      imageUrl: "",
      streamingUrl: "/images/streaming.jpg",
      simImage : null,
      
      looper : null,
      canvas: null,
      ctx:null,
    };
  },
  mounted(){
    this.looper = setInterval(this.loopGetImageStream.bind(this), 500);
    this.canvas = document.getElementById("streamCanvas");
    this.ctx = this.canvas.getContext("2d");
  },
  beforeDestroy(){
    clearInterval(this.looper);
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      let curr = this.captureDevices[this.currentCaptureDeviceIndex];
      if(!curr){
        return "WEBCAM"
      }else if(curr == "STREAM"){
        return "STREAM";
      }else if(curr == "SIM"){
        return "SIM";
      }else if(curr == "UPLOAD"){
        return "UPLOAD";
      }else if(curr.length == 64 && !curr.startsWith("http")){
        return "WEBCAM";
      }
    },
    captureDevice(){
      if(Array.isArray(this.captureDevices) && this.captureDevices.length > 0){
        return this.captureDevices[this.currentCaptureDeviceIndex];
      }else{
        return null;
      }
    }
  },
  methods: {
    loopGetImageStream(){
      if(this.source.instance.gameInstance && this.deviceType == "SIM"){
        let imgStr = "data:image/jpeg;base64," + this.source.instance.gameInstance.contentWindow.ImageBase64();
        let image = new Image();
        image.onload = ()=>{
          this.canvas.width = image.width;
          this.canvas.height = image.height;
          this.ctx.drawImage(image,0,0);
        };
        image.src = imgStr;
      }
    },
    changeStreamSource(event){
      this.streamingUrl = event;
    },
    onImageUpload(event){
      this.uploadImage = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (e)=>{
        this.imageUrl = e.target.result;
      }
      reader.readAsDataURL(this.uploadImage);
    },
    onCameras(devices) {
      this.captureDevices = [...this.captureDevices, ...devices.map(el=>el.deviceId)];
      this.currentCaptureDeviceIndex = 0;
      console.log("capture devices : ", devices.length);
    },
    onStarted() {
      this.$emit("started");
    },
    onStoped() {
      this.$emit("stoped");
    },
    nextCamera() {
      this.currentCaptureDeviceIndex++;
      if (this.currentCaptureDeviceIndex >= this.captureDevices.length) {
        this.currentCaptureDeviceIndex = 0;
      }
      console.log(
        "change camera to : ",
        this.captureDevices[this.currentCaptureDeviceIndex]
      );
      // webcam 
      if(this.deviceType == "WEBCAM"){
        this.$refs.webcam.changeCamera(
          this.captureDevices[this.currentCaptureDeviceIndex]
        );
      }
      if(this.deviceType == "SIM"){
        this.canvas = document.getElementById("streamCanvas");
        this.ctx = this.canvas.getContext("2d");
      }
      if(this.deviceType == "UPLOAD"){
        this.canvas = document.getElementById("streamCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(0,0,300,300);
        this.ctx.font = "22px Poppins";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = 'white';
        this.ctx.fillText("Click or Drag Image", 150, 150);
        this.ctx.fillText("here to upload", 150, 180);
      }
    },
    capture() {
      if(this.deviceType == "WEBCAM"){
        let canvas = this.$refs.webcam.getCanvas();
        let src = this.$refs.webcam.$refs.video;
        return canvas.getContext('2d').getImageData(0,0,src.videoWidth,src.videoHeight);
      }else if(this.deviceType == "UPLOAD" || this.deviceType == "SIM"){
        let src = this.$refs.displayCanvas;
        return this.ctx.getImageData(0,0, src.width, src.height);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.sim-display{
  display: flex;
  height: 220px;
  position: relative;
  width: 100%;
  flex-direction: column;
}
.resizable-canvas{
  width: auto;
  height: 100%;
}
.image-upload{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.source-streamer-container{
  background-image: url(/images/kanom-see-2.png);
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
  position: relative;
}
.center-streamer {
  position: relative;
  display: flex;
  min-height: 10px;
}
.config-camera-float-button {
  position: absolute;
  right: -45px;
  top: 5px;
}
</style>