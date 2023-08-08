<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="450px"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          prepend-icon="mdi-plus"
          color="#2a73c5" flat
          class="text-white"
          v-bind="props"
        >
          Add Bucket
        </v-btn>
      </template>
      <v-card class="pa-2">
        <v-card-title>
          <div class=" text-center mt-5">
            <h2 class="text-grey text-uppercase">Create New Bucket</h2>
          </div>

          <h5
            v-if="res.error"
            color="primary"
            class="mt-6 error text-center"
          >
            {{ res.error }}
          </h5>

          <v-card-text>
            <v-form ref="form">
              <v-text-field
                label="Bucket Name"
                variant="underlined"
                prepend-inner-icon="mdi-form-textbox"
                v-model="bucket.bucketKey"
                class="mb-4"
                :rules="[ defaultRules.range ]"
              >
              </v-text-field>

              <v-select
                label="Policy Key"
                variant="underlined"
                prepend-inner-icon="mdi-cog"
                v-model="bucket.policyKey"
                class="mb-5"
                :rules="[ defaultRules.required ]"
                :items="['transient', 'temporary', 'persistent']"
              >
              </v-select>

              <div class="text-center">
                <v-btn
                  class="mb-2 text-white"
                  prepend-icon="mdi-plus"
                  :loading="loading"
                  color="#2a73c5" flat
                  @click="submit"
                >
                  Add
                </v-btn>
              </div>

            </v-form>
          </v-card-text>
        </v-card-title>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import * as forgeService from '@/services/forge.js'
import { mapState } from 'vuex';

export default {
  data: () => ({
    dialog: false,
    loading: false,
    res: '',
    bucket: {
      bucketKey: '',
      policyKey: ''
    }
  }),
  methods: {
    submit() {
      this.$refs.form.validate()
        .then(async (res) => {
          if (res.valid) {
            this.loading = true;

            this.res = await forgeService.AddBucket(this.bucket);
            this.loading = false

            if (this.res.bucketKey) {
              this.dialog = false;

              this.$store.dispatch('updateStatusModal', {
                show: true,
                showSuccessMsg: this.res.bucketKey ? true : false,
                msg: {
                  succeeded: "Bucket added successfully! 😎",
                  failure: "Failded to add the bucket! 😌😌"
                }
              });

              this.$emit('onBucketAdded', this.res);
            }
          }
        })
    }
  },
  computed: {
    ...mapState([ 'defaultRules' ])
  }
}

</script>

<style>
</style>