<template>
    <modal
        class="pnid-license-change"
        name="pnid-license-change"
        :click-to-close="false"
        :reset="true"
        :width="670"
        :height="469"
        :min-width="670"
        :min-height="469"
        @before-open="initLicense">
        <div class="modal-header">
            <span>{{$t('license.licenseChange')}}</span>
        </div>
        <el-form
            ref="formRef"
            :model="license"
        >
            <div class="license-box">
                <div class="license-type">
                <span>{{ $t('license.type') }}</span>
                <div>
                    <el-radio-group
                        v-model="license.type"
                        :disabled="licenseCheck"
                    >
                    <el-radio
                        label="P"
                        checked
                    >
                        {{ $t('license.commercialLicense') }}
                    </el-radio>
                    <el-radio label="T">{{ $t('license.trialLicense') }}</el-radio>
                    </el-radio-group>
                </div>
                </div>
            </div>

            <div
                v-if="license.type === LicenseType.PERMANENT"
                class="license-box license-input-box"
            >
                <div class="ip">
                    <span>IP</span>
                <div>
                    <div v-for="(ip, i) in license.ipList" class="ip-list" :key="i">
                        <el-form-item
                            :prop="'ipList.'+ i + '.value'"
                            :rules="[
                                {
                                    required: true,
                                    message: $t('common.requried', { msg: $t('license.ip') }),
                                    trigger: 'change'
                                },
                                {
                                    validator: validateIp,
                                    trigger: 'change'
                                }
                            ]"
                        >
                            <el-input
                                v-model="ip.value"
                                :disabled="licenseCheck"
                            />
                            <i v-if="i === 0" class="ip-plus el-icon-circle-plus" @click="handleAddIp"></i>
                            <i v-else class="el-icon-error minus" @click="handleRemoveIp(i)"></i>
                        </el-form-item>
                    </div>
                </div>
                </div>
                <div class="user-number">
                    <span>{{ $t('license.userLicense') }}</span>
                    <div>
                        <el-input-number
                            v-model="license.user"
                            :min="0"
                            :max="99999"
                            :disabled="licenseCheck"
                            size="small"
                            controls-position="right"
                        />
                    </div>
                </div>
                <div class="drawing-number">
                    <span>{{ $t('license.drawing') }}</span>
                    <div>
                        <el-input-number
                            v-model="license.drawing"
                            :min="0"
                            :max="99999"
                            :disabled="licenseCheck"
                            size="small"
                            controls-position="right"
                        />
                    </div>
                </div>
            </div>

            <div class="license-box">
                <div
                    v-if="license.type === LicenseType.TRIAL"
                    class="expiry"
                >
                    <span>{{ $t('license.expirationDt') }}</span>
                    <div>
                        <el-form-item
                            prop="expiryDate"
                            :rules="{
                                required: true,
                                message: $t('common.requried', { msg: $t('license.expirationDt') }),
                                trigger: 'change'
                            }"
                        >
                            <el-select
                                v-model="license.expiryDate"
                                :placeholder="$t('license.expirationDt')"
                                :disabled="licenseCheck"
                            >
                                <el-option
                                    :label="currentMonthDay"
                                    :value="currentMonthDay"
                                />
                                <el-option
                                    :label="nextMonthDay"
                                    :value="nextMonthDay"
                                />
                            </el-select>
                        </el-form-item>
                    </div>
                </div>

                <div class="license-key">
                    <span>{{ $t('license.licenseKey') }}</span>
                    <div>
                        <div>
                        <input
                            v-for="(_, index) in license.licenseKey"
                            :key="index"
                            v-model="license.licenseKey[index]"
                            :disabled="licenseCheck"
                            @keyup="pasteLicense"
                           @keydown="pasteLicense"
                        />
                        </div>
                        <div
                            :class="['error', { 'active': !formValidation.license && licenseErrorOn }]"
                        >
                            {{ $t('common.requried', { msg: $t('license.__name__') }) }}
                        </div>
                        <div
                            v-if="formValidation.license"
                            :class="['error', { 'active': !formValidation.licenseType && licenseErrorOn }]"
                        >
                            {{ $t('license.errorLicenseFormat') }}
                        </div>
                    </div>
                    <div>
                        <el-button
                            native-type="button"
                            :disabled="licenseCheck"
                            @click="handleValidate"
                        >
                            {{ $t('license.testLicense') }}
                        </el-button>
                    </div>
                </div>
            </div>

            <div class="buttons">
                <el-button
                    :disabled="!licenseCheck"
                    native-type="button"
                    @click="handleSubmit"
                >
                    {{ $t('common.save') }}
                </el-button>
                <el-button type="info" @click="() => this.close()">{{ $t('common.close') }}</el-button>
            </div>
        </el-form>
    </modal>
