<template>
  <div>
    <!-- The following workaround is to use a props for v-model -->
    <!-- https://vuejs.org/guide/components/v-model.html#v-model-arguments -->
    <v-snackbar
      :modelValue="show"
      @update:modelValue="newValue => show=newValue"
    >
      <div
        v-if="showSuccess"
        class="d-flex justify-space-between"
      >
        <span class="align-self-center">{{ successMsg }}</span>
        <v-btn
          variant="text"
          flat color="success"
          @click="show=false"
        >
          Close
        </v-btn>
      </div>

      <div v-else class="d-flex justify-space-between">
        <span class="align-self-center">{{ failMsg }}</span>
        <v-btn
          variant="text"
          flat color="red"
          @click="show=false"
        >
          Close
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
  export default {
    props: [ 'show', 'showSuccess', 'successMsg', 'failMsg'],
  }
</script>

<style>

</style>