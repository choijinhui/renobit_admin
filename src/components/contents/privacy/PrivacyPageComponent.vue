<template>
    <div class="privacy-area">
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('privacy.title')}}
        </div>
        <el-tabs type="card" v-model="activeTabName" @tab-click="tabClick">
            <el-tab-pane v-bind:label="$t('privacy.__name__')" name="userInfo">
                <div class="info-area">
                    <div :class="[{ language: language() }, 'info-container']">
                        <div class="title d-flex">
                            <div class="label-bullet"></div>
                            {{$t('common.required')}}{{$t('common.items')}}
                        </div>
                        <div class="required-info d-flex">
                            <label class="info-label">{{$t('user.id')}}</label>
                            <el-input name="user_id" v-bind:placeholder="$t('user.id')" disabled v-model="info.user_id"></el-input>
                        </div>

                        <div class="required-info d-flex">
                            <label class="info-label">{{$t('user.name')}}</label>
                            <div>
                                <el-input name="name" v-bind:placeholder="$t('user.name')" v-validate="{required: true, max: 20}"
                                          v-model="info.name" v-bind:data-vv-as="$t('user.name') + ' '"></el-input>
                                <div class="error" v-if="errors.has('name')">{{errors.first('name')}}</div>
                            </div>
                        </div>

                        <div class="required-info d-flex">
                            <label class="info-label">{{$t('user.pwd')}} {{$t('common.change')}}</label>
                            <div>
                                <el-switch v-model="isPwChange" @change="switchChange"></el-switch>
                                <div class="info">{{config.policyString}}</div>
                            </div>
                        </div>

                        <div class="required-info d-flex" v-if="isPwChange">
                            <label class="info-label">{{$t('user.currentPwd')}}</label>
                            <div>
                                <el-input type="password" name="currentPwd" v-bind:placeholder="$t('user.currentPwd')"
                                          v-validate="{required: true}"
                                          v-model="info.currentPwd"  v-bind:data-vv-as="$t('user.currentPwd') + ' '"></el-input>
                                <div class="error" v-if="errors.has('currentPwd')">{{errors.first('currentPwd')}}</div>
                            </div>
                        </div>

                        <div class="required-info d-flex" v-if="isPwChange">
                            <label class="info-label">{{$t('user.newPwd')}}</label>
                            <div>
                                <el-input type="password" name="pwd" v-bind:placeholder="$t('user.newPwd')" v-validate="{required: true}"
                                          v-model="info.pwd" v-bind:data-vv-as="$t('user.newPwd') + ' '" ref="pwd"></el-input>
                                <div class="error" v-if="errors.has('pwd')">{{errors.first('pwd')}}</div>
                            </div>
                        </div>

                        <div class="required-info d-flex" v-if="isPwChange">
                            <label class="info-label">{{$t('user.newPwd')}} {{$t('common.confirm')}}</label>
                            <div>
                                <el-input type="password" name="confirmPwd" v-bind:placeholder="$t('user.newPwd') + ' ' + $t('common.confirm')"
                                          v-validate="'required|confirmed:pwd'"
                                          v-model="info.confirmPwd" v-bind:data-vv-as=" $t('user.newPwd') + ' ' + $t('common.confirm') + ' '"></el-input>
                                <div class="error" v-if="errors.has('confirmPwd')">{{errors.first('confirmPwd')}}</div>
                            </div>
                        </div>
                    </div>

                    <div class="info-container">
                        <div class="title d-flex">
                            <div class="label-bullet"></div>
                            {{$t('common.add')}}{{$t('common.items')}}
                        </div>

                        <div class="option-info d-flex">
                            <label class="info-label">{{$t('user.department')}}</label>
                            <el-select v-model="info.dept" v-bind:placeholder="$t('common.select') + ' ' + $t('user.department')" clearable>
                                <el-option v-for="dept in deptList" :key="dept.code"
                                           :label="dept.name" :value="dept.code"></el-option>
                            </el-select>
                        </div>

                        <div class="option-info d-flex">
                            <label class="info-label">{{$t('user.spot')}}</label>
                            <el-select v-model="info.spot" v-bind:placeholder="$t('common.select') + ' ' + $t('user.spot')" clearable>
                                <el-option v-for="spot in spotList" :key="spot.code"
                                           :label="spot.name" :value="spot.code"></el-option>
                            </el-select>
                        </div>

                        <div class="option-info d-flex">
                            <label class="info-label">{{$t('user.position')}}</label>
                            <el-select v-model="info.position" v-bind:placeholder="$t('common.select') + ' ' + $t('user.position')" clearable>
                                <el-option v-for="spot in positionList" :key="spot.code"
                                           :label="spot.name" :value="spot.code"></el-option>
                            </el-select>
                        </div>

                        <div class="option-info d-flex">
                            <label class="info-label">{{$t('user.email')}}</label>
                            <div style="width: 100%;">
                                <el-input name="email" v-bind:placeholder="$t('user.email')" v-model="info.email" v-validate="{max: 50}"></el-input>
                                <div class="error" v-if="$validator.errors.has('email')">{{$validator.errors.first('email')}}</div>
                            </div>
                        </div>

                        <div class="option-info d-flex">
                            <label class="info-label">{{$t('user.phone')}}</label>
                            <div style="width: 100%;">
                                <el-input name="phone" v-bind:placeholder="$t('user.phone')" v-model="info.phone" v-validate="{max: 16}"></el-input>
                                <div class="error" v-if="$validator.errors.has('phone')">{{$validator.errors.first('phone')}}</div>
                            </div>
                        </div>

                    </div>
                </div>

            </el-tab-pane>
            <el-tab-pane v-if="renobitInstalled" v-bind:label="$t('menu.__name__') + $t('common.manage')" name="menuInfo">
                <div class="btn-wrap">
                    <el-tooltip :content="$t('msg23')" placement="top">
                        <el-button @click="initRenobit()" size="medium">
                            <i class="el-icon-refresh"></i> {{$t('common.init')}}</el-button>
                    </el-tooltip>
                </div>
                <div class="menu-area">
                    <page-grade-setting
                        ref="pageSetting"
                        v-bind:pageList="pageList" v-bind:init_page="init_page"
                        v-bind:use_page="use_page">
                    </page-grade-setting>
                </div>
            </el-tab-pane>

            <el-tab-pane v-if="pnidInstalled" v-bind:label="$t('pnid.drawing') + $t('common.manage')" name="pnidInfo">
                <div class="btn-wrap">
                    <el-tooltip :content="$t('pnid.msg00')" placement="top">
                        <el-button @click="initPnid()" size="medium">
                            <i class="el-icon-refresh"></i> {{$t('common.init')}}</el-button>
                    </el-tooltip>
                </div>
                <div class="menu-area">
                    <pnid-page-grade-setting
                        ref="pnidSetting"
                        v-bind:drawingList="drawingList"
                        v-bind:useDrawingList="useDrawingList"
                        v-bind:init_page="init_page" />
                </div>
            </el-tab-pane>

            <div class="btn-area">
                <el-button size="small" type="primary" @click="saveUserInfo" :disabled="$validator.errors.any()">{{$t('common.save')}}</el-button>
            </div>
        </el-tabs>
    </div>
