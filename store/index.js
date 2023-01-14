import JSZip from "jszip";
import axios from "axios";

const robotIp =
  location.hostname === "raspberrypi.local" ||
  location.hostname === "192.168.2.1" ||
  //location.hostname === "localhost" ||
  location.hostname.startsWith("192.168.") ||
  location.hostname.startsWith("10.0.");

export const state = () => {
  let hostname = window.location.hostname; //"192.168.1.150";
  return {
    initialDevice: robotIp ? "ROBOT" : "BROWSER",
    currentDevice: robotIp ? "ROBOT" : "BROWSER", //BROWSER, ROBOT , should auto detect
    serverUrl: `http://${hostname}:5000`,
    streamUrl: `http://${hostname}:8080/stream`,
    terminalUrl: `http://${hostname}:8888`,
    terminalWebsocket: `ws://${hostname}:8888`,
    currentWifi: null,
    isRunning: false,
    selectedMenu: 0,
    //------  Image streaming data from Unity
    imageBytes: null,
    //----- save project ------//
    saving: false,
    savingProgress: 0,
    //----- open project ------//
    // opening: false,
    // openingProgress: 0,
  };
};
//---- modal id ----//
//new-project-modal
//open-project-modal
//delete-project-modal
export const mutations = {
  setDevice(state, device) {
    state.currentDevice = device;
  },
  setMenu(state, menu) {
    state.selectedMenu = menu;
  },
  setSaving(state, data) {
    state.saving = data;
  },
  setSavingProgress(state, progress) {
    state.savingProgress = progress;
  },
  setCurrentWifi(state, wifi) {
    state.currentWifi = wifi;
  },
  setImageBytes(state, imageBytes) {
    state.imageBytes = imageBytes;
  },
};

