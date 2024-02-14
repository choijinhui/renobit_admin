<template>
    <modal name="pwd-change"
           :click-to-close="false"
           :reset="true"
           :width="700"
           :height="385"
           :min-width="700"
           :min-height="385"
           @before-open="beforeOpen">
        <div class="modal-header">
            <span>{{$t('user.pwd')}} {{$t('common.modify')}} {{$t('common.popup')}}</span>
            <!--<a class="close-modal-btn" v-if="!isRouter" @click="_onHidden"><i class="el-icon-error"></i></a>-->
        </div>

        <div class="form-area d-flex">
            <div class="info-container">
                <div class="required-info d-flex">
                    <div class="info-label">{{$t('user.id')}}</div>
                    <el-input name="user_id" v-bind:placeholder="$t('user.id')" disabled v-model="userInfo.user_id"></el-input>
                </div>

                <div class="required-info d-flex">
                    <label class="info-label">{{$t('user.pwd')}}</label>
                    <div style="width: 100%;">
                        <div class="info">{{config.policyString}}</div>
                        <el-input type="password" name="pwd" v-bind:placeholder="$t('user.pwd')" v-validate="{required: true}"
                                  v-model="userInfo.pwd" v-bind:data-vv-as="$t('user.pwd') "></el-input>
                        <div class="error" v-if="errors.has('pwd')">{{errors.first('pwd')}}</div>
                    </div>
                </div>

                <div class="required-info d-flex">
                    <label class="info-label">{{$t('user.pwd')}} {{$t('common.confirm')}}</label>
                    <div style="width: 100%;">
                        <el-input type="password" name="confirmPwd" v-bind:placeholder="$t('user.pwd') + ' ' + $t('common.confirm')"
                                  v-validate="{required: true, confirmed: ['pwd']}"
                                  v-model="userInfo.confirmPwd" v-bind:data-vv-as="$t('user.pwd') + ' ' + $t('common.confirm') "
                                  @keyup.native.enter="saveUserInfo"
                                  ></el-input>
                        <div class="error" v-if="errors.has('confirmPwd')">{{errors.first('confirmPwd')}}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="btn-area d-flex">
            <el-button size="small" type="primary" @click="saveUserInfo">{{$t('common.modify')}}</el-button>
            <!--<el-button size="small" type="primary" @click="_onHidden">{{$t('common.close')}}</el-button>-->
        </div>
    </modal>
</template>

<script lang="ts">
    import util from "../../../../api/AdminUtil"
    import {Component, Vue, Prop} from "vue-property-decorator";

    @Component
    export default class PasswordChangeModal extends Vue {
        userInfo: any = {};
        @Prop({ default: { policyString: "" }})
        config:any;
        

        _onHidden() {
            this.$modal.hide("pwd-change");
        }

        beforeOpen(event) {
            this.userInfo = $.extend(true, {}, event.params.userInfo);
        }

        saveUserInfo() {
            var msg = this.$i18n.messages.wv;
            this.$validator.validateAll().then(()=>{
                if (!this.$validator.errors.any()) {
                    var info = JSON.parse(JSON.stringify(this.userInfo));
                    info.pwd = encrypt(this.userInfo.pwd);
                    info.confirmPwd = encrypt(this.userInfo.pwd);
                    info.id = info.user_id;
                    
                    // 현재 사용중인 패스워드와 비교 (동일 패스워드 사용 불가)
                    this.$adminAPI.checkCurrentUserPwd(info).then(result =>{
                        if(!result.result) {
                            this.$message.error(util.convertPwdCode(result.data));
                        }else{
                            // 현재와 다른 비밀번호일 경우 
                            if (this.config.PW_POLICY == 'Y') {
                                this.$adminAPI.validationPwdCheck(info).then(result =>{
                                    if(result.result) {
                                        this.editUser(info);
                                    } else {
                                        this.$message.error(util.convertPwdCode(result.data));
                                    }
                                });

                            } else {
                                this.editUser(info);
                            }
                        }
                    });
                }
            })
        }

        editUser(info) {
            var msg = this.$i18n.messages.wv;

            this.$adminAPI.editUser(info).then(result => {
                this._onHidden();
                this.$message.success(msg.msg12);
                this.$emit('changeInfo');
                const module = this.$route.query.module
                util.redirectToSolution(module)

            }, error => {
                this.$message.error(msg.msg13);
            });
        }
    }
</script>

<style scoped>

    .form-area {
        padding: 19px;
        align-items: flex-start;
        justify-content: center;
    }

    .info-container {
        border-radius: 5px;
        background-color: #f6f7fb;
        padding: 36px 47px;
    }

    .info-container > .title {
        font-weight: bold;
        color: #1c1c1c;
    }

    .info-container > .required-info {
        min-height: 24px;
        width: 400px;
        background-color: #ffffff;
        border-left: 7px solid #658ed0;
        border-radius: 3px;
        margin-bottom: 10px;
        padding: 8px 0;
        padding-right: 10px;
    }

    .info-container .info-label {
        width: 114px;
        padding-left: 14px;
        color: #1c1c1c;
    }

    .btn-area {
        padding-top: 20px;
        border-top: 1px solid #cccccc;
        position: absolute;
        width: 100%;
        bottom: 0;
        padding-bottom: 20px;
        display: flex;
        justify-content: center;
    }

    .info {
        text-align: right;
        font-weight: bold;
    }

    .error {
        margin-top: 2px;
        color: #f56c6c;
    }

</style>
