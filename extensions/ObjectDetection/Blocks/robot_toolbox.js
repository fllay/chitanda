export default `<xml ref="toolbox" style="display: none">
      <category name="Logic" colour="%{BKY_LOGIC_HUE}">
      <category name="If">
        <block type="controls_if"></block>
        <block type="controls_if">
          <mutation else="1"></mutation>
        </block>
        <block type="controls_if">
          <mutation elseif="1" else="1"></mutation>
        </block>
      </category>
      <category name="Boolean" colour="%{BKY_LOGIC_HUE}">
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_boolean"></block>
        <block type="logic_null"></block>
        <block type="logic_ternary"></block>
      </category>
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
      <block type="controls_for">
        <field name="VAR">i</field>
        <value name="FROM">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
      </block>
      <block type="controls_forEach"></block>
      <block type="controls_flow_statements"></block>
    </category>
    <category name="Math" colour="%{BKY_MATH_HUE}">
      <block type="math_number">
        <field name="NUM">123</field>
      </block>
      <block type="math_arithmetic"></block>
      <block type="math_single"></block>
      <block type="math_trig"></block>
      <block type="math_constant"></block>
      <block type="math_number_property"></block>
      <block type="math_round"></block>
      <block type="math_on_list"></block>
      <block type="math_modulo"></block>
      <block type="math_constrain">
        <value name="LOW">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="HIGH">
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
      </block>
      <block type="math_random_float"></block>
      <block type="math_atan2"></block>
    </category>
    <category name="Text" colour="%{BKY_TEXTS_HUE}">
    <block type="text"></block>
    <block type="text_length"></block>
    <block type="text_print"></block>
</category>
    <category name="Lists" colour="%{BKY_LISTS_HUE}">
      <block type="lists_create_empty"></block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
        <value name="NUM">
          <block type="math_number">
            <field name="NUM">5</field>
          </block>
        </value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf"></block>
      <block type="lists_getIndex"></block>
      <block type="lists_setIndex"></block>
    </category>
    <sep></sep>
    <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
    </category>
    <category name="Functions" custom="PROCEDURE" colour="%{BKY_PROCEDURES_HUE}">
    </category>
    <sep></sep>
      
      <category name="KidBright AI" colour="%{BKY_VARIABLES_HUE}">
      <block type="init_ros_node"></block>
      <block type="start_object_detector"></block>
      <block type="start_image_classification"></block>
      <block type="start_wake_word_detector"></block>
      <block type="rospy_loop"></block>
      <block type="get_objects"></block>
      <block type="get_classes"></block>
      <block type="get_sound"></block>
      <block type="get_object_attr"></block>
      <block type="delay">
        <value name="NAME">
            <shadow  type="math_number">
              <field name="NUM">0.5</field>
            </shadow >
        </value>
      </block>
       </category>
       <sep></sep>
      
      <category name="AI-Rover" colour="%{BKY_LOOPS_HUE}">
      <block type="set_velocity">
       <value name="LINEAR">
          <shadow type="math_number">
            <field name="NUM">0.2</field>
          </shadow>
        </value>
        <value name="ANGULAR">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="forward">
        <value name="NAME">
            <shadow  type="math_number">
              <field name="NUM">20</field>
            </shadow >
        </value>
      </block>
        <block type="backward">
        <value name="NAME">
            <shadow  type="math_number">
              <field name="NUM">20</field>
            </shadow >
        </value>
      </block>
      <block type="spin_left">
        <value name="NAME">
            <shadow  type="math_number">
              <field name="NUM">20</field>
            </shadow >
        </value>
      </block>
      <block type="spin_right">
        <value name="NAME">
            <shadow  type="math_number">
              <field name="NUM">20</field>
            </shadow >
        </value>
      </block>
      <block type="stop"></block>
      <block type="set_output">
        <value name="Logic">
          <shadow  type="math_number">
            <field name="NUM">1</field>
          </shadow >
        </value>
      </block>
      <block type="get_input">
       <value name="A">
          <shadow  type="math_number">
            <field name="NUM">0</field>
          </shadow >
        </value>
         <value name="B">
          <shadow  type="math_number">
            <field name="NUM">1023</field>
          </shadow >
        </value>
      </block>
      
  </category>

  </xml>`;
