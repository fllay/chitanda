<template>
  <div class="left-panel d-flex flex-column">
    <div class="l-title font-weight-bold">KidBright AI</div>
    <main-menu></main-menu>
    <div class="left-bottom-content d-flex flex-fill position-relative">
      <div class="header-left-bar">
        <div class="proj-name">
          {{ project.name }}
        </div>
        <div v-if="project.id" class="proj-type">
          Type : {{ project.projectTypeTitle }}
        </div>

        <div v-if="project.id" class="header-action-button">
          <b-button
            :disabled="currentDevice == 'BROWSER'"
            @click="openWiFiModal"
          >
            <b-icon
              class="mr-1"
              :icon="
                currentDevice == 'BROWSER'
                  ? 'wifi'
                  : currentWifi
                  ? 'wifi'
                  : 'wifi-off'
              "
            ></b-icon>
            {{
              currentDevice == "BROWSER"
                ? isOnline
                  ? "ONLINE"
                  : "OFFLINE"
                : currentWifi
                ? currentWifi.ssid
                  ? currentWifi.ssid
                  : "No Internet"
                : "No Internet"
            }}
          </b-button>

          <b-button
            @click="onToggleDevice"
            :disabled="initialDevice == 'BROWSER'"
          >
            <b-icon
              v-if="currentDevice == 'ROBOT'"
              class="mr-1"
              icon="cpu"
            ></b-icon>
            <b-icon v-else class="mr-1" icon="laptop"></b-icon>
            {{ currentDevice }}
          </b-button>
        </div>
      </div>
      <ul class="step">
        <li
          :class="{
            current: selectedMenu === 1,
            inactive: project.id == null,
          }"
          @click="project.id && handleTabChange(1)"
        >
          <img src="~/assets/images/UI/png/capture.png" alt="" srcset="" />
        </li>
        <li
          v-bind:class="{
            current: selectedMenu === 2,
            inactive: dataLength <= 0,
          }"
          v-on:click="
            if (dataLength > 0) {
              handleTabChange(2);
            }
          "
        >
          <img src="~/assets/images/UI/png/annotate.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 3,
            inactive: getLabeledLength <= 0,
          }"
          @click="
            if (getLabeledLength > 0) {
              handleTabChange(3);
            }
          "
        >
          <img src="~/assets/images/UI/png/train.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 4,
            inactive: currentDevice == 'BROWSER' && !project.tfjs,
          }"
          @click="
            if (project.id && project.tfjs) {
              handleTabChange(4);
            }
          "
        >
          <img src="~/assets/images/UI/png/code.png" alt="" srcset="" />
        </li>
      </ul>
      <div v-if="project.projectType == null" class="hint">
        <div class="main-hint txt notype">
          <p v-if="project.projectType == null">
            เริ่มใช้งานโดยกด
            <img src="~/assets/images/UI/png/Group 105.png" alt="" srcset="" />
            เพื่อสร้างโปรเจคและทำการเลือกประเภทการเรียนรู้
            <span class="p-color">Object Detection</span> หรือ
            <span class="p-color">Image Classification</span
            ><br /><br />ในกรณีที่เลือก
            <span class="p-color">Object Detection</span>
            กระบวนการสร้างโมเดล (Training) ทำบน Colab
            จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน<br /><br />ในกรณีที่เลือก
            <span class="p-color">Image Classification</span>
            กระบวนการสร้างโมเดล (Training) ทำบน KidBright AI
          </p>
        </div>
        <div class="mascot">
          <img
            v-if="!isRunning"
            src="~/assets/images/UI/png/Mask Group 11.png"
            alt=""
            srcset=""
          />
        </div>
      </div>
      <div v-if="selectedMenu === 1" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.capture"
          target="./Instructions/CaptureInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.capture"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 2" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.annotate"
          target="./Instructions/AnnatateInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.annotate"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 3" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.train"
          target="./Instructions/TrainInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.train"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 4" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.coding"
          target="./Instructions/CodingInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.coding"
        ></extension-async-component>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import AsyncComponent from "~/components/AsyncComponent.vue";
import ExtensionAsyncComponent from "~/components/ExtensionAsyncComponent.vue";

export default {
  components: {
    AsyncComponent,
    ExtensionAsyncComponent,
  },
  props: ["selectedMenu"],
  model: {
    prop: "selectedMenu",
    event: "menuChange",
  },
  data() {
    return {
      exts: this.$extensions,
    };
  },
  created() {},
  computed: {
    ...mapState("project", [
      "project",
      "listProjectModal",
      "isLoading",
      "isSaving",
      "labelFile",
    ]),
    ...mapState(["currentDevice", "initialDevice", "isRunning", "currentWifi"]),
    ...mapGetters("dataset", ["dataLength", "getLabeledLength"]),
    isOnline() {
      return window.navigator.onLine;
    },
  },
  methods: {
    ...mapMutations(["setDevice"]),
    openWiFiModal() {
      console.log("connect wifi");
      this.$bvModal.show("wifi_conn");
    },
    handleTabChange(tabIndex) {
      //this.menu = tabIndex;
      this.$emit("menuChange", tabIndex);
    },
    onToggleDevice() {
      if (this.currentDevice == "BROWSER") {
        this.setDevice("ROBOT");
      } else {
        this.setDevice("BROWSER");
      }
    },
  },
};
</script>