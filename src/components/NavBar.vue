<template>
  <div>
    <v-app-bar color="#e9e9e9" flat>
      <template v-slot:prepend>
        <v-app-bar-title class="ml-2 text-uppercase text-grey">
          <div>
            <span class="font-weight-light">Ninja </span>
            <span>Viewer</span>
          </div>
        </v-app-bar-title>

        <div class="ml-6">
          <v-btn
            v-for="(item, i) in menuItems"
            :key="i"
            router :to="item.route"
            :prepend-icon="item.icon"
            color="grey-darken-1"
          >
            <span class="font-weight-bold">{{ item.text  }}</span>
          </v-btn>
        </div>
      </template>

      <template v-slot:append>
        <AuthenticateDialog @authenticated="onAuthenticated"/>
      </template>
    </v-app-bar>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import StatusModal from './StatusModal.vue';
import AuthenticateDialog from './AuthenticateDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

export default {
  components: {
    StatusModal,
    AuthenticateDialog,
    ConfirmDialog
  },
  data: () => ({
    menuItems: [
      { icon: 'mdi-home', text: 'Home', route: {name: 'home'} },
      { icon: 'mdi-view-day-outline', text: 'Forge Viewer', route: {name: 'forge-viewer'} }
    ],
  }),
  methods: {
    async onAuthenticated(res) {
      this.$store.dispatch('updateStatusModal', {
        show: true,
        showSuccessMsg: !res.error ? true : false,
        msg: {
          succeeded: "Authentication is done successfully! 😎",
          failure: "Authentication failed! 😌😌"
        }
      });

      if (!res.err) this.$store.dispatch('storeAccessToken', res);
    }
  },
  computed: {
    ...mapState([ 'blueColor'])
  }
}
</script>

<style>

</style>