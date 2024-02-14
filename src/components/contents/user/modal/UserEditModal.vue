<template>
    <modal name="user-edit"
           :click-to-close="false"
           :reset="true"
           :width="950"
           :height="700"
           :min-width="950"
           :min-height="600"
           draggable=".modal-header"
           @before-open="beforeOpen">
        <div class="modal-header">
            <span>{{$t('user.__name__')}} {{$t('common.modify')}} {{$t('common.popup')}}</span>
            <a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>
        </div>

        <user-info-component
            :userInfo="userInfo"
            :deptList="deptList"
            :spotList="spotList"
            :positionList="positionList"
            :config="config"
            :gradeList="gradeList"
            type="edit"
            @close="_onHidden"
            @edit="saveUserInfo"
            @initPw="initPw"
            @unLockUser="unLockUser"
        ></user-info-component>

    </modal>
</template>

<script lang="ts">
    import util from "../../../../api/AdminUtil"
    import {Component, Vue, Prop} from "vue-property-decorator";
    import UserInfoComponent from "../UserInfoComponent.vue";
    @Component({
        components: {UserInfoComponent}
    })
    export default class UserEditModal extends Vue {
        userInfo: any = {};
        deptList: Array = [];
        spotList: Array = [];
        positionList: Array = [];
        gradeList:any = [];
        config:any = {policyString: ''};

        _onHidden() {
            this.$modal.hide("user-edit");
        }

        beforeOpen(event) {
            this.deptList = event.params.deptList;
            this.spotList = event.params.spotList;
            this.positionList = event.params.positionList;
            this.config = event.params.config;
            this.gradeList = event.params.gradeList;
            this.userInfo = $.extend(true, {}, event.params.userInfo);
        }

        switchChange() {
            this.$validator.validateAll();
        }

        saveUserInfo(userInfo, isPwChange) {
            var info = JSON.parse(JSON.stringify(userInfo));
            if(isPwChange) {
                info.pwd = encrypt(userInfo.pwd);
                info.confirmPwd = encrypt(userInfo.pwd);
            } else {
                info.pwd = null;
                info.confirmPwd = null;
            }

            this.gradeNames = this.getSelectedGradeNames(info);
            // 현재 사용중인 패스워드와 비교 (동일 패스워드 사용 불가)
            this.$adminAPI.checkCurrentUserPwd(info).then(result =>{
                if(!result.result) {
                    this.$message.error(util.convertPwdCode(result.data));
                }else{
                    this.$adminAPI.changeGrade(info).then(result => {
                        // 현재와 다른 비밀번호일 경우
                        if (this.config.PW_POLICY == 'Y') {
                            if(isPwChange) {
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
                        } else {
                            this.editUser(info);
                        }
                    });
                }
            });

        }

        editUser(info) {
            var msg = this.$i18n.messages.wv;

            this.$adminAPI.editUser(info).then(result => {
                this._onHidden();
                this.$message.success(msg.msg12);

                this.userInfo.pwd = null;
                this.userInfo.confirmPwd = null;

                this.$emit('changeInfo');

            }, error => {
                this.$message.error(`${error}, ${msg.msg13}`);
            });
        }

        initPw(userInfo) {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg26, msg.common.notification, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
            }).then(() => {

                this.$adminAPI.initPw(userInfo).then(result => {
                    this._onHidden();
                    this.$message.success(msg.msg12);
                    this.$emit('changeInfo');

                }, error => {
                    this.$message.error(msg.msg13);
                });

            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });;
        }

        unLockUser(userInfo){
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg25, msg.common.notification, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
            }).then(() => {
                this.$adminAPI.unLockUser(userInfo).then(result => {
                    this._onHidden();
                    this.$message.success(msg.msg12);
                    this.$emit('changeInfo');

                }, error => {
                    this.$message.error(msg.msg13);
                });
            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });;
        }

        getSelectedGradeNames(info) {
            return info.grade.reduce((gradeNames, gd) => {
                let targetGrade = this.gradeList.find(grade => {
                    return grade.grade_id === gd;
                });

                gradeNames.push(targetGrade.name)
                return gradeNames;
            }, []);
        }
    }
</script>

<style scoped>

</style>
