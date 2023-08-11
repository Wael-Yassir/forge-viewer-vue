<template>
  <div>
    <ConfirmDialog ref="confirmDelete" />

    <v-navigation-drawer permanent width="500">
      <v-list>
        <v-list-subheader class="full-width mb-16">
          <div class="bucket-action">
            <v-btn
              prepend-icon="mdi-format-list-bulleted"
              class="text-white mr-3"
              color="grey-darken-2" flat
              :disabled="!token"
              @click="ListBuckets"
              density="comfortable"
            >
              List Buckets
            </v-btn>

            <AddBucketDialog v-if="this.buckets" @onBucketAdded="UpdateBucket"/>
          </div>
        </v-list-subheader>

        <v-divider class="mb-4"/>

        <v-list-group
          v-for="(bucket, i) in buckets" :key="i"
          :value="bucket.bucketKey" 
        >
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="px-8">
              <v-list-item-title class="text-uppercase">
                {{ bucket.bucketKey }}
              </v-list-item-title>

              <template v-slot:append>
                <v-btn
                  icon flat
                  :color="redColor"
                  class="text-white mr-2"
                  @click="DeleteBucket(bucket.bucketKey)"
                  density="comfortable"
                >
                  <v-icon>mdi-delete</v-icon>

                  <v-tooltip activator="parent" location="left">
                    Delete bucket
                  </v-tooltip>
                </v-btn>

                <FileUploader :bucket="bucket" @ObjectAdded="OnObjectAdded"/>
              </template>
            </v-list-item>
          </template>

          <v-list-item v-for="(object, i) in bucket.objects" :key="i">
            <v-list-item-title>
              <span style="font-size: 16px;">
                {{ object.objectKey }}
              </span>
            </v-list-item-title>

            <template v-slot:append>
              <v-btn
                flat icon
                :color="redColor"
                text-color="white"
                class="text-white mr-2"
                @click="DeleteModel(bucket.bucketKey, object.objectKey)"
                density="comfortable"
              >
                <v-icon>mdi-delete</v-icon>

                <v-tooltip activator="parent" location="left">
                  Delete model
                </v-tooltip>
              </v-btn>

              <v-btn
                icon flat
                class="text-white mr-6"
                color="grey-darken-2"
                @click="PrepareModelForViewer(object.objectId)"
                density="comfortable"
              >
                <v-icon>mdi-view-day-outline</v-icon>

                <v-tooltip activator="parent" location="right">
                  View model
                </v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
          <v-divider class="mt-2 mx-8"/>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <Loader ref="loader" :show="loader"/>

    <div
      id="forgeViewer"
      v-show="showViewer"
    >
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { Buffer } from 'buffer'
import StatusModal from "./StatusModal.vue";
import ConfirmDialog from './ConfirmDialog.vue';
import AddBucketDialog from "./AddBucketDialog.vue";
import FileUploader from "./FileUploader.vue";
import Loader from './Loader.vue';

import * as forgeService from "@/services/forge.js";

export default {
  components: {
    StatusModal,
    ConfirmDialog,
    AddBucketDialog,
    FileUploader,
    Loader
  },
  data: () => ({
    loader: false,
    buckets: null,
    addBucketDialog: false,
    showViewer: true,
    translationStatus: '',
    translationProgress: '',
  }),
  methods: {
    async ListBuckets() {
      await forgeService.InitializeViewer();
      this.buckets = await forgeService.GetBuckets();

      // get the objects inside each model
      for (const bucket of this.buckets) {
        bucket.objects = [];
        bucket.objects = await forgeService.GetObjectsInBucket(bucket.bucketKey);
      }

      this.showViewer = false;
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
      const deleteConfirmed = await this.$refs.confirmDelete.show(
        `Are you sure you want to delete ${bucketKey.toUpperCase()} bucket?`
      );

      if (deleteConfirmed) {
        const res = await forgeService.DeleteBucket(bucketKey);
        if (res.bucketKey) {
          this.buckets = this.buckets.filter(b => b.bucketKey != bucketKey);

          this.$store.dispatch('updateStatusModal', {
            show: true,
            showSuccessMsg: res.bucketKey ? true : false,
            msg: {
              succeeded: "Bucket deleted successfully! 😎",
              failure: `Error deleting ${res.bucketKey} bucket! 😌😌`
            }
          });
        }
      }

    },
    OnObjectAdded(object) {
      const bucket = this.buckets.find(b => b.bucketKey === object.bucketKey);

      if (bucket) {
        if (!bucket.objects) bucket.objects = [];
        bucket.objects.push(object);
      }
    },
    async DeleteModel(bucketKey, objectKey) {
      const deleteConfirmed = await this.$refs.confirmDelete.show(
        `Are you sure you want to delete ${objectKey.toUpperCase()} from ${bucketKey.toUpperCase()} bucket?`
      );

      if (deleteConfirmed) {
        await forgeService.DeleteObjectFromBucket(bucketKey, objectKey);
        const bucket = this.buckets.find(b => b.bucketKey === bucketKey);

        if (bucket) {
          bucket.objects = bucket.objects.filter(o => o.objectKey != objectKey);
        }
      }
    },
    async PrepareModelForViewer(objectId) {
      const modelUrnBase64 = Buffer.from(objectId).toString('base64');

      const jobResult = await forgeService.TranslateModel(modelUrnBase64);

      if (jobResult.result === 'created') {
        this._viewModel(modelUrnBase64);
      } else if (jobResult.result === 'success') {
        const interval = setInterval(async () => {
          const res = await forgeService.CheckTranslationStatus(modelUrnBase64);

          this.loader = true
          this.translationStatus = res.status;
          this.translationProgress = res.progress;
          this.$refs.loader.message = `Model Translation Progress: ${this.translationProgress}`
          
          if (this.translationStatus === 'success') {
            clearInterval(interval);
            setTimeout(() => {
              this.loader = false;
              this._viewModel(modelUrnBase64);
            }, 2000);
          } 
          else if (this.translationStatus === 'failed' || this.translationStatus === 'timeout') {
            console.log("Translation Model Status", this.translationStatus);
            this.loader = false;
            clearInterval(interval);
          }
        }, 2500);
      }
    },
    async _viewModel(modelUrn) {
      this.showViewer = true;
      await forgeService.ViewModel(modelUrn);

      const viewerWrap = document.querySelector(".adsk-viewing-viewer");
      if (!viewerWrap) return;

      viewerWrap.style.maxHeight = '825px';
      viewerWrap.style.position = "relative";
    } 
  },
  computed: {
    ...mapState([ 'token', 'blueColor', 'redColor' ])
  }
}

</script>

<style>
  #forgeViewer {
    margin-top: 25px;
  }
  .bucket.v-col {
    padding-top: 5px;
    padding-bottom: 0;
  }
  .d.v-col {
    padding-left: 0px;
    padding-right: 0px;
  }
  .full-width .v-list-subheader__text {
    width: 100%;
  }
  .bucket-action {
    margin: 15px 10px; 
    margin-bottom: 60px;
    display: flex; 
    justify-content: space-between; 
  }
  .translation-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(80px, 0);
  }
</style>