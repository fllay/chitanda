importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");

let dataQueue = [];
let processing = false;
let sourceCode = "";

let __model = null;
let __labels = [];

let __raw_image = "";
let imageFromMain = null;
let __image = null;
let __image_tensor = null;
let __res = null;
let __data = null;
let __maxIndex = 0;

let responseCallback = null;
let responseCommand = new Promise((resolve) => (responseCallback = resolve));
let requestCommand = null;

const requestData = async function (cmd) {
  requestCommand = cmd;
  postMessage({ command: "REQUEST", data: cmd });
  let res = await responseCommand;
  return res;
};

const loadingModel = async function () {
  let modelInfo = await requestData("MODEL");
  __model = await tf.loadLayersModel(
    tf.io.fromMemory(
      modelInfo.modelJson.modelTopology,
      modelInfo.modelJson.weightsManifest,
      modelInfo.weight.weightData
    )
  );
};

const __classify = async function (img) {
  let inputShape = __model.layers[0].inputSpec[0].shape;
  const batched = tf.tidy(() => {
    const normalized = tf.add(tf.mul(tf.cast(img, "float32"), 2 / 255.0), -1); //min -1 to max 1
    let resized = tf.image.resizeBilinear(
      normalized,
      [inputShape[1], inputShape[2]],
      true
    ); //alignCorners = true;
    const batched = tf.reshape(resized, [
      -1,
      inputShape[1],
      inputShape[2],
      inputShape[3],
    ]); //return tf.expandDims(img);
    return batched;
  });
  let res = await __model.predict(batched);
  return res;
};

onmessage = (event) => {
  if (event.data.command == "RUN") {
    sourceCode = event.data.code;
    __labels = event.data.labels;
    if (!processing) {
      processing = true;
      process();
    }
  } else if (event.data.command == "RESPONSE") {
    if (event.data.subcommand == requestCommand) {
      responseCallback(event.data.data);
    }
  } else if (event.data.command == "WRITE") {
    if (event.data.subcommand == "VOICE") {
      imageFromMain = event.data.data;
    }
  }
};

const process = function () {
  try {
    eval(sourceCode);
  } catch (err) {
    postMessage({
      command: "PRINT",
      msg: "ERROR !!! \\r\\n" + err.message,
    });
  }
};
