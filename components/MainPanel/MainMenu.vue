<template>
  <div class="d-inline-flex flex-wrap menu-starter">
    <div
      class="btn-base new"
      data-md-tooltip="สร้าง Project ใหม่"
      v-b-modal.new-project-modal
    />
    <div
      data-md-tooltip="เปิด Project ที่เคยสร้างไว้แล้ว"
      class="btn-base open"
      v-b-modal.open-project-modal
      :disabled="isLoading|| isOpening || isSaving"
    />
    <div
      data-md-tooltip="บันทึกข้อมูล"
      class="btn-base save"
      @click="()=>{ if(project.id){ saveProject(); } }"
      :disabled="isLoading || isSaving || isOpening"
    >
      <b-spinner v-if="isSaving" small />
    </div>
    <div
      :data-md-tooltip="'ลบ Project'"
      class="btn-base delete"
      variant="danger"
      :disabled="isLoading || isSaving"
      v-b-modal.delete-project-modal
    />
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState('project', [
      'project',
      'newProjectModal',
      'listProjectModal',
      'isLoading',
      'isSaving',
    ]),
    ...mapState(['currentDevice','isOpening']),
    isBrowser(){
      return this.currentDevice === "BROWSER";
    }
  },
  methods: {
    ...mapActions([
      'saveProject',
    ])
  }
}
</script>