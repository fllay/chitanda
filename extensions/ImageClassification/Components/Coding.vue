<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div class="d-flex flex-fill flex-row" style="background-color: white">
          <blockly-code
            ref="blockly"
            :style="{ width: currentDevice == 'BROWSER' ? '50%' : '60%' }"
            :toolbox="toolbox"
            :blocks="blocks"
            :language="currentDevice == 'BROWSER' ? 'javascript' : 'python'"
          ></blockly-code>
          <simulator-controller
            v-if="currentDevice == 'BROWSER'"
            style="width: 50%"
            ref="simulator"
            :showController="false"
            :captureKey="false"
            :classify="result"
          ></simulator-controller>
          <div v-else-if="currentDevice == 'ROBOT'" style="width: 40%; display: flex; align-items: center;">
            <img v-if="isRunning" style="width:100%" :src="`${streamUrl}?topic=/output/image_detected&type=ros_compressed`">
            <img v-else style="width:100%" :src="`${streamUrl}?topic=/output/image_raw&type=ros_compressed`">
          </div>
        </div>
        <div style="height: 200px; display: flex">
          <div
            style="
              width: 100%;
              height: 100%;
              padding: 5px;
              background-color: black;
            "
            id="terminal"
            ref="terminal"
          ></div>
          <div
            style="
              width: 200px;
              height: 100%;
              text-align: center;
              padding-top: 46px;
              background-color: black;
            "
          >
            <div class="button">
              <button pill v-on:click="handleRun" class="btn-run op-btn">
                <span class="ico">
                  <img
                    v-if="!isRunning"
                    src="~/assets/images/UI/svg/Group 80.svg"
                  />
                  <img v-else src="~/assets/images/UI/svg/Group 82.svg" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import SimulatorController from "~/components/InputConnection/SimulatorController.vue";
import BlocklyCode from "@/components/BlocklyCode.vue";
import Toolbox from "../Blocks/toolbox";
import Blocks from "../Blocks/blocks";
import RobotBlocks from "../Blocks/blocks_robot";
import RobotToolbox from "../Blocks/robot_toolbox";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";

import runner from "../classify.worker.js";

