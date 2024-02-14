import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);

const locale = 'wv';

const messages = {
  "wv":{}
}

const i18n = new VueI18n({
  locale: locale,
  messages: messages
})

export default i18n