<template>
  <!-- https://ourcodeworld.com/articles/read/1424/how-to-use-a-button-as-a-file-uploader-with-vuetify-in-vuejs -->
  <div>
    <v-btn
      icon flat
      color="#2a73c5"
      class="text-white"
      :loading="loading"
      @click="handleFileUpload"
      density="comfortable"
    >
      <v-icon>mdi-plus</v-icon>

      <v-tooltip activator="parent" location="right">
        Upload model to a bucket
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
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          const byteArray = new Uint8Array(event.target.result);

          const objectData = await forgeService.UploadFileToBucket(
            this.bucket.bucketKey, 
            this.selectedFile.name,
            byteArray
          );
          
          if (objectData.objectId) this.$emit('objectAdded', objectData);
        }

        reader.readAsArrayBuffer(this.selectedFile);
      }
    }
  }
</script>

<style>

</style>