export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode,
    SimulatorController,
  },
  data() {
    return {
      socket: null,
      model: null,
      isRunning: false,
      result: "",
      worker: null,
      canvas : null,
      ctx : null,  
    };
  },
  methods: {
    handleRun: async function() {
      if (!this.isRunning) {
        this.isRunning = true;
        await this.run();
      } else {
        this.isRunning = false;
        this.stop();
      }
    },
    getImageData(src){
      return new Promise((resolve,reject)=>{
        //let imgStr = "data:image/jpeg;base64," + this.$refs.simulator.$refs.gameInstance.contentWindow.ImageBase64();
        let image = new Image();
        image.onload = ()=>{
          this.canvas.width = image.width;
          this.canvas.height = image.height;
          this.ctx.drawImage(image,0,0);
          resolve(this.ctx.getImageData(0, 0, image.width, image.height));
        };
        image.src = src;
      });
    },
    async processCommand(event){
      if(event.data.command == "PRINT"){
        this.term.write(event.data.msg);
      }else if(event.data.command == "MOVE"){
        let lin = event.data.lin;
        let ang = event.data.ang;
        this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(lin,ang);
      }else if(event.data.command == "REQUEST"){
        if(event.data.data == "MODEL"){
          let modelInfo = await this.initModel();
          console.log("======== request model ==========");
          console.log(modelInfo);
          this.worker.postMessage({ command : "RESPONSE", subcommand : "MODEL", data: modelInfo});
        }
        if(event.data.data == "IMAGE"){
          let imgStr = "data:image/jpeg;base64," + this.$refs.simulator.$refs.gameInstance.contentWindow.ImageBase64();
          let image = await this.getImageData(imgStr);
          this.worker.postMessage({command : "RESPONSE", subcommand : "IMAGE", data: image});
        }
      }
    },
    onWorkerError(err){
      console.log("worker error : ");
      console.log(err);
      console.log(err.error);
    },
    async initModel() {
      var modelJson = await axios.get(this.project.tfjs);
      var weights = [];
      let baseModelPath = this.project.tfjs.substring(
        0,
        this.project.tfjs.lastIndexOf("/")
      );
      let downloadPromises = [];
      for (let binFile of modelJson.data.weightsManifest[0].paths) {
        let w = axios.get(baseModelPath + "/" + binFile, {
          responseType: "arraybuffer",
        });
        downloadPromises.push(w);
      }
      let downloadedWeight = await Promise.all(downloadPromises);
      weights = downloadedWeight.map((el) => el.data);
      let weightData = this.$helper.concatenateArrayBuffers(weights);
      return {
        modelJson : modelJson.data,
        weight: weightData
      }
    },

    async getLabels() {
      const __label_res = await axios.get(this.project.labelFile);
      const __labels_text = __label_res.data;
      let labels = __labels_text
        .replaceAll("\r", "")
        .split("\n")
        .map((el) => el.trim())
        .filter((el) => el);
      console.log(labels);
      return labels;
    },
    run : async function() {
      if(this.currentDevice == "BROWSER"){
        this.term.write("Running ...\r\n");
        //========== start worker ==============//
        this.worker = new runner();
        this.worker.onerror = this.onWorkerError.bind(this);
        this.worker.onmessage = this.processCommand.bind(this);
        let labels = this.project.modelLabel;
        if(Array.isArray(labels) && !labels.length){
          labels = await this.getLabels();
        }
        //========== load tfjs model ===========//
        this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("1");
        var code = this.project.code;
        var codeAsync = `(async () => {
          ${code}
          this.isRunning = false;
          this.result = [];
        })();`;
        console.log(codeAsync);
        try {
          this.worker.postMessage({ command: "RUN", code: codeAsync, labels : labels });
          //eval(codeAsync);
        } catch (error) {
          console.log(error);
        }
      }else if(this.currentDevice == "ROBOT"){
        try{
          let code = this.project.code;
          let projectId = this.$store.state.project.project.id;
          const res = await axios.post(this.terminalUrl + "/run", {project_id : projectId, code : btoa(code)});
          console.log(res);
        }catch(err){
          console.log(err);
        }
      }
    },
    stop() {
      console.log("stop!!!");
      if(this.currentDevice == "BROWSER"){
        this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
        //========== stop web worker ======//
        //this.worker.onmessage = null;
        this.worker.terminate();
      }else if(this.currentDevice == "ROBOT"){
        try{
          if(this.socket && this.socket.readyState !== WebSocket.CLOSED){
            //this.socket.send(43);
            this.socket.send("CMD:TERM");
          }
        }catch(err){
          console.log(err);
        }
      }
    },
    socket_opened(){
      this.term.write("\r\n*** Connected to backend ***\r\n");
    },
    socked_onclose(event){
      this.term.write(`\r\n*** Disconnected from backend (close cleanly) ***\r\n`);
      if (event.wasClean) {
        this.term.write(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}\r\n`);
      } else {
        this.term.write('[close] Connection died\r\n');
      }
    },
    socket_error(err){
      this.term.write(`[error]`);
    },
    socket_message(event){
      this.term.write(event.data);
    },
    term_onkey(event){
      console.log(event);
    }
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState(["currentDevice", "serverUrl", "streamUrl","terminalUrl","terminalWebsocket"]),
    ...mapState("server", ["url"]),
    blocks(){
      if(this.currentDevice == "BROWSER"){
        return Blocks;
      }else if(this.currentDevice == "ROBOT"){
        return RobotBlocks;
      }
    },
    toolbox(){
      if(this.currentDevice == "BROWSER"){
        return Toolbox;
      }else if(this.currentDevice == "ROBOT"){
        return RobotToolbox;
      }
    }
  },
  mounted() {
    console.log("mounted");
    this.term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    fitAddon.fit();
    console.log("model tfjs path : ", this.project.tfjs);
    if(this.currentDevice == "BROWSER"){
      this.term.write("$ ");
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
    }else if(this.currentDevice == "ROBOT"){
      try{
        this.socket = new WebSocket(this.terminalWebsocket);
        this.term.write("$ ");
        this.socket.onopen = this.socket_opened.bind(this);
        this.socket.onmessage = this.socket_message.bind(this);
        this.socket.onclose = this.socked_onclose.bind(this);
        this.socket.onerror = this.socket_error.bind(this);
        this.term.onKey(key => {
          const char = key.key;
          if(this.socket && this.socket.readyState !== WebSocket.CLOSED){
            this.socket.send(char);
          }
        });
      }catch(err){
        this.term.write("ERROR : Cannot connect to server\r\n");
        this.term.write(err.message+"\r\n");
      }
    }
  },
  beforeUnmount(){
    this.socket.close();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

ul {
  list-style: none;
  padding: 0;
}
.button {
  .btn-run {
    img {
      width: 100px;
    }
  }

  .btn-stop {
    img {
      width: 100px;
    }
  }
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.main-panel {
  width: calc(100% - 300px);
}

.blockly-module {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  .blockly {
    height: 100%;
    width: 100%;
  }

  .side-panel {
    padding: 15px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 300px;
    text-align: end;

    .btn-run {
      img {
        width: 100px;
      }
    }

    .btn-stop {
      img {
        width: 100px;
      }
    }

    .display-panel {
      border-radius: 8px;
      background-color: #333;
      overflow: hidden;
      border: #adb5bd solid 1px;

      .display-image {
        img {
          min-height: 180px;
          height: 180px;
          width: 100%;
          object-fit: cover;
        }
      }

      .control {
        background-color: #ffffff;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        text-transform: uppercase;

        .check {
          padding-left: 36px;
          font-size: 0.7rem;
          color: #222222;
          display: flex;
          align-items: center;
        }
      }
    }

    .next {
      height: 50px;
      background: #ffffff 0% 0% no-repeat padding-box;
      border-radius: 38px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-top: 15px;

      span {
        color: $primary-color;
        font-size: 1.5rem;
        font-weight: 800;

        &.ico {
          position: absolute;
          top: 7px;
          right: 18px;
        }
      }
    }
  }
}
#expanded-camera {
  .result {
    height: 20vh;
    .bg-secondary {
      height: 100%;
    }
  }
  .display-image {
    background-color: #333 !important;
    img.realtime-image {
      width: 100%;
      height: 55vh;
      object-fit: contain;
    }
  }
  .control {
    background-color: #ffffff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    text-transform: uppercase;

    .check {
      padding-left: 36px;
      font-size: 0.7rem;
      color: #222222;
      display: flex;
      align-items: center;
    }
  }
}
</style>
<style lang="scss" scoped>
button {
  color: unset;
  border: unset;
  background-color: unset;
  text-align: left;
  position: relative;

  &::after {
    position: absolute;
    top: 17px;
    right: 15px;
  }
}

.custom-control-label::before {
  top: 0 !important;
}

.custom-control-label::after {
  top: 2px !important;
}

.custom-control-input:checked ~ .custom-control-label::before {
  color: #333;
  border-color: #333;
  background-color: #333;
}

.train-pgr {
  border: none !important;
}

.scroll-box {
  height: 200px;
  overflow-y: scroll;
  text-align: left;
  padding: 20px !important;
  background-color: #333 !important;
  display: flex;
  flex-direction: column-reverse;
}

//.modal-footer {
//    display: none !important;
//}
</style>