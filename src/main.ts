
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

import ElementUI from "element-ui";
import './assets/style/style.css';
import locale from 'element-ui/lib/locale/lang/en'
Vue.use(ElementUI, { locale });

import vmodal from 'vue-js-modal'
Vue.use(vmodal);

// api
import axios from 'axios'
Vue.prototype.$http = axios;
import adminAPI from "./api/Admin"
import adminUtil from "./api/AdminUtil"
Vue.prototype.$adminAPI = adminAPI;

import licenseAPI from "./api/License"
Vue.prototype.$licenseAPI = licenseAPI;

// css
import './assets/style/style.css';
import "./main.css";

// config
import i18n from './lang';
import Validator from 'vee-validate'
import ko_valid from 'vee-validate/dist/locale/ko.js'
import en_valid from 'vee-validate/dist/locale/en.js'

adminAPI.PATH = adminAPI._getFullPathName() + "/admin.do";
licenseAPI.PATH = licenseAPI._getFullPathName() + "/license.do";
licenseAPI.getPolicyInfo().then(result => {
  var configList = result;
  var localeInfo = configList.find(function(d){ return d.config_id === "LOCALE"});
  var locale = localeInfo ? localeInfo.value : "ko-KR";

  const config = {
    locale:locale,
    dictionary: {
      "en-US":en_valid,
      "ko-KR":ko_valid
    }
  };

  router.beforeEach(async (to, from, next) => {
    try {
      const { data: { solutions } } = await adminAPI.getInstalledLicenseInfo();
      adminUtil.saveSessionStorageData(solutions);
     } catch (error) {
          alert('Failed to Get Context Information')
     } finally {
          next()
     }
  })
  

  Vue.use(Validator, config);
  adminAPI.getLanguage(locale).then(result => {
    i18n.setLocaleMessage('wv', result)
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      i18n:i18n,
      router,
      components: { App },
      template: '<App/>'
    })
  })
});
