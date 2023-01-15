export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_classification_init_model"] = {
    init: function () {
      this.appendDummyInput().appendField("initial model");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_init_model"] = function (block) {
    var code = `await initModel();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("classify image");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_classification_classify"] = function (block) {
    var code = `await classify();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_get_class_name"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class name");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_name"] = function (block) {
    var code = "__labels[__maxIndex]";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks["tfjs_classification_get_class_prob"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class probability");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_prob"] = function (block) {
    var code = "__data[__maxIndex]";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_classification_get_class_index"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class index");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_index"] = function (block) {
    var code = "__maxIndex";
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
    var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
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
    var value_text = Blockly.JavaScript.valueToCode(
      block,
      "text",
      Blockly.JavaScript.ORDER_NONE
    );
    var code = `postMessage({command:"PRINT", msg : ${value_text}+"\\r\\n"});\n`;
    return code;
  };
};