export const actions = {
  async changeDevice(context, deviceType) {
    //do something
    context.commit("setDevice", deviceType);
  },
  async getCurrentWifi({ state, commit }) {
    try {
      const res = await axios.get(state.serverUrl + "/wifi_current");
      if (res && res.data.result && res.data.result == "OK") {
        console.log("current wifi = ");
        console.log(res.data.data);
        if (Object.keys(res.data.data).length != 0) {
          commit("setCurrentWifi", res.data.data);
        } else {
          commit("setCurrentWifi", null);
        }
      }
    } catch (err) {
      console.log("load wifi failed ", err);
    }
  },
  async connectWifi(context, name) {
    //context.commit("setWiFi", name);
    //context.commit("setConnectWifiModal", false);
  },
  async saveProject({ commit, dispatch, state, rootState }) {
    commit("setSaving", true);
    commit("setSavingProgress", 0);
    let that = this;
    if (state.currentDevice == "BROWSER") {
      let zip = new JSZip();
      zip.file("project.json", JSON.stringify(rootState));
      //---------- save dataset raw ------------//
      let rawDataset = zip.folder("raw_dataset");
      let datasets = rootState.dataset.dataset.data;
      for (let [i, data] of datasets.entries()) {
        let filename = data.id + "." + data.ext;
        let fileData = await dispatch("dataset/getDataAsFile", filename);
        rawDataset.file(filename, fileData);
        if (rootState.project.project.projectType === "VOICE_CLASSIFICATION") {
          let wavFile = data.id + "." + data.sound_ext;
          let wavData = await dispatch("dataset/getDataAsFile", wavFile);
          rawDataset.file(wavFile, wavData);
          let mfccFile = data.id + "_mfcc.jpg";
          let mfccData = await dispatch("dataset/getDataAsFile", mfccFile);
          rawDataset.file(mfccFile, mfccData);
        }
        let progress = ((i + 1) / datasets.length) * 100;
        commit("setSavingProgress", progress - 5);
      }
      //---------- tfjs -----------//
      if (rootState.project.project.tfjs) {
        let modelJsonFile = await dispatch(
          "dataset/getDataAsFile",
          "model.json"
        );
        let jsonText = await modelJsonFile.text();
        let modelJson = JSON.parse(jsonText);
        zip.file("model.json", modelJsonFile);
        commit("setSavingProgress", 95);
        for (let binFileName of modelJson.weightsManifest[0].paths) {
          let binFile = await dispatch("dataset/getDataAsFile", binFileName);
          zip.file(binFileName, binFile);
        }
      }
      commit("setSavingProgress", 96);
      // //---------- model h5 ----------//
      // if (rootState.project.project.pretrained) {
      //   console.log("save model.h5");
      //   let modelH5File = await dispatch("dataset/getDataAsFile", "model.h5");
      //   zip.file("model.h5", modelH5File);
      // }
      // commit("setSavingProgress", 97);
      //---------- model edge tpu --------//
      if (rootState.project.project.edgetpu) {
        let modelEdgeTpu = await dispatch(
          "dataset/getDataAsFile",
          "model_edgetpu.tflite"
        );
        zip.file("model_edgetpu.tflite", modelEdgeTpu);
      }
      commit("setSavingProgress", 98);
      //---------- label txt ----------//
      if (rootState.project.project.labelFile) {
        let labelFileEntry = await dispatch(
          "dataset/exists",
          `${rootState.project.project.id}/labels.txt`
        );
        if (labelFileEntry.isFile === true) {
          let labelFile = await dispatch("dataset/getDataAsFile", "labels.txt");
          zip.file("labels.txt", labelFile);
        }
      }
      commit("setSavingProgress", 99);
      //---------- save output (model) ---------//
      zip
        .generateAsync({
          type: "blob",
          compression: "STORE",
        })
        .then(function (content) {
          that.$helper.downloadBlob("project.zip", content);
        })
        .finally(() => {
          commit("setSaving", false);
        });
    } else if (state.currentDevice == "ROBOT") {
      //sync project instead
      const res = await axios.post(
        state.serverUrl + "/sync_project",
        rootState
      );
      if (res.data && res.data.result && res.data.result == "OK") {
        this.$toast.success("บันทึกโปรเจคเสร็จเรียบร้อย");
        commit("setSaving", false);
      } else if (res.data && res.data.result && res.data.result == "SYNC") {
        //go to sync dataset
        //commit("setSync", true);
        let needed = {
          dataset: res.data.needed || [],
          others: res.data.others || [],
        };
        await dispatch("syncProject", needed);
        commit("setSaving", false);
        this.$toast.success("บันทึกโปรเจคเสร็จเรียบร้อย");
      }
    }
  },
  async syncProject({ commit, dispatch, state, rootState }, request_file) {
    const formData = new FormData();
    for (let needed of request_file.dataset) {
      let dataset_file = await dispatch("dataset/getDataAsFile", needed, {
        root: true,
      });
      formData.append("dataset", dataset_file);
    }
    for (let other of request_file.others) {
      try {
        let file = await dispatch("dataset/getDataAsFile", other, {
          root: true,
        });
        formData.append("other", file);
      } catch (err) {}
    }
    let project_id = rootState.project.project.id;
    formData.append("project_id", project_id);
    console.log("posting : ", state.serverUrl);
    let res = await axios({
      method: "POST",
      url: state.serverUrl + "/upload",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (pg) =>
        commit("setSavingProgress", (pg.loaded / pg.total) * 100 - 1),
    });
    if (res.data && res.data.result && res.data.result == "OK") {
      return true;
    }
  },
  // async openProject(
  //   { commit, dispatch, state, rootState },
  //   { project, files }
  // ) {
  //   commit("setOpening", true);
  //   commit("setOpeningProgress", 0);
  //   let that = this;
  //   if (state.currentDevice == "BROWSER") {
  //     commit("restoreState", projectState);
  //   } else if (state.currentDevice == "ROBOT") {
  //     //TODO : implement here
  //   }
  // },
};
