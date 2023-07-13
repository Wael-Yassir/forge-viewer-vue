<template>
  <!-- https://ourcodeworld.com/articles/read/1424/how-to-use-a-button-as-a-file-uploader-with-vuetify-in-vuejs -->
  <div>
    <v-btn
      icon flat
      color="#2a73c5"
      class="text-white mr-3"
      :loading="loading"
      @click="handleFileUpload"
    >
      <v-icon>mdi-plus</v-icon>

      <v-tooltip activator="parent" location="top">
        Upload file to a bucket
      </v-tooltip>
    </v-btn>

    <input
      type="file"
      ref="uploader"
      class="d-none"
      @change="onFileChanged"
    />
  </div>
</template>

<script>
  import * as forgeService from '@/services/forge.js';

  export default {
    props: [ 'bucket' ],
    data: () => ({
      loading: false,
      selectedFile: null
    }),
    methods: {
      handleFileUpload() {
        this.loading = true;

        // Once the user pick a file, the focus will be returned to the main window
        // and then the loading symbol can be removed from teh button.
        window.addEventListener('focus', () => {
          this.loading = false
        }, { once: true });

        this.$refs.uploader.click();
      },
      async onFileChanged(e) {
        this.selectedFile = e.target.files[0];
        const objectData = await forgeService
          .UploadFileToBucket(this.bucket.bucketKey, this.selectedFile);

        if (objectData.objectId) this.$emit('objectAdded', objectData);
      }
    }
  }
</script>

<style>

</style>