</template>

<script lang="ts">
import { LocaleMessageObject } from 'vue-i18n';
import { Component, Vue } from 'vue-property-decorator'
import AdminUtil from '../../../api/AdminUtil';
import * as constants from '../../../api/Constants';

export enum LicenseType {
    TRIAL = 'T',
    PERMANENT = 'P'
}

export enum LicenseStatus {
    NONE = 'NONE',
    EXPIRY = 'EXPIRY',
    ACTIVATE = 'ACTIVATE',
}

export type LicenseForm = {
    type: LicenseType;
    user: number;
    drawing: number;
    licenseKey: [string, string, string, string];
    ipList: { value: string }[];
    expiryDate?: string;
}

export type LicenseRequest = Omit<LicenseForm, 'licenseKey' | 'ipList'> & {
    ipList: string[];
    licenseKey: string;
}


@Component
export default class LicenseChangeModal extends Vue {
    license:LicenseForm = {
        type: LicenseType.PERMANENT,
        user: 0,
        drawing: 0,
        licenseKey: ['', '', '', ''],
        ipList: [{ value: '' }],
        expiryDate: ''
    }

    formValidation: {
        license: boolean,
        ip: boolean,
        licenseType: boolean,
        expiryDate: boolean
    } = {
        license: false,
        licenseType: false,
        ip: false,
        expiryDate: false,
    };

    licenseCheck = false;
    licenseErrorOn = false;
    currentMonthDay = '';
    nextMonthDay = '';

    LicenseType = LicenseType;

    initLicense() {
        this.license = {
            type: LicenseType.PERMANENT,
            user: 0,
            drawing: 0,
            licenseKey: ['', '', '', ''],
            ipList: [{ value: '' }],
            expiryDate: ''
        };

        this.formValidation = {
            license: false,
            licenseType: false,
            ip: false,
            expiryDate: false,
        };

        this.licenseCheck = false;
        this.licenseErrorOn = false;
        this.currentMonthDay = '';
        this.nextMonthDay = '';
        this.currentMonthDay = AdminUtil.getCurrentMonthLastDate();
        this.nextMonthDay = AdminUtil.getNextMonthLastDate();
    }

    handleAddIp() {
        this.license.ipList.push({ value: '' });
    }

    handleRemoveIp(i: number) {
        this.license.ipList.splice(i, 1);
    }

    changeLicenseRequest(form: LicenseForm): LicenseRequest {
        return {
            ...form,
            licenseKey: form.licenseKey.join('-'),
            ipList: form.ipList.map(({ value }) => value)
        }
    };

    close() {
        this.$modal.hide("pnid-license-change");
    }

    async handleSubmit() {
        const { type, message, error } = await this.saveLicense(this.changeLicenseRequest(this.license));
        this.$message[type](message);

        if (!error) {
            this.$emit("changeLicense");
            this.close();
        }
    }

    async saveLicense(form: LicenseRequest) {
        const i18n = this.$i18n.messages.wv as LocaleMessageObject;

        try {
            await (this as any).$licenseAPI.changeLicense({
                ...form,
                lic_key: form.licenseKey,
                ipList: form.ipList.join(),
                module: constants.PNID
            });
            return {
                error: false,
                type: 'success',
                message: i18n.msg06
            };
        } catch (error) {
            return {
                error: true,
                type: 'error',
                message: i18n.msg07
            };
        }
    }

    handleValidate() {
        const formEl = this.$refs.formRef as any;
        if (!formEl) return;

        this.formValidation.license = !this.license.licenseKey
            .some((license) => !license.trim());
        this.formValidation.licenseType = !this.license.licenseKey
            .some((license) => license.search(/[A-Z]{4,}$/) === -1);

        this.licenseErrorOn = true;

        formEl.validate(async (valid) => {
            this.formValidation.ip = valid;

            if (!(this.formValidation.ip
                && this.formValidation.license)) {
                return;
            }

            const {
                type, message, error
            } = await this.validateLicense(this.changeLicenseRequest(this.license));

            this.$message[type](message);
            this.licenseCheck = !error;
        });
    }

