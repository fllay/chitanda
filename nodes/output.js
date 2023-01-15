export default {
  name: "Output",
  input: [
    {
      name: "input",
      accept: ["tensor"],
    },
  ],
  options: [
    {
      name: "validate_matric",
      description: "Criteria metric to save data",
      options: ["val_accuracy", "recall", "mAP", "val_loss"], //[{text:"xx",value:"yyy"}]
      type: "string",
      default: "accuracy",
    },
  ],
  generator: (n) => {
    return '{"name" : "output", "save_on": "${validate_matric}"}';
  },
};
