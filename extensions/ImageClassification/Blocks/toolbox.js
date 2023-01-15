export default `<xml>
  <category name="Logic" colour="%{BKY_LOGIC_HUE}">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Loops" colour="%{BKY_LOOPS_HUE}">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <block type="math_number">
          <field name="NUM">10</field>
        </block>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
  </category>
  <category name="Math" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">123</field>
    </block>
    <block type="math_arithmetic"></block>
    <block type="math_single"></block>
  </category>
  <category name="Text" colour="%{BKY_TEXTS_HUE}">
    <block type="text"></block>
    <block type="text_length"></block>
    <block type="term_print"></block>
  </category>
  <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
    </category>
  <category name="Kidbright Bot" colour="%{BKY_LOOPS_HUE}">
    <block type="move"></block>
    <block type="delay"></block>
    <block type="tfjs_classification_init_model"></block>
    <block type="tfjs_classification_classify"></block>
    <block type="tfjs_classification_get_class_name"></block>
    <block type="tfjs_classification_get_class_index"></block>
    <block type="tfjs_classification_get_class_prob"></block>
  </category>
</xml>`;
