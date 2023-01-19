<template>
  <div class="game-container">
    <iframe
      ref="gameInstance"
      width="100%"
      height="505px"
      scorlling="no"
      border="0"
      src="/VKBuild/index.html"
      frameborder="0"
    />
    <slot :instance="$refs"></slot>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  props: {
    showController: {
      type: Boolean,
      default: true,
    },
    captureKey: {
      type: Boolean,
      default: true,
    },
    classify: {
      type: String,
      default: "",
    },
    bbox: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isStreaming: false,
      boxes: [],
    };
  },
  created() {},
  mounted() {
    if (this.captureKey) {
      this.$refs.gameInstance.contentWindow.addEventListener(
        "keyup",
        this.onKey.bind(this)
      );
    }
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      return "SIM";
    }
  },
  watch: {
    bbox: function (newValue) {
      if (newValue && newValue.length) {
        this.boxes = newValue.map((el) => {
          let cWidth = this.$refs.boxContainer.clientWidth / 320;
          let cHeight = this.$refs.boxContainer.clientHeight / 240;
          return {
            x1: el.left * cWidth,
            y1: el.top * cHeight,
            x2: el.right * cWidth,
            y2: el.bottom * cHeight,
            label: el.class,
            prob: el.score,
          };
        });
      }
    },
  },
  methods: {
    onKey(e) {
      if (e.key == "f") {
        this.$emit("snap");
      }
    },
    base64toBlob(base64Data, contentType = "image/jpeg") {
      contentType = contentType || "";
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
    },
    getImageBase64() {
      return this.$refs.gameInstance.contentWindow.ImageBase64();
    },
    async snap() {
      let image = await this.captureWithTumbnail();
      return image;
    },
    async captureWithTumbnail(thumbnail_height = 120) {
      let res = this.$refs.gameInstance.contentWindow.ImageBase64();
      //res = "data:image/jpeg;base64," + res;
      //let b = await fetch(res);
      //let image = await b.blob();
      let image = this.base64toBlob(res);
      return {
        image: image,
        thumbnail: image,
        width: 320,
        height: 240,
      };
    },
  },
};
</script>
<style scoped>
.game-container {
  background-color: #231f20;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
.display-controller {
  pointer-events: none;
  position: absolute;
  width: 100%;
  border: solid green 1px;
  top: 50%;
  aspect-ratio: 16 / 9;
  transform: translateY(-50%);
}
.classify-result {
  width: 100%;
  bottom: 0;
  position: absolute;
  text-align: center;
  color: white;
  background-color: #00000057;
}
.game-controller {
  position: absolute;
  bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  left: 50%;
  transform: translate(-50%, -50%);
}
.bboxes {
  width: 24%;
  height: 32%;
  right: 0;
  position: absolute;
  aspect-ratio: 4 / 3;
}
.bbox {
  display: block;
  position: absolute;
  border-width: 2px;
  border-color: green;
  border-style: solid;
}
.label-box {
  color: black;
  font-size: 11px;
  background-color: #fff;
}
</style>