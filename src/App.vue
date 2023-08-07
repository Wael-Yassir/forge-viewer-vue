<template>
  <v-app class="bg-grey-lighten-4">
    <StatusModal
      :show="statusModal.show"
      :showSuccessMsg="statusModal.showSuccessMsg"
      :successMsg="statusModal.msg.succeeded"
      :failureMsg= "statusModal.msg.failure"
    >
    </StatusModal>

    <NavBar/>

    <v-main class="mx-6 mb-6">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import StatusModal from './components/StatusModal.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    NavBar,
    StatusModal
  },
  data: () => ({

  }),
  computed: {
    ...mapState([ 'statusModal' ])
  }
}
</script>

<style>
  .error {
    color: #b00020;
  }
</style>
