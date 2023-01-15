<template>
  <div>
    <div class="container-fluid vh-100 d-flex main-bg">
      <main-panel v-model="selectedMenu"></main-panel>
      <div class="content-panel d-flex flex-fill">
        <extension-async-component v-if="selectedMenu === 1 && project.extension" :target="project.extension.components.Capture"></extension-async-component>
        <extension-async-component v-else-if="selectedMenu === 2 && project.extension" :target="project.extension.components.Annotate"></extension-async-component>
        <extension-async-component v-else-if="selectedMenu === 3 && project.extension" :target="project.extension.components.Train"></extension-async-component>
        <extension-async-component v-else-if="selectedMenu === 4 && project.extension" :target="project.extension.components.Coding"></extension-async-component>
        <div v-else class="w-100 h-100">
          <b-img style="margin-top: 100px" width="500px" src="~/assets/images/UI/png/Mask Group 12.png" center></b-img>
          <span style="margin-top: 50px; display: block;text-align: center;font-size: 25px;"> สร้างโปรเจคใหม่ หรือ เลือกเมนูด้านซ้ายมือ</span>
        </div>
      </div>
    </div>
    <new-project-modal @success="projectCreated"></new-project-modal>
    <open-project-modal></open-project-modal>
    <delete-project-modal></delete-project-modal>
    <saving-project></saving-project>
    <connect-wifi-modal></connect-wifi-modal>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations  } from 'vuex';
import MainPanel from './MainPanel/MainPanel.vue';
import NewProjectModal from './Modals/NewProjectModal.vue';
import OpenProjectModal from "./Modals/OpenProjectModal.vue";
import DeleteProjectModal from "./Modals/DeleteProjectModal.vue";
import ExtensionAsyncComponent from './ExtensionAsyncComponent.vue';
import SavingProject from './Modals/SavingProject.vue';
import ConnectWifiModal from "./Modals/ConnectWifiModal.vue";

export default {
  components: { 
    MainPanel, 
    NewProjectModal, 
    OpenProjectModal,
    DeleteProjectModal,
    ExtensionAsyncComponent,
    SavingProject,
    ConnectWifiModal
  },
  name : "MainPage",
    data(){
    return {
      selectedMenu: 0,
      loaded: false,
      //url: "http://192.168.88.243:8080/stream?topic=/output/image_detected&type=ros_compressed"
    };
  },
  async created(){
    console.log("web page created");
    await this.getCurrentWifi();
  },
  computed: {
    ...mapState('project', [
      'project',
      'listProjectModal',
      'isLoading',
      'isSaving',
    ]),
    ...mapState(['currentWifi','connectWifiModal','isRunning'])
  },
  methods: {
    ...mapActions(["getCurrentWifi"]),
    projectCreated(project){
      this.selectedMenu = 0;
      this.$nextTick(()=>{
        this.selectedMenu = 1;
      });
    },
  },
  watch:{
    project(project){
      if(!this.selectedMenu && project.id){
        this.selectedMenu = 1;
      }else{
        this.selectedMenu = 0;
      }
    }
  }
}
</script>
<style lang="scss">
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  // margin: 0;
  // padding: 0;
  outline: none;
  box-sizing: border-box;
}

.p-color {
  color: $primary-color;
  font-weight: 800;
}

.p-notice-color {
  color: red;
}

