import Vue from 'vue'
import Vuex from 'vuex'
import AdminAPI from "../api/Admin"

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        isAuthenticated:false
    },
    mutations: {
        UPDATE_AUTH(state, payload) {
            state.isAuthenticated = payload.isAuthenticated
        }
    },
    actions: {
         checkAuth({commit}, { password }) {
            return new Promise(async (resolve, reject) => {
                const pw = encrypt( password )
                const response = await AdminAPI.checkAdminUser({ pw }).catch(reject)
                const isAuthenticated = response.result == 'OK' ? true : false
                commit('UPDATE_AUTH', { isAuthenticated })
                isAuthenticated ? resolve() : reject(response.message)
            })
        }
    },
    getters: {
        isAuthenticated: state => {
            return state.isAuthenticated
        }
    }
})

export default store