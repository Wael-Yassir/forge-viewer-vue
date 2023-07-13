<template>
  <div>
    <StatusModal
      :show="snackbar"
      :showSuccess="token"
      successMsg="Authentication is done successfully! 😎"
      failMsg="Authentication failed! 😌😌"
    >
    </StatusModal>

    <v-container>
      <v-row>
        <v-btn
          prepend-icon="mdi-login-variant"
          class="text-white mr-3"
          color="grey-darken-2" flat
          @click="Authenticate"
        >
          Authenticate
        </v-btn>

        <v-btn
          prepend-icon="mdi-format-list-bulleted"
          class="text-white mr-3"
          color="grey-darken-2" flat
          :disabled="!token"
          @click="ListBuckets"
        >
          List Buckets
        </v-btn>
      </v-row>
    </v-container>

    <v-container v-if="this.buckets" class="mb-4">
      <v-row round class="bg-grey-lighten-3 mt-2 py-4 px-6 text-grey">
        <span class="text-uppercase text-h6">Buckets</span>

        <v-spacer></v-spacer>

        <AddBucketDialog @onBucketAdded="UpdateBucket"/>
      </v-row>
    </v-container>

    <v-container class="pt-6"></v-container>

    <v-row v-for="(bucket, i) in buckets" :key="i" class="m">
      <v-col cols="10" class="bucket">
        <v-expansion-panels class="pa-1">
          <v-expansion-panel>
            <v-expansion-panel-title class="px-6 py-4">
              <div class="text-subtitle-1 text-uppercase">{{ bucket.bucketKey }}</div>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="text-grey">
              <v-row
                v-for="(object, i) in bucket.objects"
                :key="i"
                class="my-1 py-2 px-2"
              >
                <div class="d-flex flex-column align-self-center">
                  <span class="text-h5">{{ object.objectKey }}</span>
                </div>

                <v-spacer></v-spacer>

                <v-btn
                  icon flat
                  class="text-white mr-3"
                  color="grey-darken-2"
                >
                  <v-icon>mdi-view-day-outline</v-icon>

                  <v-tooltip activator="parent" location="top">
                    View the model
                  </v-tooltip>
                </v-btn>

                <v-btn
                  flat icon
                  color="red-darken-3"
                  @click="DeleteModel(bucket.bucketKey, object.objectKey)"
                >
                  <v-icon>mdi-delete</v-icon>

                  <v-tooltip activator="parent" location="top">
                    Delete model from bucket
                  </v-tooltip>
                </v-btn>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col class="d-flex flex-row-reverse d">
        <v-btn
          icon flat
          color="red-darken-3"
          class="text-white mr-6"
          @click="DeleteBucket(bucket.bucketKey)"
        >
          <v-icon>mdi-delete</v-icon>

          <v-tooltip activator="parent" location="top">
            Delete bucket
          </v-tooltip>
        </v-btn>

        <v-btn
          icon flat
          color="grey-darken-2"
          class="text-white mr-3"
        >
          <v-icon>mdi-pencil</v-icon>

          <v-tooltip activator="parent" location="top">
            Rename bucket
          </v-tooltip>
        </v-btn>

        <FileUploader :bucket="bucket" @ObjectAdded="OnObjectAdded"/>
      </v-col>
    </v-row>

    <div id="forgeViewer"></div>
  </div>
</template>

<script>
import StatusModal from "./StatusModal.vue";
import AddBucketDialog from "./AddBucketDialog.vue";
import FileUploader from "./FileUploader.vue";
import * as forgeService from "@/services/forge.js";

export default {
  components: {
    StatusModal,
    AddBucketDialog,
    FileUploader
  },
  data: () => ({
    snackbar: false,
    token: null,
    buckets: null,
    addBucketDialog: false,
  }),
  methods: {
    async Authenticate() {
      this.token = await forgeService.Authenticate();
      this.snackbar = true;
    },
    async ListBuckets() {
      this.buckets = await forgeService.GetBuckets();

      // get the objects inside each model
      for (const bucket of this.buckets) {
        bucket.objects = [];
        bucket.objects = await forgeService.GetObjectsInBucket(bucket.bucketKey);
      }
    },
    UpdateBucket(bucket) {
      this.buckets.push({
        bucketKey: bucket.bucketKey,
        bucketOwner: bucket.bucketOwner,
        createdDate: bucket.createdDate,
        objects: []
      });
    },
    async DeleteBucket(bucketKey) {
      await forgeService.DeleteBucket(bucketKey);
      this.buckets = this.buckets.filter(b => b.bucketKey != bucketKey);
    },
    OnObjectAdded(object) {
      const bucket = this.buckets.find(b => b.bucketKey === object.bucketKey);

      if (bucket) {
        if (!bucket.objects) bucket.objects = [];
        bucket.objects.push(object);
      }
    },
    async DeleteModel(bucketKey, objectKey) {
      await forgeService.DeleteObjectFromBucket(bucketKey, objectKey);
      const bucket = this.buckets.find(b => b.bucketKey === bucketKey);

      if (bucket) {
        bucket.objects = bucket.objects.filter(o => o.objectKey != objectKey);
      }
    },
    async InitializeViewer() {
      await forgeService.InitializeViewer(this.token);
    },
  }
}

</script>

<style>
  #forgeViewer {
    width: 80%;
    height: 80%;
    margin: 0;
    background-color: #F0F8FF;
  }
  .adsk-viewing-viewer {
    width: 50%;
    height: 50%;
  }
  canvas {
    width: 500px;
    height: 500px;
  }
  .bucket.v-col {
    padding-top: 5px;
    padding-bottom: 0;
  }
  .d.v-col {
    padding-left: 0px;
    padding-right: 0px;
  }
</style>