<template>
    <div>
        <password-change-modal :config="config" />
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import PasswordChangeModal from "./contents/user/modal/PasswordChangeModal.vue"


    @Component({
        components: {
            PasswordChangeModal
        }
    })
    export default class PasswordChangePage extends Vue {
        private userInfo: any = {pwd: "", confirmPwd: "", user_id: ""}
        private langPack: Array<any> = [];
        private language:string = window.navigator.language;
        private installedLocale:string = 'ko-KR';
        public config: any = {};

        created(): void {
           this.$adminAPI.getConfig().then(result => {
                this.langPack = result.languages;

                this.language = this.getLocaleInfo();
                return this.callLocaleFile(this.language);
            }).then(result => {
                this.$i18n.setLocaleMessage('wv', result);
                this.$validator.localize(this.language);
                this.$validator.validateAll();

                return this.$adminAPI.getPolicyInfo();
            }).then(result => {
                const msg = this.$i18n.messages.wv.policy;
                const configList = result;
                this.config = {};

                configList.map(value => {
                    const config_id = value.config_id;
                    this.config[config_id] = value.value;
                });

                this.config.policyString = '';

                if (this.config.PW_POLICY === "Y") {
                    let pString = `( *${msg.policy13}${this.config.PW_LENGTH}${msg.policy14}`;

                    if (this.config.PW_MIX === 'CN') {
                        pString += msg.policy15

                    } else if (this.config.PW_MIX === 'CNS') {
                        pString += msg.policy16
                    }

                    pString += `${msg.policy17} )`

                    this.config.policyString = pString;
                }
            });
        }

        getLocaleInfo() {
            let locale = 'ko-KR';
            let regex = new RegExp('lang=([^&]*)');
            let match_result = location.href.match(regex);
            let lang = match_result !== null ? match_result[1] : null;

            if(lang) {
                const valid_locale = this.langPack.find(d => (d.user_locale === lang || d.locale === lang))
                
                if (valid_locale) {
                    locale = valid_locale.locale;
                } else {
                    locale = this.installedLocale;
                }
            } else {
                let temp_locale = localStorage.getItem('__renobit_locale__');
                let valid_locale = this.langPack.find(d=> d.locale === temp_locale);

                if (valid_locale) {
                    locale = temp_locale;
                } else {
                    locale = this.installedLocale;
                }
            }

            return locale;
        }

        callLocaleFile(locale) {
            return this.$adminAPI.getLanguage(locale);
        }

        mounted() {
            const { user_id } = this.$route.params;
            this.userInfo.user_id = user_id || sessionStorage.tempId;
            this.$modal.show("pwd-change", { userInfo: this.userInfo });
        }
    }
</script>

<style scoped>

</style>
