<template>
  <v-dialog
    persistent
    width="auto"
    v-model="dialog"
    max-width="500"
  >
    <v-card class="pa-2">
      <v-card-text>
        <span class="font-weight-bold text-grey-darken-1">
          {{ message }}
        </span>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

          <v-btn
            :color="redColor"
            variant="text"
            @click="cancel"
          >
            Cancel
          </v-btn>

          <v-btn
            :color="blueColor"
            variant="text"
            @click="confirm"
          >
            Confirm
          </v-btn>

          <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    data: () => ({
      dialog: false,
      message: '',

      // Private variables
      resolvePromise: undefined,
      rejectPromise: undefined,
    }),
    methods: {
      show(message) {
        this.message = message;
        this.dialog = true;

        // the promise will return nothing until resolve, or reject is called.
        return new Promise((resolve, reject) => {
          this.resolvePromise = resolve
          this.rejectPromise = reject
        })
      },
      confirm() {
        this.dialog = false;
        this.resolvePromise(true);    // call resolve to return the promise
      },
      cancel() {
        this.dialog = false;
        this.resolvePromise(false);   // call resolve to return the promise
      }
    },
    computed: {
      ...mapState([ 'blueColor', 'redColor' ])
    }
  }
</script>

<style>

</style>