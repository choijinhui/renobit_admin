<template>
    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU006')}}
        </div>

        <div>
            <div class="hLine"></div>
            <div class="d-flex" style="width: 100%; background-color: #e2e7f1; margin-bottom: 20px">
                <div class="header-label">{{$t('policy.policy07')}}</div>
                <div style="width: 100%;">
                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy07')}}</div>
                        <el-button  size="small" type="success" round @click="showModal">{{$t('common.modify')}}
                        </el-button>
                    </div>
                </div>
            </div>

            <div class="hLine"></div>
        </div>


        <div>
            <div class="hLine"></div>
            <div class="d-flex" style="width: 100%; background-color: #e2e7f1;">
                <div class="header-label">{{$t('policy.policy00')}}</div>
                <div style="width: 100%;">
                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy01')}}</div>
                        <el-checkbox v-model="policyInfo.PW_POLICY" true-label="Y" false-label="N">{{$t('common.use')}}</el-checkbox>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy02')}}</div>
                        <el-input-number v-model="policyInfo.PW_LENGTH" :disabled="policyInfo.PW_POLICY == 'N'"
                                         size="mini" controls-position="right"
                                         :min="4" :max="20">
                        </el-input-number>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy03')}}</div>
                        <el-select v-model="policyInfo.PW_MIX"
                                   :disabled="policyInfo.PW_POLICY == 'N'" size="small"
                                   v-bind:placeholder="$t('policy.policy03')" v-bind:no-data-text="$t('policy.messages.msg01')">
                            <el-option v-for="item in mixList" :label="$t('policy.'+item.value)" :key="item.value" :value="item.value"></el-option>
                        </el-select>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy04')}}</div>
                        <el-checkbox v-model="policyInfo.PW_CONTI" :disabled="policyInfo.PW_POLICY == 'N'"
                                     true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy05')}}</div>
                        <el-input-number v-model="policyInfo.PW_PERIOD" :disabled="policyInfo.PW_POLICY == 'N'"
                                         size="mini" controls-position="right"
                                         :min="0" :max="MAX_NUM">
                        </el-input-number>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy06')}}</div>
                        <el-input-number v-model="policyInfo.PW_FAIL_CNT" :disabled="policyInfo.PW_POLICY == 'N'"
                                         size="mini" controls-position="right"
                                         :min="0" :max="MAX_NUM">
                        </el-input-number>
                    </div>

                    <div class="content d-flex" v-if="policyInfo.PW_INIT_USE">
                        <div class="content-label">{{$t('policy.policy18')}}</div>
                        <el-checkbox v-model="policyInfo.PW_INIT_USE" :disabled="policyInfo.PW_POLICY == 'N'"
                                     true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>

                    <div class="content d-flex" v-if="policyInfo.PW_SIMILAR">
                        <div class="content-label">{{$t('policy.policy19')}}</div>
                        <el-checkbox v-model="policyInfo.PW_SIMILAR" :disabled="policyInfo.PW_POLICY == 'N'"
                                     true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy20')}}</div>
                        <el-input-number v-model="policyInfo.PW_RECENT" :disabled="policyInfo.PW_POLICY == 'N'"
                                         size="mini" controls-position="right"
                                         :min="0" :max="MAX_NUM">
                        </el-input-number>
                    </div>
                </div>
            </div>

            <div class="subLine"></div>

            <div class="d-flex" style="width: 100%; background-color: #e2e7f1;">
                <div class="header-label">{{$t('policy.policy08')}}</div>
                <div style="width: 100%;">
                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy08')}}</div>
                        <el-checkbox v-model="policyInfo.INACTIVE_POLICY" true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy09')}}</div>
                        <el-input-number v-model="policyInfo.INACTIVE_PERIOD"
                                         :disabled="policyInfo.INACTIVE_POLICY == 'N'"
                                         size="mini" controls-position="right"
                                         :min="0" :max="MAX_NUM">
                        </el-input-number>
                    </div>
                </div>
            </div>

            <div class="subLine"></div>
             
            <div class="d-flex" style="width: 100%; background-color: #e2e7f1;">
                <div class="header-label">{{$t('policy.policy21')}}</div>
                <div style="width: 100%;">
                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy22')}}</div>
                        <el-checkbox v-model="policyInfo.ADMIN_AUTH" true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>

                    <div class="content d-flex">
                        <div class="content-label">{{$t('policy.policy23')}}</div>
                        <el-checkbox v-model="policyInfo.ALLOWED_IP" true-label="Y" false-label="N">{{$t('common.use')}}
                        </el-checkbox>
                    </div>
                </div>
            </div>

            <div class="subLine"></div>
        </div>

        <div class="btn-area">
            <el-button :disabled="!saveActive" size="medium" type="primary" @click="savePolicy">{{$t('common.save')}}</el-button>
        </div>

        <init-pwd-change-modal></init-pwd-change-modal>

    </div>
