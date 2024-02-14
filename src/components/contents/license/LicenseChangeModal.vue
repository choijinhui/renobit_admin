<template>
    <modal name="license-change"
           :click-to-close="false"
           :reset="true"
           :width="670"
           :height="560"
           :min-width="670"
           :min-height="560"
           @before-open="initLicense">
        <div class="modal-header">
            <span>{{$t('license.licenseChange')}}</span>
            <!--<a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>-->
        </div>

        <div class="modal-content">
            <div class="key-area">
                <div class="d-flex">
                    <div class="key-label">{{$t('license.licenseKey')}}</div>
                    <input class="input" type="text"
                           :disabled="check"
                           @keyup="pasteLicense($event)"
                           @keydown="pasteLicense($event)"
                           name="key" v-bind:data-vv-as="$t('license.licenseKey') + ' '"
                           v-validate="{required: true, regex: '[A-Z]{4,}$'}"
                           v-for="(key, index) in licenseKey" v-model.trim="licenseKey[index]">
                    <el-button type="success" size="small" style="margin-left: 15px;" @click="btnCheckLicense"
                               v-if="!check">{{$t('license.testLicense')}}
                    </el-button>
                    <el-button type="success" size="small" style="margin-left: 15px;" v-if="check" @click="initLicense">
                        {{$t('license.initLicense')}}
                    </el-button>
                </div>

                <div class="error" v-if="errors.has('key')">{{errors.first('key')}}</div>

            </div>

            <div class="license-info" :disabled="check">
                <div class="info-box">
                    <div class="info-label">{{$t('license.licenseType')}}</div>
                    <div class="info-value">
                        <el-radio-group ref="licenseType" v-model="type" @change="changeLicenseType" :disabled="check">
                            <el-radio label="P">{{$t('license.commercialLicense')}}</el-radio>
                            <el-radio label="T">{{$t('license.trialLicense')}}</el-radio>
                        </el-radio-group>
                    </div>
                </div>

                <div class="permanent-info" v-if="licenseInfo != null">
                    <div class="dashLine"></div>
                    <div class="info-box">
                        <div class="info-label">{{$t('license.use3D')}}</div>
                        <div class="info-value">
                            <el-checkbox v-model="licenseInfo.use3D" :disabled="check">{{$t('license.use')}}</el-checkbox>
                        </div>
                    </div>

                    <div class="info-box">
                        <div class="info-label">IP</div>
                        <div class="info-value" v-if="type == 'P'">
                            <div class="d-flex" style="align-items: flex-start;"
                                 v-for="(item, index) in licenseInfo.ipInfo.ipList" :key="index">
                                <div>
                                    <el-input :disabled="check" :name="index + ''" class="ip-input" v-model="item.ip"
                                              data-vv-as="IP" v-validate="{required: true, ip: true}"></el-input>
                                    <div class="error" v-if="errors.has(index+'')">{{errors.first(index+'')}}</div>
                                </div>
                                <el-button type="text" size="small" :disabled="check"
                                           v-if="licenseInfo.ipInfo.ipList.length-1 != index" @click="removeIP(index)"
                                           style="padding: 0 3px;">
                                    <i class="fa fa-minus-circle fa-2x"></i>
                                </el-button>

                                <el-button type="text" size="small" :disabled="check"
                                           v-if="licenseInfo.ipInfo.ipList.length-1 == index" @click="addIP()"
                                           style="padding: 0 3px;">
                                    <i class="fa fa-plus-circle fa-2x"></i>
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <div class="info-box">
                        <div class="info-label">{{$t('license.userLicense')}}</div>
                        <div class="info-value">
                            <el-input-number :disabled="check" v-model="licenseInfo.licenseUser" size="mini"
                                             controls-position="right" :min="0" :max="2000"></el-input-number>
                        </div>
                    </div>

                    <div class="info-box">
                        <div class="info-label">{{$t('license.sessionLicense')}}</div>
                        <div class="info-value">
                            <el-input-number :disabled="check" v-model="licenseInfo.sessionUser" size="mini"
                                             controls-position="right" :min="0" :max="2000"></el-input-number>
                        </div>
                    </div>

                </div>
            </div>

            <div class="modal-btn-area">
                <el-button size="small" type="primary" :disabled="!check" @click="saveLicense">{{$t('common.save')}}</el-button>
                <el-button size="small" type="primary" @click="_onHidden">{{$t('common.close')}}</el-button>
            </div>

        </div>
    </modal>