    async validateLicense(form: LicenseRequest) {
        const i18n = this.$i18n.messages.wv.license as LocaleMessageObject;

        try {
            const { validation } = await (this as any).$licenseAPI.checkLicenseKey({ ...form, module: constants.PNID });

            if (!validation) {
                throw new Error();
            }

            return {
                error: false,
                type: 'success',
                validation,
                message: i18n.success
            };
        } catch (error) {
            return {
                error: true,
                type: 'error',
                message: i18n.fail
            };
        }
    }

    validateIp(_: any, value: string, callback: Function) {
        if (value && value.search(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
            callback((this.$i18n.messages.wv.license as LocaleMessageObject).errorIpFormat);
        }

        callback();
    };

    pasteLicense(event: KeyboardEvent) {
        const { value } = event.target as HTMLInputElement;

        if (value.length > 15) {
            const str = value.split('-');

            str.forEach((value, i) => {
                this.license.licenseKey[i] = value;
            });
        }

        this.$forceUpdate();
    };
}
</script>

<style scoped>
.pnid-license-change >>> .el-form {
    padding: 30px 20px;
}

.license-box,
.license-input-box {
    background: #f4f5f9;
    padding: 0 20px;
    border-radius: 10px;
}

.license-box:not(:last-child) {
  margin-bottom: 20px;
}

.license-box > div:not(.ip) {
  height: 50px;
}

.license-input-box > div.ip {
  padding: 16px 0;
  align-items: flex-start;
}

.license-input-box > div.ip > div {
  flex: 1;
}

.ip-list:not(:last-child) {
  margin-bottom: 5px;
}

.license-box > div > span {
  width: 120px;
  background: #e5e8ef;
  padding: 5px 20px;
  border-radius: 20px;
  margin-right: 10px;
}

.license-type,
.license-input-box > div {
  display: flex;
  align-items: center;
}

.expiry {
  display: flex;
  align-items: flex-start;
  padding-top: 20px;
}

.expiry + .license-key {
  padding-top: 0;
}

.el-radio-group {
  display: flex;
  flex-wrap: nowrap;
}

.license-key {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 17px 0;
  box-sizing: border-box;
  height: 60px !important;
}

.license-key > div:not(:last-child) {
  display: flex;
  flex: 1;
  justify-content: space-between;
  flex-direction: column;
  height: 39px;
}

.license-key > div:not(:last-child) > div:first-child {
  display: flex;
  flex: 1;
  justify-content: space-between;
}

.license-key input,
.license-input-box .ip input {
  width: 60px;
  height: 27px;
  box-sizing: border-box;
  border: 1px solid #cbcbcb;
  border-radius: 4px;
  padding: 0 10px;
}

.license-input-box .ip input {
  width: 200px;
}

.license-key .error {
  font-size: 12px;
  color: #f56c6c;
  line-height: 1;
  position: relative;
  display: none;
}

.license-key .error.active {
  display: block;
}

.license-input-box > div:not(:last-child) {
  border-bottom: 1px dashed #dedfe3;
}

.license-key button {
  height: 27px;
  width: 150px;
  padding: 6px 0;
}

.license-key input {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #d8dce5;
  box-sizing: border-box;
  color: #5a5e66;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 1;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
  height: 27px;
  border-color: #b4bccc;
  margin-right: 5px;
}

.ip-plus,
.minus {
  font-size: 20px;
  cursor: pointer;
  position: relative;
  top: 3px;
}

.buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.pnid-license-change >>> .el-input__inner {
  height: 27px;
}

.pnid-license-change >>> .el-radio__label {
  position: relative;
  top: 2px;
}

.ip-list {
  display: flex;
  align-items: center;
}

.ip-list > div:not(:last-child) {
  margin-bottom: 5px;
}

.pnid-license-change >>> .el-form-item__content {
  flex-wrap: nowrap;
  flex-wrap: wrap;
}


.pnid-license-change >>> .el-form-item {
  margin-bottom: 0;
  width: 100%;
}

.ip >>> .el-input {
  width: 200px;
}

.pnid-license-change >>> .el-form-item__error {
  position: relative;
  top: 0;
  width: 100%;
}

.pnid-license-change >>> .el-form-item__content {
    line-height: inherit;
}

.pnid-license-change >>> .v--modal {
      overflow-y: auto;
}

.license-input-box > div.user-number {
    display: none;
}
</style>
