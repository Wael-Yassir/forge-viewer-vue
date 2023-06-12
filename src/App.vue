<template>
  <v-app class="bg-grey-lighten-4">
    <NavBar/>

    <v-main class="mx-6 mb-6">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  },
  data: () => ({
    //
  }),
}
</script>
