<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="450px"
      activator="parent"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          prepend-icon="mdi-plus"
          color="#2a73c5" flat
          class="text-white"
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
            v-if="res.message"
            color="primary"
            class="mt-6 error text-center"
          >
            {{ res.message }}
          </h5>

          <v-card-text>
            <v-form ref="form">
              <v-text-field
                label="Bucket Name"
                variant="underlined"
                prepend-inner-icon="mdi-form-textbox"
                v-model="bucket.bucketKey"
                class="mb-4"
                :rules="rules.range"
              >
              </v-text-field>

              <v-select
                label="Policy Key"
                variant="underlined"
                prepend-inner-icon="mdi-cog"
                v-model="bucket.policyKey"
                class="mb-5"
                :rules="rules.required"
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

export default {
  data: () => ({
    dialog: false,
    loading: false,
    res: '',
    bucket: {
      bucketKey: '',
      policyKey: ''
    },
    rules: {
      required: value => !!value || 'Required Field',
      range: v => v.length > 2 && v.length < 129 || 'Bucket name should be between 3-128 characters in length!',
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
              this.$emit('onBucketAdded', this.res.data);
            }
          }
        })
    }
  }
}

</script>

<style>
</style>