ul {
  list-style: none;
  padding: 0;
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.container-fluid {
  padding: 0;
}

.main-bg {
  background-color: #eeeeee;
}

.content-panel {
  overflow-y: auto;
  width: calc(100% - 320px);
}

.left-panel {
  padding: 8px;
  max-width: 320px;
  width: 320px;
  min-width: 320px;
  overflow-y: auto;

  .l-title {
    color: #06754b;
    font-size: 35px;
    text-align: center;
  }

  .left-bottom-content {
    position: relative;
    background-color: #fff7d6;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    margin: 10px 8px;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    height: calc(100% - 8px - 52px - 65px - 20px);
    overflow: hidden;

    .proj-name {
      display: flex;
      align-items: center;
      margin-bottom: 0px;
      color: #eeeeee;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .proj-type {
      color: #ffff78;
      font-size: 14px;
      margin-bottom: 0.5em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .step {
      display: flex;
      flex-wrap: wrap;
      margin: 10px 0;
      padding: 0 20px;
      width: 100%;
      height: 246px;

      li {
        flex: 1 0 50%;
        padding: 5px;
        opacity: 1;
        filter: sepia(1);
        cursor: pointer;
        transition: opacity 0.3s ease-in, filter 0.3s ease-in;

        &.inactive {
          opacity: 0.7;
          filter: sepia(1) !important;
          cursor: unset !important;
        }

        &.current {
          filter: sepia(0) !important;
        }

        &:hover {
          filter: sepia(0.5);
        }

        img {
          width: 100%;
        }
      }
    }

    .hint {
      width: calc(100% - 20px);
      height: calc(100%);
      margin: 0 10px 10px;
      text-align: left;
      //height: 53%;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      position: relative;
      background: white;
      border-radius: 20px;
      overflow-y: auto;

      &::after {
        content: "";
        position: absolute;
        top: 20px;
        left: 40px;
        width: 75px;
        height: 114px;
        background: url("~/assets/images/UI/svg/light-bulb.svg") center no-repeat;
        background-size: 75px 114px;
        opacity: 0.5;
      }

      // overflow-y: scroll;
      .main-hint {
        padding: 1em;
        z-index: 1;

        // &.notype {
        //   //height: 100%;
        //   //margin-top: 20px;
        // }
      }

      .btn-desc {
        margin-bottom: 10px;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          height: 23px;
          margin-left: -7px;
        }

        span {
          width: 32px;
          display: flex;
          justify-content: center;
          margin-right: 5px;
        }
      }

      p {
        font-size: 0.8rem;

        img {
          height: 30px;
        }
      }
    }

    .mascot {
      width: 100%;
      text-align: center;
      img {
        width: 150px;
      }
    }
  }

  .menu-starter {
    display: flex;
    justify-content: center;
    > div {
      margin: 5px;
    }
  }

  .btn-base {
    width: 55px;
    height: 55px;
    background-position: center center;
    background-size: cover;
    cursor: pointer;

    // &:hover {
    // }

    &.new {
      background-image: url("~/assets/images/UI/png/Group 187.png");
    }

    &.open {
      background-image: url("~/assets/images/UI/png/Group 185.png");
    }

    &.save {
      background-image: url("~/assets/images/UI/png/Group 186.png");
    }

    &.delete {
      background-image: url("~/assets/images/UI/png/Group 188.png");
    }

    &.eject {
      background-image: url("~/assets/images/UI/png/Group 108.png");
    }

    &.import {
      background-image: url("~/assets/images/UI/png/Group 121.png");
      opacity: 0.5;
    }

    &.wifi {
      background-image: url("~/assets/images/UI/png/Group 122.png");
    }
  }
}

.sub-panel {
  background-color: #333333;
  padding: 16px;
  color: white;
  width: 240px;
  max-width: 240px;
}

.container {
  max-width: 100%;
  min-width: 100%;
  max-height: 100%;
  min-height: 100%;
  margin: 0px auto;
  font-size: 0.9em;
  color: #888;
}

#blocklyDiv {
  position: absolute;
  height: 100%;
  width: 100%;
  margin-left: 33.33%;
}

[data-md-tooltip] {
  position: relative;
}

[data-md-tooltip]:before {
  content: attr(data-md-tooltip);
  position: absolute;
  top: 60px;
  left: 50%;
  padding: 8px;
  transform: translateX(-50%) scale(0);
  transition: transform 0.2s ease-in-out;
  transform-origin: top;
  background-color: #fff7d6;
  color: #333;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 400;
  z-index: 9999;
  width: 120%;
  opacity: 1 !important;
  text-align: center;
}

[data-md-tooltip]:hover:before {
  transform: translateX(-50%) scale(1);
  z-index: 9999;
}
</style>
<style lang="scss">
.mode-select {
  .btn {
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
}

::-webkit-scrollbar {
  width: 7px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  // background-color: rgba(0, 0, 0, 0.2);
  background-color: #007e4e;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.mode-select {
  margin: 0;
  margin-bottom: 10px;
  width: 100%;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;

  .btn {
    background-color: #fff;
  }
}

.header-left-bar {
  z-index: 1;
  position: relative;
  display: block;
  background: #007e4e;
  width: 100%;
  padding: 10px 15px;
  height: 102px;
  .header-action-button {
    display: flex;
    button {
      background: #003722;
      border: none;
      font-size: 10px;
      border-radius: 15px;
      text-transform: capitalize;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &:nth-of-type(1) {
        margin-right: 5px;
      }
      // svg {
      //   width: 12px;
      //   height: 12px;
      //   margin-right: 3px;
      // }
    }
    .connection-robot {
      background-color: #1a3700;
      color: #f7ff00;
      svg {
        fill: #f7ff00;
      }
    }
    .connection-computer {
      background-color: #003137;
      color: #00fff6;
      svg {
        fill: #00fff6;
      }
    }
    .text-green {
      color: #00ff77;
      svg {
        fill: #00ff77;
      }
    }
    .inactive {
      color: #517a52;
      svg {
        fill: #517a52;
      }
    }
    .img-icon {
      // width: 1em;
      height: 1em;
    }
  }
}
</style>
