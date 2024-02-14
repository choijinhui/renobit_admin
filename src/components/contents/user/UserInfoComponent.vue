<template>
    <div>
        <div class="form-area d-flex">
            <div class="info-container">
                <div class="title d-flex" style="justify-content: space-between">
                    {{$t('common.required')}} {{$t('common.items')}}
                    <div v-if="type=='edit'">
                        <el-button size="small" @click="initPw">{{$t('user.initPwd')}}</el-button>
                        <el-button size="small" @click="unLockUser" v-if="myUserInfo.lock == 'Y'">{{$t('user.unLock')}}</el-button>
                    </div>
                </div>
                <div class="required-info d-flex">
                    <div class="info-label">{{$t('user.id')}}</div>
                    <div style="width: 100%;">
                        <el-input name="id" v-bind:placeholder="$t('user.id')" v-validate="{alpha_num: true, required: true, min: 4, unique: true}"
                                  v-model="myUserInfo.id" v-bind:data-vv-as="$t('user.id')" :disabled="type == 'edit'"></el-input>
                        <div class="error" v-if="$validator.errors.has('id')">{{$validator.errors.first('id')}}</div>
                    </div>
                </div>

                <div class="required-info d-flex">
                    <label class="info-label">{{$t('user.name')}}</label>
                    <div style="width: 100%;">
                        <el-input name="name" v-bind:placeholder="$t('user.name')" v-validate="{required: true, max: 20}"
                                  v-model="myUserInfo.name" v-bind:data-vv-as="$t('user.name') "></el-input>
                        <div class="error" v-if="$validator.errors.has('name')">{{$validator.errors.first('name')}}</div>
                    </div>
                </div>

                <div class="required-info d-flex" v-if="type=='edit'">
                    <label class="info-label">{{$t('user.pwd')}} {{$t('common.change')}}</label>
                    <div>
                        <el-switch v-model="isPwChange" @change="switchChange"></el-switch>
                    </div>
                </div>

                <div class="required-info d-flex" v-if="type=='add' || (type=='edit' && isPwChange)">
                    <label class="info-label">{{type=='add' ?  $t('user.pwd') : $t('user.newPwd')}}</label>
                    <div style="width: 100%;">
                        <div class="info">{{config.policyString}}</div>
                        <el-input type="password" name="pwd" v-bind:placeholder="type == 'add' ? $t('user.pwd') : $t('user.newPwd')" v-validate="{required: true}"
                                  v-model="myUserInfo.pwd" v-bind:data-vv-as="type == 'add' ? $t('user.pwd') : $t('user.newPwd')+ ' '"></el-input>
                        <div class="error" v-if="$validator.errors.has('pwd')">{{$validator.errors.first('pwd')}}</div>
                    </div>

                </div>

                <div class="required-info d-flex" v-if="type=='add' || (type=='edit' && isPwChange)">
                    <label class="info-label">{{type=='add' ? $t('user.pwd') : $t('user.newPwd')}} {{$t('common.confirm')}}</label>
                    <div style="width: 100%;">
                        <el-input type="password" name="confirmPwd" v-bind:placeholder="type == 'add' ? $t('user.pwd') + ' ' + $t('common.confirm') : $t('user.newPwd') + ' ' + $t('common.confirm')"
                                  v-validate="{required: true, confirmed: ['pwd']}"
                                  v-model="myUserInfo.confirmPwd" v-bind:data-vv-as="type=='add' ? $t('user.pwd') + ' ' + $t('common.confirm') + ' ' : $t('user.newPwd') + ' ' + $t('common.confirm') + ' '"></el-input>
                        <div class="error" v-if="$validator.errors.has('confirmPwd')">{{$validator.errors.first('confirmPwd')}}</div>
                    </div>
                </div>

            </div>

            <div style="padding: 10px;"></div>

            <div class="info-container">
                <div class="title d-flex">
                    <div class="label-bullet"></div>
                    {{$t('common.add')}} {{$t('common.items')}}
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('user.department')}}</label>
                    <el-select v-model="myUserInfo.dept" v-bind:placeholder="$t('common.select') +' '+ $t('user.department')" clearable>
                        <el-option v-for="dept in deptList" :key="dept.code"
                                   :label="dept.name" :value="dept.code"></el-option>
                    </el-select>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('user.spot')}}</label>
                    <el-select v-model="myUserInfo.spot" v-bind:placeholder="$t('common.select') +' '+ $t('user.spot')" clearable>
                        <el-option v-for="spot in spotList" :key="spot.code"
                                   :label="spot.name" :value="spot.code"></el-option>
                    </el-select>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('user.position')}}</label>
                    <el-select v-model="myUserInfo.position" v-bind:placeholder="$t('common.select') +' '+ $t('user.position')" clearable>
                        <el-option v-for="spot in positionList" :key="spot.code"
                                   :label="spot.name" :value="spot.code"></el-option>
                    </el-select>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('user.email')}}</label>
                    <div style="width: 100%;">
                        <el-input name="email" v-bind:placeholder="$t('user.email')" v-model="myUserInfo.email" v-validate="{max: 50}"></el-input>
                    </div>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('user.phone')}}</label>
                    <div style="width: 100%;">
                        <el-input name="phone" v-bind:placeholder="$t('user.phone')" v-model="myUserInfo.phone" v-validate="{max: 16}"></el-input>
                    </div>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('grade.gradeList')}}</label>
                    <el-select multiple collapse-tags v-model="myUserInfo.grade" v-bind:placeholder="$t('common.select') +' '+ $t('user.spot')" clearable>
                        <el-option v-for="grade in gradeList" :key="grade.grade_id"
                                   :label="grade.name" :value="grade.grade_id"></el-option>
                        </el-select>
                </div>
                <div class="option-info" id="ip-container">
                    <label class="info-label">{{$t('grade.allowedIp')}}</label>
                    <i v-if="!arrayIpInfo || arrayIpInfo.length == 0"  class="add-input-icon fa fa-plus-circle none-input-icon" @click="addIpInput"></i>
                    <section>
                        <div v-for="(ip, index) in arrayIpInfo" :key="index" class="ip-section-item">
                        <el-input  
                        :placeholder="index == 0 ? '127.0.0.1' : ''"
                        class="ip-input" v-model="arrayIpInfo[index]" v-validate="{max: 50}"></el-input>
                        <i 
                        v-if="index == arrayIpInfo.length - 1" 
                        :class="{'add-input-icon-first':index === 0}"
                        class="add-input-icon fa fa-plus-circle" @click="addIpInput"></i>
                        <i 
                            v-show="arrayIpInfo.length > 1"
                            class="remove-input-icon fa fa-minus-circle" @click="() => removeIdInput(index)"></i>
                        </div>
                    </section>
                </div>

                <div class="option-info d-flex">
                    <label class="info-label">{{$t('grade.viewerControl')}}</label>
                    <div>
                        <el-switch v-model="isControlViewer" @change="switchChange"></el-switch>
                    </div>
                </div>
                
            </div>
        </div>
        <div class="btn-area d-flex">
            <el-button size="small" type="primary" @click="addUser" v-if="type=='add'" :disabled="$validator.errors.any()">{{$t('common.add')}}</el-button>
            <el-button size="small" type="primary" @click="editUser" v-if="type=='edit'" :disabled="$validator.errors.any()">{{$t('common.change')}}</el-button>

            <el-button size="small" type="primary" @click="_onHidden">{{$t('common.close')}}</el-button>
        </div>
    </div>