</template>

<script lang="ts">
    import InitPwdChangeModal from "./InitPwdChangeModal"
    import {Component, Vue} from "vue-property-decorator";

    @Component({
        components:{
            InitPwdChangeModal
        }
    })
    export default class PolicyManageComponent extends Vue {
        private saveActive:boolean = null;
        policyInfo: any = {
            PW_POLICY: '',
            PW_LENGTH: '',
            PW_MIX: '',
            PW_CONTI: '',
            PW_PERIOD: '',
            PW_FAIL_CNT: '',
            INACTIVE_POLICY: '',
            INACTIVE_PERIOD: '',
            PW_INIT_USE: null,
            PW_SIMILAR: null,
            PW_RECENT: null,
            ADMIN_AUTH:'',
            ALLOWED_IP:''
        };
        mixList: any = [
            {value: "C", label: "기본"},
            {value: "CN", label: "영문/숫자 조합"},
            {value: "CNS", label: "영문/숫자/특수문자 조합"}
        ];
        private title:string;
        private MAX_NUM:number = 9999;

        created() {
            this.getPolicyInfo();
        }

        mounted() {
            this.$watch("policyInfo", function(val) {
                if(this.saveActive === null) this.saveActive = false;
                else this.saveActive = true;
            },{deep:true});
        }

        updated() {

        }

        showModal() {
            this.$modal.show('init-pwd-change');
        }

        getPolicyInfo() {
            this.$adminAPI.getPolicyInfo().then(result => {
                var configList = result;
                let _policyInfo = {};
                configList.map(value => {
                    var config_id = value.config_id;
                    _policyInfo[config_id] = value.value;
                });
                this.policyInfo = _policyInfo;
            })
        }

        savePolicy() {
            var msg = this.$i18n.messages.wv
            this.$confirm(msg.msg05, msg.common.notification, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
            }).then(() => {
                var ary = [];

                $.each(this.policyInfo, (key, data) => {
                    if (key != 'PW_INIT') {
                        ary.push({config_id: key, value: data})
                    }
                });

                this.$adminAPI.setPolicyInfo({policy: ary}).then(result => {
                    this.$message.success(msg.msg06);
                    this.$emit("usePwPolicy", this.policyInfo.PW_POLICY);
                    this.saveActive = false;
                }, error => {
                    console.log(error)
                });

            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });;
        }
    }

</script>

<style scoped>

    .hLine {
        height: 3px;
        background-color: #81acea;
    }

    .subLine {
        height: 1px;
        background-color: #81acea;
    }

    .header-label {
        width: 240px;
        padding-left: 22px;
        font-weight: bold;
        color: #5269ab;
    }

    .content {
        border-bottom: 1px solid #dfe1f3;
        background-color: #f0f1f5;
        height: 40px;
        line-height: 40px;
    }

    .content .content-label {
        width: 420px;
        font-weight: bold;
        padding-left: 50px;
        color: #8d8d8d;
    }

    .content >>> .el-input-number {
        width: 176px;
    }

    .btn-area {
        width: 100%;
        padding-top: 30px;
        text-align: center;
    }

</style>
