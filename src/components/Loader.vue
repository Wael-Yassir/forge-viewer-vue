<template>
  <div v-if="show" class="loader">
    <v-card :color="blueColor">
      <v-card-text class="text-white text-uppercase">
        {{ message }}
      </v-card-text>

      <v-progress-linear
        indeterminate
        color="white"
        class="mb-0"
      >
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';

  export default {
    props: ['show'],
    data: () => ({
      message: ''
    }),
    computed: {
      ...mapState([ 'blueColor' ])
    }
  }
</script>

<style>
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(80px, 0);
  }
</style>