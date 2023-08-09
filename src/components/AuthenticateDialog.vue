<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="425"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          color="grey-darken-1"
          prepend-icon="mdi-logout-variant"
          v-bind="props"
        >
          <span class="font-weight-bold">Authenticate</span>
        </v-btn>
      </template>

      <v-card class="pa-2">
        <v-card-title>
          <div class=" text-center mt-5">
            <h2 class="text-grey text-uppercase">Authenticate</h2>
          </div>

          <h5
            v-if="res.message"
            color="primary"
            class="mt-4 error text-center"
          >
            {{ res.message }}
          </h5>

          <v-card-text>
            <v-form ref="form">
              <v-text-field
                label="Client Id"
                variant="underlined"
                prepend-inner-icon="mdi-account"
                v-model="clientId"
                class="mb-2 text-grey-darken-2"
                :rules="[ defaultRules.range ]"
              >
              </v-text-field>

              <v-text-field
                label="Client Secret"
                variant="underlined"
                prepend-inner-icon="mdi-lock-outline"
                v-model="clientSecret"
                class="mb-4 text-grey-darken-2"
                :type="'password'"
                :rules="[ defaultRules.range ]"
              >
              </v-text-field>

              <div class="text-center">
                <v-btn
                  class="mb-2 text-white"
                  prepend-icon="mdi-login-variant"
                  :loading="loading"
                  :color="blueColor" flat
                  @click="Authenticate"
                >
                  Authenticate
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
import * as forgeService from '@/services/forge.js';
import { mapState } from 'vuex';

export default {
  data: () => ({
    dialog: false,
    loading: false,
    res: '',
    clientId: process.env.VUE_APP_FORGE_CLIENT_ID,
    clientSecret: process.env.VUE_APP_FORGE_CLIENT_SECRET,
  }),
  methods: {
    async Authenticate() {
      try {
        this.loading = true;

        await this.$refs.form.validate();
        this.res = await forgeService.Authenticate(this.clientId, this.clientSecret);

        this.loading = false;
        if (!this.res.error) this.dialog = false;

        this.$emit('authenticated', this.res);
      } catch (error) {
        console.error(error);
      }
    }
  },
  computed: {
    ...mapState([ 'defaultRules', 'blueColor' ])
  }
}
</script>

<style>

</style>