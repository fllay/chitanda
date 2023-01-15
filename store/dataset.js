import storage from "~/engine/Storage";
//C:\Users\listz\AppData\Local\Microsoft\Edge\User Data\Default
export const state = () => ({
  dataset: {
    project: "", //project id
    datasetType: null, //id of extension
    data: [],
    baseURL: "",
  },
  isLoading: false,
  isSaving: false,
});
// {
//   id: this.$helper.randomString(16),
//   thumbnail: thumbnail,
//   image: image,
//   annotate: [],
//   class: null,
//   ext: "jpg",
// }
export const filter = (mutation) => {
  return mutation.type == "dataset";
};

export const mutations = {
  setDataset(state, dataset) {
    state.dataset = dataset;
  },
  setDatasetData(state, data) {
    state.dataset.data = data;
  },
  addDatasetItems(state, items) {
    state.dataset.data = state.dataset.data.concat(items);
  },
  removeDatasetItem(state, id) {
    state.dataset.data = state.dataset.data.filter((el) => el.id !== id);
  },
  removeDatasetItems(state, ids) {
    state.dataset.data = state.dataset.data.filter(
      (el) => !ids.includes(el.id)
    );
  },
  addDatasetItem(state, item) {
    state.dataset.data.unshift(item);
  },
  addOrUpdateAnnotation(state, { annotation, id }) {
    let ind = state.dataset.data.findIndex((el) => el.id == id);
    if (ind >= 0) {
      let found = state.dataset.data[ind].annotate.findIndex(
        (el) => el.id == annotation.id
      );
      if (found >= 0) {
        let newOne = JSON.parse(
          JSON.stringify(state.dataset.data[ind].annotate)
        );
        newOne[found] = annotation;
        state.dataset.data[ind].annotate = newOne; //make it reactive
      } else {
        state.dataset.data[ind].annotate.push(annotation);
      }
    }
  },
  removeAnnotation(state, { annotationId, id }) {
    let ind = state.dataset.data.findIndex((el) => el.id == id);
    if (ind >= 0) {
      let found = state.dataset.data[ind].annotate.findIndex(
        (el) => el.id == annotationId
      );
      if (found >= 0) {
        state.dataset.data[ind].annotate.splice(found, 1);
      }
    }
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setSaving(state, isSaving) {
    state.isSaving = isSaving;
  },
};
export const getters = {
  dataList: (state) => {
    return state.dataset.data;
  },
  dataLength: (state) => {
    return state.dataset.data.length;
  },
  positionOf: (state) => (item) => {
    return state.dataset.data.findIndex((el) => el.id == item);
  },
  getLabelByIds: (state) => (ids) => {
    if (!ids.length) {
      return [];
    }
    return state.dataset.data
      .filter((el) => ids.includes(el.id))
      .reduce(
        (prev, curr) =>
          curr.class == null || prev.includes(curr.class)
            ? prev
            : [...prev, curr.class],
        []
      );
  },
  getFileExt: (state) => (id) => {
    let found = state.dataset.data.find((el) => el.id == id);
    return found ? found.ext : null;
  },
  getLabeledLength: (state) => {
    return state.dataset.data.filter(
      (el) => el.class != null || el.annotate.length
    ).length;
  },
  getAnnotateById: (state) => (id) => {
    let found = state.dataset.data.find((el) => el.id == id);
    return found ? found.annotate : null;
  },
  getAnnotateByIds: (state) => (ids) => {
    if (!ids.length) {
      return [];
    }
    return state.dataset.data
      .filter((el) => ids.includes(el.id))
      .reduce((prev, curr) => prev.concat(curr.annotate), []);
  },
  projectName: (state) => {
    return state.dataset.project;
  },
  getBaseURL: (state) => {
    return state.dataset.baseURL;
  },
};
const prepareDataset = async (vm, dataset, projectId) => {
  vm.$fs = await storage.newStorage();
  let dirEntry = await storage.createDir(vm.$fs, projectId || dataset.project);
  return dirEntry;
};
export const actions = {
  async createDataset({ dispatch, commit }, dataset) {
    dispatch("clearDataset");
    if (dataset.data == undefined) {
      dataset.data = [];
    }
    let dirEntry = await prepareDataset(this._vm, dataset);
    dataset.baseURL = dirEntry.toURL();
    commit("setDataset", dataset);
  },
  // async addFileToFs({ commit, state, dispatch }, file) {
  //   if (!this._vm.$fs) {
  //     await prepareDataset(this._vm, state.dataset);
  //   }
  //   await storage.writeFile(
  //     this._vm.$fs,
  //     `${state.dataset.project}/${data.id}.${data.ext}`,
  //     data.image
  //   );
  // },
  async exists({ state }, filename) {
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    return storage.exists(this._vm.$fs, filename);
  },
  async addData({ commit, state, dispatch }, data) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    await storage.writeFile(
      this._vm.$fs,
      `${state.dataset.project}/${data.id}.${data.ext}`,
      data.image
    );
    if (data.sound && data.sound_ext) {
      await storage.writeFile(
        this._vm.$fs,
        `${state.dataset.project}/${data.id}.${data.sound_ext}`,
        data.sound
      );
    }
    if (data.mfcc) {
      await storage.writeFile(
        this._vm.$fs,
        `${state.dataset.project}/${data.id}_mfcc.jpg`,
        data.mfcc
      );
    }
    // --- disabled thumbnail for now --- //
    // await storage.writeFile(
    //   this._vm.$fs,
    //   `${state.dataset.project}/${data.id}_thumbnail.jpg`,
    //   data.thumbnail
    // );
    delete data.image;
    delete data.thumbnail;
    delete data.sound;
    delete data.mfcc;
    commit("addDatasetItem", data);
  },
  async addFileToFs({ state }, { projectId, file }) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset, projectId);
    }
    await storage.writeFile(this._vm.$fs, `${projectId}/${file.name}`, file);
  },
  async addDataToFs({ state }, data) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    await storage.writeFile(
      this._vm.$fs,
      `${state.dataset.project}/${data.id}.${data.ext}`,
      data.image
    );
  },
  async addBlobToFs({ state }, { filename, data }) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    await storage.writeFile(
      this._vm.$fs,
      `${state.dataset.project}/${filename}`,
      data
    );
  },
  async getData({ commit, state }, filename) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    return await storage.readFile(
      this._vm.$fs,
      `${state.dataset.project}/${filename}`
    );
  },
  async getDataAsFile({ commit, state }, filename) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    return await storage.readAsFile(
      this._vm.$fs,
      `${state.dataset.project}/${filename}`
    );
  },

  async getURL({ state }, id) {
    return `${state.dataset.baseURL}/${id}.jpg`;
  },
  setDataClass({ commit, state }, { ids, label }) {
    let updatedData = state.dataset.data.map((x) =>
      ids.includes(x.id) ? { ...x, class: label } : x
    );
    commit("setDatasetData", updatedData);
  },
  changeDataClass({ commit, state }, { oldLabel, newLabel }) {
    let updatedData = state.dataset.data.map((x) =>
      x.class === oldLabel ? { ...x, class: newLabel } : x
    );
    commit("setDatasetData", updatedData);
  },
  changeDataClassWhere({ commit, state }, { ids, oldLabel, newLabel }) {
    let updatedData = state.dataset.data.map((x) =>
      ids.includes(x.id) && x.class === oldLabel ? { ...x, class: newLabel } : x
    );
    commit("setDatasetData", updatedData);
  },
  changeDataAnnotation({ commit, state }, { oldLabel, newLabel }) {
    let updateData = state.dataset.data.map((x) => ({
      ...x,
      annotate: x.annotate.map((el) =>
        el.label === oldLabel ? { ...el, label: newLabel } : el
      ),
    }));
    commit("setDatasetData", updateData);
  },
  removeDataAnnotation({ commit, state }, label) {
    let updateData = state.dataset.data.map((x) => ({
      ...x,
      annotate: x.annotate.filter((el) => el.label != label),
    }));
    commit("setDatasetData", updateData);
  },
  removeDataAnnotationWhere({ commit, state }, { ids, label, id }) {
    let updatedData = state.dataset.data.map((x) =>
      ids.includes(x.id)
        ? {
            ...x,
            annotate: x.annotate.filter((el) =>
              label ? el.label != label : id ? el.id != id : true
            ),
          }
        : x
    );
    commit("setDatasetData", updatedData);
  },
  async deleteDatasetItem({ commit, state }, { id, ext }) {
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    commit("removeDatasetItem", id);
    await storage.removeFile(
      this._vm.$fs,
      `${state.dataset.project}/${id}.${ext}`
    );
    // await storage.removeFile(
    //   this._vm.$fs,
    //   `${state.dataset.project}/${id}_thumbnail.${ext}`
    // );
    return true;
  },
  async deleteDatasetItems({ commit, state, rootState }, items) {
    //items = ["id","id"] //only ids
    //check existing vm
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    let selectedItems = state.dataset.data.filter((el) =>
      items.includes(el.id)
    );
    for (let item of selectedItems) {
      await storage.removeFile(
        this._vm.$fs,
        `${state.dataset.project}/${item.id}.${item.ext}`
      );
    }
    commit("removeDatasetItems", items);
    return true;
  },
  async restoreDataset({ commit, state }, dataset) {
    if (!this._vm.$fs) {
      await prepareDataset(this._vm, state.dataset);
    }
    console.log("Restore dataset ...");
    let dirEntry = await storage.getDirectory(this._vm.$fs, dataset.project);
    dataset.baseURL = dirEntry.toURL();
    commit("setDataset", dataset);
  },
  async clearDataset({ commit, state }) {
    console.log("clear dataset : ", state.dataset.project);
    if (state.dataset.project) {
      // check project exist
      console.log("check fs", this._vm.$fs);
      if (!this._vm.$fs) {
        console.log("prepare dataset");
        await prepareDataset(this._vm, state.dataset);
      }
      console.log("remove folder");
      //removeFolder
      let res = await storage.removeFolder(this._vm.$fs, state.dataset.project);
      if (res) {
        this._vm.$fs = null;
      }
    }
  },
};
