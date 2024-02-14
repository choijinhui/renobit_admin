<template>
    <div>
        <license-change-modal :isRouter="true"></license-change-modal>
        <pnid-license-change-modal v-on:changeLicense="initLicense"></pnid-license-change-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator'
    import LicenseChangeModal from "./contents/license/LicenseChangeModal.vue";
    import PnidLicenseChangeModal from "./contents/license/PnidLicenseChangeModal.vue";
    import * as constants from '../api/Constants';
    import AdminUtil from '../api/AdminUtil';

    @Component({
        components: {
            LicenseChangeModal,
            PnidLicenseChangeModal
        }
    })
    export default class LicenseChangePage extends Vue {
        @Prop()
        private module: string;

        initLicense() {
            AdminUtil.redirectToSolution(constants.PNID);
        }

        created():void {
            var self = this;

            setTimeout(function () {
                if (self.module === constants.PNID) {
                    self.$modal.show('pnid-license-change');
                } else {
                    self.$modal.show('license-change');
                }
            }, 100);
        }
    }
</script>

<style>

</style>
