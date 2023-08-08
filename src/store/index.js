import { createStore } from 'vuex'

export default createStore({
  strict: true,   // prevent any changes on the state outside mutaions.
  state: {
    blueColor: '#2a73c5',
    redColor:'#C62828',
    statusModal: {
      show: false,
      showSuccessMsg: false,
      msg: {
        succeeded: "",
        failure: ""
      }
    },
    defaultRules: {
      required: value => !!value || 'Required Field',
      range: v => v.length > 2 && v.length < 129 || 'Field must be between 3-128 characters in length!'
    },
    token: null
  },
  getters: {
  },
  mutations: {
    updateStatusModal(state, payload) {
      state.statusModal= payload;
    },
    storeAccessToken(state, payload) {
      state.token = payload;
    }
  },
  actions: {
    updateStatusModal(context, payload) {
      context.commit('updateStatusModal', payload);

      // restore default values after 5 sec.
      setTimeout(() => {
        context.commit('updateStatusModal', {
          show: false,
          showSuccessMsg: false,
          msg: {
            succeeded: "",
            failure: ""
          }
        })
      }, 6000);
    },
    storeAccessToken(context, payload) {
      context.commit('storeAccessToken', payload);
    }
  },
  modules: {
  }
})
