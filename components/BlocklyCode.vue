<template>
  <div class="blockly" ref="blocklyDiv"></div>
</template>
<script>
/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author samelh@google.com (Sam El-Husseini)
 */
import Blockly, { Block } from "blockly";
import blocklyPython from "blockly/python";
import blocklyJavascript from "blockly/javascript";
import CustomCategory from "./Blocks/CustomBlocklyToolbox";
import Toolbox from "./Blocks/Toolbox";
import BlocklyPythonGenerator from "./Blocks/BlocklyPythonGenerator";
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  name: "Blockly",
  props: {
    toolbox: {
      type: String,
      default: Toolbox,
    },
    language: {
      type: String,
      default: "python",
    },
    blocks: {
      type: Function,
    },
  },
  data() {
    return {
      blockly_workspace: null,
      blockly_xml: null,
    };
  },
  mounted() {
    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      CustomCategory, 
      true
    );
    BlocklyPythonGenerator(Blockly, this);
    if (this.blocks) {
      this.blocks(Blockly, this);
    }
    this.$nextTick(() => {
      const config = {
        toolbox: this.toolbox,
        scrollbars: true,
        css: true,
        grid: {
          spacing: 25,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 4,
          minScale: 0.25,
          scaleSpeed: 1.1,
        },
      };
      this.blockly_workspace = Blockly.inject(this.$refs["blocklyDiv"], config);
      this.blockly_workspace.addChangeListener(this.workspaceUpdate);
      this.setWorkspace(this.project.workspace);
    });
  },
  computed: {
    ...mapState("project", ["project"]),
  },
  methods: {
    ...mapMutations("project", ["saveCode", "saveWorkspace"]),
    setWorkspace(xml) {
      try {
        let dom = Blockly.Xml.textToDom(xml);
        //this.blockly_workspace.clear();
        Blockly.Xml.domToWorkspace(dom, Blockly.mainWorkspace);
      } catch (err) {
        console.log("parse xml error");
        console.log(err);
      }
    },
    workspaceUpdate(event) {
      if (
        event.type == "create" ||
        event.type == "delete" ||
        event.type == "move" ||
        event.type == "change"
      ) {
        let gen = null;
        if (this.language == "python") {
          gen = Blockly.Python;
        } else if (this.language == "javascript") {
          gen = Blockly.JavaScript;
        }
        let sourceCode = gen.workspaceToCode(this.blockly_workspace);
        var xml = Blockly.Xml.domToText(
          Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
        );
        console.log(sourceCode);
        this.saveCode(sourceCode);
        this.saveWorkspace(xml);
      }
    },
  },
};
</script>


<style>
/* Makes our label white. */
.blocklyTreeLabel {
  color: white;
  font-size: 18px;
  font-family: inherit;
  margin-left: 5px;
}
/* Adds padding around the group of categories and separators. */
.blocklyToolboxContents {
  padding: .5em;
}
/* Adds space between the categories, rounds the corners and adds space around the label. */
.blocklyTreeRow {
  padding: 3px;
  margin-bottom: .5em;
  border-radius: 4px;
}
/* Changes color of the icon to white. */
.customIcon {
  color: white;
}
/* Stacks the icon on top of the label. */
.blocklyTreeRowContentContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding : 5px 5px 5px 8px;
}
.blocklyTreeRow {
  height: initial;
}

</style>