</template>

<script lang="ts">
    import util from "../../../api/AdminUtil"
    import {Component, Prop, Vue} from "vue-property-decorator";
    import PageGradeSetting from "../PageGradeSetting.vue";
    import PnidPageGradeSetting, { Drawing } from "../PnidPageGradeSetting.vue";
    import { LocaleMessageObject } from "vue-i18n";
    import * as constants from "../../../api/Constants";

    @Component({
        components: {
            'page-grade-setting': PageGradeSetting,
            PnidPageGradeSetting
        }
    })
    export default class PrivacyPageComponent extends Vue {
        activeTabName: string = "userInfo";
        isPwChange: boolean = false;
        info: any = {};
        deptList: any = [];
        spotList: any = [];
        positionList: any = [];
        pageList: any = [];
        initDrawingList: Drawing[] = [];
        drawingList: Drawing[] = [];
        init_page: string = '';
        use_page: any = [];
        useDrawingList: string[] = [];
        tmpUserList: any = [];
        codeList: any = [];
        bkUserInfo:any = {};
        pageMap:any = {};
        drawingMap:any = {};
        @Prop({default: {}})
        userInfo:Object;
        @Prop({default: {policyString: ""}})
        config:any;
        renobitInstalled: string;
        pnidInstalled: string;

        created() {
            this.renobitInstalled = sessionStorage.getItem(constants.RENOBIT_CHECK_STORAGE_KEY);
            this.pnidInstalled = sessionStorage.getItem(constants.PNID_CHECK_STORAGE_KEY);

            this.$adminAPI.getUserInfo({user_id: this.userInfo.user_id}).then(({ user }) => {
                const { dept, spot, position } = user;

                user.dept = dept || '';
                user.spot = spot || '';
                user.position = position || '';
                this.info = user;

            });
            this.bkUserInfo = this.userInfo;

            /*
			  사용자 코드 리스트 가져오기
			 */
            this.$adminAPI.getUserCodeList({}).then((result) => {
                this.codeList = result;

                result.map(value => {
                    if (value.parent == 'CD00001000')
                        this.deptList.push(value);
                    else if (value.parent == 'CD00000008')
                        this.spotList.push(value);
                    else if (value.parent == 'CD00000002')
                        this.positionList.push(value);
                });

            }, (error) => {
                console.log(error);
            });

            this.renobitInstalled && this.$adminAPI.getPageList(constants.RENOBIT).then(result => {
                let pageTreeList = result.pageTreeList;
                this.pageMap = pageTreeList.reduce((map, obj)=>{
                    map[obj.id] = obj;
                    return map;
                }, {});

            }, error => {
                console.log(error);
            });

            this.pnidInstalled && this.$adminAPI.getPageList(constants.PNID).then(result => {
                let pageTreeList = result.pageTreeList;
                this.drawingMap = pageTreeList.reduce((map, obj)=>{
                    map[obj.id] = obj;
                    return map;
                }, {});

            }, error => {
                console.log(error);
            });
        }

        language() {
            const locale = this.$validator.locale;
            return locale !== 'ko-KR'
        }

        /**
         * 비밀번호 변경 switch change 이벤트 핸들러
         * Validation Check
         */
        switchChange() {
            this.$validator.validateAll();
        }

        /**
         * tab 클릭 이벤트 핸들러
         * @param tab
         * @param event
         */
        tabClick() {
            if (this.activeTabName == 'userInfo') {

                this.info = JSON.parse(JSON.stringify(this.bkUserInfo));
                this.isPwChange = false;

            } else if (this.activeTabName === 'menuInfo') {
                this.init_page = '';
                this.$adminAPI.getUserMenu({ user_id: this.info.user_id, module: constants.RENOBIT }).then(result => {
                    [this.pageList, this.use_page, this.init_page] = this.loadPageList(result, this.checkParent);
                }, error => {
                    console.log(error);
                });
            } else if (this.activeTabName === 'pnidInfo') {
                this.init_page = '';
                this.$adminAPI.getUserMenu({ user_id: this.info.user_id, module: constants.PNID }).then((result: Drawing[]) => {
                    [this.drawingList, this.useDrawingList, this.init_page] = this.makePnidList(
                        Array.from(result
                            .reduce((acc, page) => {
                                if (!acc.has(page.id)) {
                                    acc.set(page.id, page);
                                }

                                return acc;
                            }, new Map<string, Drawing>()).values())
                            .map((dwg) => ({
                                ...dwg,
                                initpage_yn: dwg.initpage_yn === 'Y' ? 'true' : 'false'
                            }))
                    );

                    this.initDrawingList = result;
                }, error => {
                    console.log(error);
                });
            }
        }

        makePnidList(result: Drawing[]): [Drawing[], string[], string] {
            const list: Drawing[] & { privacy?: boolean } = [{ ...this.drawingMap['wv_root'] }] as Drawing[];
            let initPageId = '';
            const usePageList = result
                .filter((page) => page.use_yn === 'true')
                .map((page) => page.id);

            list[0].children = [];

            for (const dwg of result) {
                dwg.text = dwg.name;

                if (!dwg.parent) {
                    list[0].children.push(dwg);
                }

                this.checkPnidParent(dwg, result);

                if (dwg.initpage_yn === 'true') {
                    initPageId = dwg.id;
                }
            }

            list.privacy = true;

            return [
                list,
                usePageList,
                initPageId
            ];
        }

        loadPageList(result, checkParent) {
            let initPageId = '';
            let list = [];
            const usePageList = result
                .filter((page) => page.use_yn === 'true')
                .map((page) => page.page_id || page.id);

            result.forEach(item => {
                item.id = item.page_id || item.id;
                item.text = item.name;
                if(item.type === 'page' || item.type === 'dwg') list.push(item);
                checkParent(item.parent, list);

                if (item.initpage_yn === 'true') {
                    initPageId = item.id;
                }
            });

            list = list.filter((e, i, arr) => arr.findIndex(e2 => Object.keys(e2).every(prop => e2[prop] == e[prop])) == i);

            list.forEach((page, idx) => {
                if (idx !== 0 && page.prev_id && page.prev_id !== list[idx - 1].id) {
                    let groupItemIndex = list.findIndex(p => p.id === page.id)
                    list.splice(groupItemIndex, 1)

                    let prevItemIndex = list.findIndex(p => p.id === page.prev_id)
                    list.splice(prevItemIndex + 1, 0, page)
                }
            });

            return [
                list,
                usePageList,
                initPageId
            ];
        }

        checkParent(parent_id, list) {
            let item = this.pageMap[parent_id];
            if(item) {
                list.push(item);
            }

            if(item.parent != '#') {
                this.checkParent(item.parent, list);
            }
        }

        checkPnidParent(dwg: Drawing, dwgList: Drawing[]) {
            const parent = dwgList.find(({ id }) => id === dwg.parent);

            if (!parent) return;

            if (!parent.children) {
                parent.children = [];
            }

            if (parent.children.every((child) => child.id !== dwg.id)) {
                parent.children.push(dwg);
            }


            if (parent.parent === '#') return;

            this.checkPnidParent(parent, dwgList);
        }

        /**
         * 저장 버튼 클릭 이벤트 핸들러
         */
        saveUserInfo() {
            var self = this;
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg05, msg.common.notification, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'info'
            }).then(() => {
                let param;

                if (this.activeTabName == 'userInfo') {
                    this.$validator.validateAll().then(()=>{
                        if (!self.$validator.errors.any()) {
                            var info = JSON.parse(JSON.stringify(this.info));
                            info.id = info.user_id;

                            //비밀번호를 변경하는 경우
                            if(this.isPwChange){
                                info.pwd = encrypt(this.info.pwd);
                                info.confirmPwd = encrypt(this.info.confirmPwd);
                                info.currentPwd = encrypt(this.info.currentPwd);
                            }else{
                                info.pwd = null;
                                info.confirmPwd = null;
                                info.currentPwd = null;
                            }
                            this.editUser(info);
                        }
                    });
                    return;
                } else if (this.activeTabName == 'menuInfo') {
                    this.init_page = this.$refs.pageSetting.init;
                    this.use_page = this.$refs.pageSetting.getCheckedPage();
                    this.info.init_page = this.init_page;

                    let pageList = this.use_page.map(value => ({page_id: value}));;
                    param = {
                        user_id: this.info.user_id,
                        userInfo: this.info,
                        pageList,
                        module: constants.RENOBIT
                    };
                } else if (this.activeTabName === 'pnidInfo') {
                    this.init_page = this.$refs.pnidSetting.init;
                    this.useDrawingList = this.$refs.pnidSetting.getCheckedPage();
                    this.info.init_page = this.init_page;

                    const pageList = this.useDrawingList
                        .filter(value => value !== 'wv_root')
                        .filter((page) => {
                            const selectedPage = this.drawingMap[page];
                            return selectedPage && selectedPage.type === 'dwg';
                        })
                        .map(value => ({
                            page_id: value,
                            initpage_yn: value === this.init_page ? 'Y' : 'N'
                        }));
                    param = {
                        user_id: this.info.user_id,
                        userInfo: this.info,
                        pageList,
                        module: constants.PNID
                    };
                }

                if(this.info.init_page === null || this.info.init_page === ''){
                    this.$message.error(this.$i18n.messages.wv.privacy.checkInitPage);
                    return;
                }

                this.$adminAPI.setUserMenu(param).then(() => {
                    this.$message.success(msg.msg06);
                    this.info.pwd = null;
                    this.info.confirmPwd = null;
                    this.info.currentPwd = null;
                    this.isPwChange = false;
                }, () => {
                    this.$message.error(msg.msg07);
                });
            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });;
        }

        editUser(info) {
            let msg = this.$i18n.messages.wv;
            this.$adminAPI.editUserSelf(info).then(result => {
                if(result.result){
                    this.$message.success(msg.msg12);
                    this.info.pwd = null;
                    this.info.confirmPwd = null;
                    this.info.currentPwd = null;
                    this.isPwChange = false;
                    this.$emit('changeInfo', info);
                }else{
                    const data = { ...result.data };
                    // todo, 2019.1.9, 김현철, 현재 패스워드 틀림에 대한 인터페이스가 불분명하여 예외처리
                    this.$message.error(data['config_id'] ? util.convertPwdCode(data): msg.msg39.toString());
                }
            }, error =>{
                this.$message.error(msg.msg13);
            });
        }

        initRenobit(){
            this.setInitUserMenu(this.pageList.filter((item) => item.type === 'page'), constants.RENOBIT);
        }

        initPnid() {
            this.setInitUserMenu(this.initDrawingList.filter((item) => item.type === 'dwg'), constants.PNID);
        }

        setInitUserMenu(pageList, module) {
            let msg = this.$i18n.messages.wv;

            this.$confirm(msg.msg22 as string, (msg.common as LocaleMessageObject).notification as string, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'info'
            }).then(() => {
                (this as any).$adminAPI.setInitUserMenu({
                    info: this.info,
                    pageList: pageList.map((page) => ({
                        ...page,
                        initpage_yn: 'N',
                        page_id: page.id
                    })),
                    module
                })
                    .then(() => {
                        this.$message.success(msg.msg12 as string);
                        this.tabClick();
                    }, () => {
                        this.$message.error(msg.msg13 as string);
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
    .required-info div,
    .option-info div {
        width: 100%;
    }

    .privacy-area {
        padding: 30px;
    }

    .privacy-area >>> .el-tabs--card > .el-tabs__header {
        border-bottom: 1px solid #60646c;
    }

    .privacy-area >>> .el-tabs--card > .el-tabs__header .el-tabs__nav {
        border: none;
        border-radius: 4px 4px 0 0;
    }

    .privacy-area >>> .el-tabs__item {
        width: 144px;
        height: 30px;
        line-height: 30px;
        border: none !important;
        background-color: #a4a5ad;
        border-top-left-radius: 7px;
        border-top-right-radius: 41px;
        color: #ffffff;
        transition: all 400ms;
    }

    .privacy-area >>> .el-tabs__item:hover {
        background-color: #909398;
    }

    .privacy-area >>> .el-tabs__item.is-active {
        background-color: #60656e;
        font-weight: bold;
    }

    .menu-area {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .btn-wrap{
        display: block;
        text-align: right;
        padding-bottom: 7px;
        padding-right: 20px;
    }

    .info-area {
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
    }

    .info-area > .info-container {
        border-radius: 5px;
        background-color: #f6f7fb;
        padding: 20px 15px;
    }

    .info-area > .info-container > .title {
        font-weight: bold;
        color: #1c1c1c;
    }

    .info-area > .info-container > .required-info {
        min-height: 24px;
        width: 400px;
        background-color: #ffffff;
        border-left: 7px solid #658ed0;
        border-radius: 3px;
        margin-bottom: 10px;
        padding: 8px 0;
        padding-right: 10px;
    }

    .info-area > .info-container > .option-info {
        width: 400px;
        height: 40px;
        background-color: #ffffff;
        border-left: 7px solid #b9c8f3;
        border-radius: 3px;
        margin-bottom: 10px;
        padding-right: 10px;
    }

    .info-area > .info-container.language > div {
        width: 420px;
    }

    .info-area > .info-container .info-label {
        width: 150px;
        padding-left: 14px;
        color: #1c1c1c;
    }

    .btn-area {
        display: flex;
        justify-content: center;
        border-top: 1px solid #cccccc;
        padding-top: 15px;
        margin-top: 15px;
    }

    .error {
        margin-top: 2px;
        color: #f56c6c;
    }

    .info {
        text-align: right;
        font-weight: bold;
    }

    .emptyText {
        padding-top: 10px;
    }
</style>