</template>

<script lang="ts">
    import {Validator} from 'vee-validate';
    import {Component, Vue, Prop} from "vue-property-decorator";

    @Component
	export default class UserInfoComponent extends Vue {
        @Prop()
        userInfo: any;
        @Prop()
        deptList: any;
        @Prop()
        spotList: any;
        @Prop()
        positionList: any;
        @Prop()
        gradeList: any;
        @Prop({default: {policyString:''}})
        config:any;
        @Prop({default: "add"})
        type:string;
        isPwChange: boolean = false;
        isControlViewer: boolean = false;
        userList: any = [];
        myUserInfo: any = {
            id: '',
            name: '',
            pwd: '',
            confirmPwd: '',
            ip:''
        };
        arrayIpInfo = []

        created() {
    
            if(this.userInfo.iscontrolviewer === 'Y'){
                this.isControlViewer = true;
            }else{
                this.isControlViewer = false;
            }
            this.myUserInfo = { ...this.myUserInfo, ...this.userInfo,  };
            this.arrayIpInfo = this.stringToArray(this.myUserInfo.ip)
            if(this.type=='add') {
                this.myUserInfo.lock = 'N';
                
                // 사용자 전체 List ID 중복 체크를 위함. 

                // 사용자 전체 List ID 중복 체크를 위함.
                // UserManagerComponent의 UserList 는 검색조건에 따른 데이터만 존재함;
                this.$adminAPI.getUserList({}).then((res) => {
                    
                    this.userList = res.list;

                    const userIdList = this.userList.map((user) => {
                        return user.user_id
                    })
                    this.setValidation(userIdList);
                });

            }else{
                this.setValidation([]);
            }
            this.myUserInfo.id = this.userInfo.user_id;
        }

        setValidation(userIdList) {
            var msg = this.$i18n.messages.wv;
            const isUnique = value => new Promise((resolve) => {
                if (userIdList.indexOf(value) === -1) {
                    return resolve({
                        valid: true
                    });
                }

                return resolve({
                    valid: false,
                    data: {message: msg.msg14}
                });
            });

            Validator.extend('unique', {
                validate: isUnique,
                getMessage: (field, params, data) => data.message
            });
        }

        addUser() {
            this.myUserInfo.iscontrolviewer = this.isControlViewer ? 'Y' : 'N';

            this.$validator.validateAll().then(()=>{
                if (!this.$validator.errors.any()) {
                    this.settingIpParamForFetch()
                    this.$emit("add", this.myUserInfo);
                }
            })

        }

        editUser() {
            this.myUserInfo.iscontrolviewer = this.isControlViewer ? 'Y' : 'N';

            this.$validator.validateAll().then(()=>{
                if (!this.$validator.errors.any()) {
                    this.settingIpParamForFetch()
                    this.$emit("edit", this.myUserInfo, this.isPwChange);
                }
            })
        }

        switchChange() {
            this.$validator.validateAll();
        }

        initPw() {
            this.$emit("initPw", this.myUserInfo);
        }

        unLockUser() {
            this.$emit("unLockUser", this.myUserInfo);
        }

        _onHidden() {
            this.userList = [];
            this.$emit("close");
        }
        addIpInput() {
            const msg = this.$i18n.messages.wv;
            this.arrayIpInfo = this.arrayIpInfo || []
            if (this.arrayIpInfo.length >= 10) {
                return this.$message.warning(msg.msg41)
            }
            this.arrayIpInfo.push('')
           
        }
        removeIdInput(index) {
            this.arrayIpInfo.splice(index, 1)
            console.log(this.arrayIpInfo)
        }
        stringToArray(string) {
            string = string || ''
            return string.split(',')
        }
        settingIpParamForFetch() {
            this.arrayIpInfo = this.arrayIpInfo.filter(Boolean)
            this.myUserInfo.ip = this.arrayIpInfo.toString()
        }
	}
