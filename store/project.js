import axios from "axios";
import { file } from "jszip";
export const state = () => ({
  project: {
    name: "",
    description: "",
    id: null,
    projectType: null, //id of extension
    lastUpdate: null,
    dataset: [],
    model: null,
    labelFile: "",
    modelLabel: [],
    labels: "",
    pretrained: "",
    tfjs: "",
    edgetpu: "",
    options: {}, // ค่าจาก config options ของโปรเจค
    code: "",
    workspace: "",
    anchors: [],
  },
  projects: [],
  isLoading: false,
  isSaving: false,
});
export const filter = (mutation) => {
  return mutation.type == "project";
};
export const mutations = {
  setProject(state, project) {
    console.log("set project");
    state.project = project;
  },
  setProjects(state, projects) {
    state.projects = projects;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setSaving(state, isSaving) {
    state.isSaving = isSaving;
  },
  addLabel(state, label) {
    if (!state.project.labels.find((el) => el.label == label.label)) {
      state.project.labels.push(label);
    }
  },
  setLabel(state, labels) {
    state.project.labels = labels;
  },
  removeLabel(state, label) {
    state.project.labels = state.project.labels.filter(
      (el) => el.label != label
    );
  },
  changeLabel(state, { oldLabel, newLabel }) {
    let ind = state.project.labels.findIndex((el) => el.label == oldLabel);
    state.project.labels[ind].label = newLabel;
  },
  saveModel(state, model) {
    state.project.model = model;
  },
  savePretrained(state, filename) {
    state.project.pretrained = filename;
  },
  saveTfjs(state, filename) {
    state.project.tfjs = filename;
  },
  saveEdgeTPU(state, filename) {
    state.project.edgetpu = filename;
  },
  saveLabelFile(state, filename) {
    state.project.labelFile = filename;
  },
  saveModelLabel(state, labels) {
    state.project.modelLabel = labels;
  },
  saveAnchors(state, anchors) {
    state.project.anchors = anchors;
  },
  saveCode(state, code) {
    state.project.code = code;
  },
  saveWorkspace(state, ws) {
    state.project.workspace = ws;
  },
};
export const getters = {
  getLabels: (state) => {
    return state.project.labels;
  },
  getModel: (state) => {
    return state.project.model || state.project.extension.model;
  },
};
export const actions = {
  async createProject({ commit, dispatch }, project) {
    commit("setSaving", true);
    commit("setProject", project);
    // init dataset for this project
    let dataset = {
      project: project.id, //project id
      datasetType: project.extension.id, //id of extension
      data: [],
    };
    console.log("call create dataset with", dataset);
    dispatch("dataset/createDataset", dataset, { root: true });
    // ----
    commit("setSaving", false);
  },
  async saveProject(context, project) {
    //save to server
    context.commit("setProject", project);
  },

  async fetchProjects({ commit, rootState }) {
    // fetch project
    try {
      const res = await axios.get(rootState.serverUrl + "/list_project");
      if (res && res.data.result && res.data.result == "OK") {
        console.log("project list = ");
        console.log(res.data.projects);
        // if (Object.keys(res.data.data).length != 0) {
        //   commit("setCurrentWifi", res.data.data);
        // } else {
        //   commit("setCurrentWifi", null);
        // }
        // let projects = [];
        // commit("setProjects", projects);
        return res.data.projects;
      }
    } catch (err) {
      console.log("list project failed ", err);
      return [];
    }
  },
  async saveProject(context) {},
  async deleteProject(context, project) {},
};
