<template>
    <modal name="user-add"
           :click-to-close="false"
           :reset="true"
           :width="950"
           :height="700"
           :min-width="950"
           :min-height="600"
           draggable=".modal-header"
           @before-open="beforeOpen">
        <div class="modal-header">
            <span>{{$t('user.__name__')}} {{$t('common.add')}} {{$t('common.popup')}}</span>
            <a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>
        </div>
        <user-info-component
                    :userInfo="userInfo"
                   :deptList="deptList"
                   :spotList="spotList"
                   :positionList="positionList"
                   :config="config"
                   :gradeList="gradeList"
                   type="add"
                   @close="_onHidden"
                   @add="addUser"
        ></user-info-component>
    </modal>
</template>

<script lang="ts">
    import util from "../../../../api/AdminUtil"
    import {Component, Vue} from "vue-property-decorator";
    import UserInfoComponent from "../UserInfoComponent.vue";

    @Component({
        components: {
            UserInfoComponent
        }
    })
    export default class UserAddModal extends Vue {
        deptList: any = [];
        spotList: any = [];
        positionList: any = [];
        gradeList:any = [];
        config:any = {policyString:''};
        userInfo: any = {
            position: null,
            dept: null,
            spot: null
        };

        _onHidden() {
            this.$modal.hide("user-add");
        }

        beforeOpen(event) {
            this.deptList = event.params.deptList;
            this.spotList = event.params.spotList;
            this.positionList = event.params.positionList;
            this.config = event.params.config;
            this.gradeList = event.params.gradeList;
            this.userInfo = {}; // 생성 시, userInfo 초기화
        }

        addUser(userInfo) {
            var msg = this.$i18n.messages.wv;
            var info = JSON.parse(JSON.stringify(userInfo));
            info.pwd = encrypt(userInfo.pwd);
            info.confirmPwd = encrypt(userInfo.pwd);

            if (this.config.PW_POLICY == 'Y') {
                info.newAdd = true;
                this.$adminAPI.validationPwdCheck(info).then(result =>{
                    if(result.result) {
                        this.gradeNames = this.getSelectedGradeNames(info);
                        this.$adminAPI.addUser(info).then(result => {
                            this.$adminAPI.changeGrade(info).then(result => {
                                this.$message.success(msg.msg15);
                                this.$emit('getUserList');
                                this._onHidden();
                            }, error => {
                                this.$message.error(`${error}, ${msg.msg16}`);
                            })
                        }, error => {
                            this.$message.error(`${error}, ${msg.msg16}`);
                        });

                    } else {

                        this.$message.error(util.convertPwdCode(result.data));

                    }
                });
            } else {
                this.gradeNames = this.getSelectedGradeNames(info);
                this.$adminAPI.addUser(info).then(result => {
                    this.$adminAPI.changeGrade(info).then(result => {
                        this.$message.success(msg.msg15);
                        this.$emit('getUserList');
                        this._onHidden();
                    }, error => {
                        this.$message.error(msg.msg16);
                    })
                }, error => {
                    this.$message.error(msg.msg16);
                });
            }
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
