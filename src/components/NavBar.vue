<template>
  <div>
    <v-app-bar color="#e9e9e9" flat>
      <v-app-bar-nav-icon class="text-grey" variant="text" @click.stop="drawer=!drawer"></v-app-bar-nav-icon>

      <v-app-bar-title class="text-uppercase text-grey">
        <span class="font-weight-light">Ninja </span>
        <span>Viewer</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <AuthenticateDialog @authenticated="onAuthenticated"/>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" permanent>
      <v-list>
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :value="item"
          router :to="item.route"
          :color="primaryColor"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title v-text="item.text" class="grey"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import StatusModal from './StatusModal.vue';
import AuthenticateDialog from './AuthenticateDialog.vue';

export default {
  components: {
    StatusModal,
    AuthenticateDialog
  },
  data: () => ({
    drawer: false,
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
    },
  },
  computed: {
    ...mapState([ 'primaryColor'])
  }
}
</script>

<style>

</style>