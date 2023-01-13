export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_wakeword_detection_init_model"] = {
    init: function () {
      this.appendDummyInput().appendField("initial model");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_wakeword_detection_init_model"] = function (block) {
    var code = `
      postMessage({command:"PRINT", msg : "Loading model\\r\\n"});
      await loadingModel();
      postMessage({command:"PRINT", msg : "Loading labels\\r\\n"});
      postMessage({command:"PRINT", msg : "Label : " + __labels.join(",") + "\\r\\n"});
      let inputShape = __model.layers[0].inputSpec[0].shape;
      postMessage({command:"PRINT", msg : "Model Input Shape : " + inputShape.join(",") + "\\r\\n"});
      postMessage({command:"PRINT", msg : "Preloading model\\r\\n"});
      const zeroTensor = tf.zeros([1, inputShape[1], inputShape[2], inputShape[3]], 'int32');
      const result = await __model.predict(zeroTensor);
      const res = await result.data();
      result.dispose();
      zeroTensor.dispose();
      postMessage({command:"PRINT", msg : "Preload model success\\r\\n"});
      postMessage({command:"PRINT", msg : "Model loaded\\r\\n"});
    `;
    return code;
  };

  Blockly.Blocks["tfjs_wakeword_detection_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("wakeword detect");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_wakeword_detection_classify"] = function (block) {
    var code = `
let image = await requestData("VOICE");
let imageUrl = self.URL.createObjectURL(image);
__image = await load_image(imageUrl);
__image_tensor = await tf.browser.fromPixels(__image);
__res = await __classify(this.model, __image_tensor);
__data = __res.dataSync();
__maxIndex = __res.argMax(1).dataSync()[0];
this.result = __labels[__maxIndex] + " (" + __data[__maxIndex].toFixed(3) + ")";
console("\\rclassify result = " + __labels[__maxIndex] + ", prob = " + __data[__maxIndex].toFixed(3));
    `;
    return code;
  };

  Blockly.Blocks["tfjs_wakeword_detection_get_class_name"] = {
    init: function () {
      this.appendDummyInput().appendField("get wakeword class name");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_wakeword_detection_get_class_name"] = function (
    block
  ) {
    var code = "(__data ? __labels[__maxIndex] : null)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks["tfjs_wakeword_detection_get_class_prob"] = {
    init: function () {
      this.appendDummyInput().appendField("get wakeword class probability");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_wakeword_detection_get_class_prob"] = function (
    block
  ) {
    var code = "(__data ? __data[__maxIndex] : null)";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_wakeword_detection_get_class_index"] = {
    init: function () {
      this.appendDummyInput().appendField("get wakeword class index");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_wakeword_detection_get_class_index"] = function (
    block
  ) {
    var code = "(__data ? __maxIndex : -1)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  //=====================================//

  Blockly.Blocks["move"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Linear velocity")
        .appendField(new Blockly.FieldNumber(0, -0.15, 0.15), "lin")
        .appendField("Angular velocity")
        .appendField(new Blockly.FieldNumber(0, -0.5, 0.5), "ang");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move"] = function (block) {
    var number_lin = block.getFieldValue("lin");
    var number_ang = block.getFieldValue("ang");
    //var code = `this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(${number_lin},${number_ang});\n`;
    var code = `postMessage({ command : "MOVE", lin : ${number_lin}, ang : ${number_ang} });\n`;
    return code;
  };

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(0), "ms")
        .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["delay"] = function (block) {
    var number_ms = block.getFieldValue("ms");
    var code = `await new Promise(r => setTimeout(r,${number_ms}));\n`;
    return code;
  };

  Blockly.Blocks["term_print"] = {
    init: function () {
      this.appendValueInput("text").setCheck(null).appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["term_print"] = function (block) {
    var text = block.getFieldValue("text");
    var code = `postMessage({command:"PRINT", msg : "${text}\\r\\n"});\n`;
    return code;
  };
};
