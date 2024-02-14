<template>
    <modal name="init-pwd-change"
           :click-to-close="false"
           :reset="true"
           :width="460"
           :height="250"
           :min-width="460"
           :min-height="250"
           draggable=".modal-header">
        <div class="modal-header">
            <span>{{$t('policy.policy10')}}</span>
            <a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>
        </div>

        <div class="modal-content">
            <div class="form d-flex">
                <div class="title">{{$t('policy.policy11')}}</div>
                <div class="value">
                    <el-input type="password" name="pwd" v-bind:placeholder="$t('user.pwd')" v-validate="{required: true}"
                              v-model="pwd" v-bind:data-vv-as="$t('user.pwd') + ' '" ref="pwd"></el-input>
                    <div class="error" v-if="errors.has('pwd')">{{errors.first('pwd')}}</div>
                </div>
            </div>

            <div class="form d-flex">
                <div class="title">{{$t('policy.policy12')}}</div>
                <div class="value">
                    <el-input type="password" name="confirmPwd" v-bind:placeholder="$t('user.pwd') + ' ' + $t('common.confirm')"
                              v-validate="'required|confirmed:pwd'"
                              v-model="confirmPwd" v-bind:data-vv-as="$t('user.pwd') + ' ' + $t('common.confirm') + ' '"></el-input>
                    <div class="error" v-if="errors.has('confirmPwd')">{{errors.first('confirmPwd')}}</div>
                </div>

            </div>
        </div>

        <div class="btn-area">
            <el-button size="small" type="primary" @click="saveInitPwd">{{$t('common.save')}}</el-button>
            <el-button size="small" type="primary" @click="_onHidden">{{$t('common.close')}}</el-button>
        </div>

    </modal>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";

    @Component
    export default class InitPwdChangeModal extends Vue {
        pwd: string = '';
        confirmPwd: string = '';

        _onHidden() {
            this.pwd = ''
            this.confirmPwd = ''
            this.$modal.hide("init-pwd-change");
        }

        saveInitPwd() {
            var msg = this.$i18n.messages.wv;
            this.$validator.validateAll().then(()=>{
                if (!this.$validator.errors.any()) {
                    encrypt(this.pwd);
                    var ary = [{config_id: 'PW_INIT', value: encrypt(this.pwd)}];

                    this.$adminAPI.setPolicyInfo({policy: ary}).then(result => {
                        this.pwd = ''
                        this.confirmPwd = ''
                        this.$message.success(msg.msg06);
                        this._onHidden()
                    })
                }
            })
        }
    }

</script>

<style scoped>
    .modal-content {
        height: auto;
        margin: 15px;
        padding: 15px;
        background-color: #f6f7fb;
        border-radius: 5px;
    }

    .modal-content > .form {
        background-color: #ffffff;
        margin-bottom: 4px;
        border-left: 7px solid #B9C8F1;
        min-height: 36px;
        border-radius: 3px;
    }

    .modal-content > .form > .title {
        padding: 0;
        padding-left: 4px;
        font-size: 12px;
        color: #1c1c1c;
        width: 240px;
    }

    .modal-content > .form > .value {
        width: 100%;
        padding-right: 10px;
    }

    .btn-area {
        text-align: center;
    }

    .error {
        margin-top: 2px;
        color: #f56c6c;
    }
</style>