</script>

<style scoped>
    .required-info div,
    .option-info div {
        width: 100%;
    }

    .form-area {
        padding: 19px;
        align-items: flex-start;
    }

    .info-container {
        border-radius: 5px;
        background-color: #f6f7fb;
        padding: 20px 15px;
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

    .info-container > .option-info {
        width: 400px;
        height: 40px;
        background-color: #ffffff;
        border-left: 7px solid #b9c8f3;
        border-radius: 3px;
        margin-bottom: 10px;
        padding-right: 10px;
    }

    .info-container .info-label {
        width: 150px;
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

    .error {
        margin-top: 2px;
        color: #f56c6c;
    }

    .info {
        text-align: right;
        font-weight: bold;
    }

    .option-info >>> .el-select {
        width: 100%;
    }
    .add-input-icon {
        position:absolute;
        left:-31px;
        cursor: pointer;
    }
    .add-input-icon-first {
        left:-15px;
    }
    .remove-input-icon {
        color:#f56c6c;
        position:absolute;
        left:-15px;
        cursor: pointer;
    }
    .add-input-icon:hover {
        color:#658ed0
    }
    .remove-input-icon:hover {
        color:crimson;
    }
    #ip-container {
        display: flex;
        overflow: auto;
        height:110px;
    }
    #ip-container label {
        position:flex;
        align-self: center;
        flex:0.95;
    }
    #ip-container .none-input-icon {
        position:static;
        flex:auto;
        align-self: center;
        text-align: center;
    }
    #ip-container section {
        position:relative;
        flex:auto;
    }
    #ip-container .ip-section-item {
        display: flex;
        align-items: center;
        margin-top:5px;
        margin-bottom:5px;
    }
    

</style>