</template>
<script lang="ts">
    import adminUtil from "../../../api/AdminUtil"
    import {Component, Vue, Prop} from 'vue-property-decorator'

    @Component
    export default class LicenseChangeModal extends Vue {
        @Prop() isRouter: boolean;
        type: string = 'P';
        licenseKey: any = null;
        licenseInfo: any = null;
        check: boolean = false;
        param:any = {};

        _onHidden() {
            this.$modal.hide("license-change");

            const module = this.$route.query.module
            if (this.isRouter) {
                adminUtil.redirectToSolution(module)
            }
        }

        initLicense() {
            this.check = false;
            this.type = 'P';
            this.licenseKey = ['', '', '', ''];
            this.licenseInfo = {
                ipInfo: {
                    type: "IPv4",
                    ipList: [{ip: null}]
                },
                licenseUser: 0,
                sessionUser: 0
            };
            this.param = null;

            $(".permanent-info").show();
        }

        changeLicenseType() {
            $(".permanent-info").animate({height: "toggle"}, 1000);

            if (this.type == 'T') {
                this.licenseInfo = {
                    ipInfo: {
                        type: "IPv4",
                        ipList: [{ip: null}]
                    }
                };
            }
        }

        btnCheckLicense() {
            var msg = this.$i18n.messages.wv;
            this.$validator.validateAll().then(()=>{
                if (this.$validator.errors.any()) {
                    this.$message.info(msg.msg18);
                    return;
                }

                this.$loading({});
                // 라이선스 키 조합 & 확인
                this.makeLicenseInfo(this.licenseInfo, this.type);
            });
        }

        makeLicenseInfo(info, type) {
            var msg = this.$i18n.messages.wv;
            var param:any = {};
            var str = type + "|";

            if (type == 'P') {
                // 3D 사용 여부
                str += info.use3D ? 'Y|' : 'N|';
                // IP
                var ipList = info.ipInfo.ipList;

                for (var i = 0; i < ipList.length; i++) {
                    str += ipList[i].ip;
                    if (i != ipList.length - 1) {
                        str += ","
                    }
                }
                // 사용자 라이선스 카운트
                str += "|" + info.licenseUser.toString();
                // 세션 라이선스 카운트
                str += "|" + info.sessionUser.toString();

                param.licenseInfo = str;
            } else {

                var info:any = [];

                // 날짜 추가
                let now = new Date();
                let mm;
                let dd;
                let lastDay;
                let nextDate;

                mm = now.getMonth() + 1;
                dd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                info.push(str + [now.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join(''));
                lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                nextDate = new Date(lastDay.setDate(lastDay.getDate() + 1));
                mm = nextDate.getMonth() + 1;
                dd = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                info.push(str + [nextDate.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join(''));

                param.licenseInfo = info;
            }

            param.licenseKey = '';

            this.licenseKey.map((key, index) => {
                param.licenseKey += key;
                if (index != 3)
                    param.licenseKey += "-";
            });

            param.licenseType = type;

            this.$licenseAPI.checkLicenseKey(param).then(result => {
                this.$loading({}).close();
                if (!result.isValid) {
                    this.$message.error(msg.msg19);
                } else {
                    this.$message.info(msg.msg20);
                    this.check = true;
                    this.param = result;
                }
            })
        }

        addIP() {
            this.licenseInfo.ipInfo.ipList.push({ip: null});
        }

        removeIP(index) {
            this.licenseInfo.ipInfo.ipList.splice(index, 1);
        }

        saveLicense() {
            var msg = this.$i18n.messages.wv;
            this.$validator.validateAll().then(()=>{
                if (!this.$validator.errors.any()) {
                    this.$confirm(msg.msg05, msg.common.notification, {
                        confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
                    }).then(() => {
                        var newParam:any = {};
                        newParam.lic_key = this.param.licKey;
                        newParam.module = 'renobit';

                        if (this.type == 'P') {
                            var lic_info:any = {};
                            lic_info.type = "permanent";
                            lic_info.ipInfo = {};
                            lic_info.ipInfo.type = 'IPv4';
                            lic_info.ipInfo.ipList = [];
                            lic_info.licenseUser = this.licenseInfo.licenseUser.toString();
                            lic_info.sessionUser = this.licenseInfo.sessionUser.toString();
                            lic_info.use3D = this.licenseInfo.use3D ? 'Y' : 'N';

                            this.licenseInfo.ipInfo.ipList.map(value => {
                                lic_info.ipInfo.ipList.push(value.ip);
                            });

                            newParam.lic_info = JSON.stringify(lic_info);

                        } else {
                            newParam.lic_info = JSON.stringify({
                                "type": "trial",
                                "period": this.param.licInfo.split("T|")[1]
                            });
                        }

                        this.$licenseAPI.changeLicense(newParam).then(result => {
                            this.$message.info(msg.msg06);
                            if (this.isRouter) {
                                this._onHidden();
                                // this.$emit("changeLicense");
                                // location.href = "./login.do";
                            } else {
                                this._onHidden();
                                this.$emit("changeLicense");
                            }
                        });

                    }).catch((response) => {
                        if (response === 'cancel') {
                            this.$message(msg.msg40);
                        }
                    });
                }
            });
        }

        pasteLicense(event) {
            var $this = this;

        //    setTimeout(() => {
                var value:string = $(event.target).val() + "";

                $this.licenseKey.map((key, index) => {
                    if (value.length == 16) {
                        $this.licenseKey[index] = value.substr(index * 4, 4);
                    } else if (value.length > 16) {
                        if (index < 4) {
                            $this.licenseKey[index] = value.split("-")[index];
                        }
                    }
                });

                $this.$validator.validateAll();
        //    }, 10);
        }
    }
</script>
<style scoped>

    .dashLine {
        height: 1px;
        border-bottom: 1px dashed #dedfe3;
        padding-bottom: 15px;
    }

    .ip-input {
        padding-right: 10px;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }

    .modal-content > .key-area {
        width: 540px;
        height: 99px;
        border: 1px solid #e9eaee;
        border-radius: 50px;
        margin: 20px 0;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .modal-content > .key-area .key-label {
        font-size: 14px;
        font-weight: bold;
        padding-right: 10px;
        margin-right: 10px;
        border-right: 1px solid #e9ecef;
    }

    .modal-content > .license-info {
        width: 596px;
        background-color: #f4f5f9;
        padding-bottom: 15px;
        border-radius: 5px;
    }

    .modal-content > .license-info > .info-box,
    .modal-content > .license-info > .permanent-info > .info-box {
        display: flex;
        align-items: baseline;
        padding: 15px;
        padding-bottom: 0px;
    }

    .modal-content > .license-info > .info-box > .info-label,
    .modal-content > .license-info > .permanent-info > .info-box > .info-label {
        width: 164px;
        height: 26px;
        background-color: #E5E8EF;
        margin-left: 10px;
        margin-right: 27px;
        padding-left: 40px;
        border-radius: 22px;
        line-height: 26px;
        color: #1c1c1c;
        font-weight: bold;
    }

    .modal-content > .license-info > .permanent-info {
        height: 216px;
        overflow: auto;
    }

    .modal-content > .modal-btn-area {
        width: 100%;
        text-align: center;
        padding: 13px 10px;
        border-top: 1px solid #e9ecef;
        margin-top: 35px;
    }

    .input {
        -webkit-appearance: none;
        background-color: #ffffff;
        border-radius: 4px;
        border: 1px solid #d8dce5;
        box-sizing: border-box;
        color: #5a5e66;
        display: block;
        font-size: 12px;
        height: 27px;
        line-height: 1;
        margin-right: 8px;
        margin-bottom: 1px;
        outline: none;
        padding: 0 8px;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        width: 56px;
        text-align: center;
    }

    .input:hover {
        border-color: #b4bccc;
    }

    .input:focus {
        outline: none;
        border-color: #363a45;
    }

    .input:disabled {
        outline: none;
        color: #cfcfcf;
    }

    .error {
        margin-top: 2px;
        color: #f56c6c;
    }

</style>
