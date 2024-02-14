<template>
    <div class="d-flex container">
        <side-menu-component v-if="activeMenu && activeMenu.type != 'ERROR'"
                             v-on:selectMenu="selectMenu"
                             v-on:goToPrivacyPage="goToPrivacyPage"
                             v-bind:usePwPolicy="usePwPolicy"
                             v-bind:selectedMenu="activeMenu.menu_id"
                             v-bind:userInfo="userInfo"
                             v-bind:menuList="menuList"
                             v-bind:showCopyRight="showCopyRight">
        </side-menu-component>

        <div class="main">
            <div class="header d-flex">
                <select class="langs" @change="changeLanguage">
                    <option v-for="item in langPack":label="item.label":value="item.locale" :selected="item.locale == language"></option>
                </select>
                <el-button v-if="!isHidden" size="medium" style="margin:0px 5px 0px 5px" @click="goUninstall">uninstall</el-button>

                <el-dropdown trigger="click" class="link" v-if="renobitInstalled">
                    <span class="el-dropdown-link">
                        Renobit<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown" class="link-dropdown">
                        <el-dropdown-item class="viewer"><a @click="proclinkClick('VIEWER', CONSTANTS.RENOBIT)"></a></el-dropdown-item>
                        <el-dropdown-item class="editor"><a @click="proclinkClick('EDITOR', CONSTANTS.RENOBIT)"></a></el-dropdown-item>
                        <el-dropdown-item class="help"><a @click="proclinkClick('HELP', CONSTANTS.RENOBIT)"><i class="el-icon-info"></i>HELP</a></el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>

                <el-dropdown trigger="click" class="link" v-if="pnidInstalled">
                    <span class="el-dropdown-link">
                        {{ $t('pnid.pnid') }}<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown" class="link-dropdown">
                        <el-dropdown-item class="viewer"><a @click="proclinkClick('VIEWER', CONSTANTS.PNID)"></a></el-dropdown-item>
                        <el-dropdown-item v-if="isAdmin" class="editor"><a @click="proclinkClick('EDITOR', CONSTANTS.PNID)"></a></el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-tooltip class="item" v-bind:content="$t('menu.menuSettingPopup')" v-if="isAdmin">
                    <span v-if="isAdmin" class="btn btn-setting" @click="menuSettingClick()"></span>
                </el-tooltip>
                <el-tooltip class="item" v-bind:content="$t('menu.logout')">
                    <span class="btn btn-logout" @click="procLogOut()"></span>
                </el-tooltip>
            </div>

            <div class="content" v-if="activeMenu && activeMenu.type == 'DEFAULT'">
                <user-manage-component v-if="activeMenu && activeMenu.menu_id == 'MU001'"
                                       v-bind:usePwPolicy="usePwPolicy"
                                        v-bind:config="config"></user-manage-component>
                <grade-manage-component v-if="activeMenu && activeMenu.menu_id == 'MU002'"></grade-manage-component>
                <connection-history-component v-if="activeMenu && activeMenu.menu_id == 'MU005'"></connection-history-component>
                <license-manage-component v-if="activeMenu && activeMenu.menu_id == 'MU004'"></license-manage-component>
                <policy-manage-component v-if="activeMenu && activeMenu.menu_id == 'MU006'" v-on:usePwPolicy="changePwPolicy"></policy-manage-component>
                <access-log-info-component v-if="activeMenu && activeMenu.menu_id == 'MU007'"></access-log-info-component>
                <user-action-log-component v-if="activeMenu && activeMenu.menu_id == 'MU009'"></user-action-log-component>
            </div>

            <div class="content" v-if="activeMenu && activeMenu.type == 'RENOBIT'">
                <pack-manage-component v-if="activeMenu && activeMenu.menu_id == 'MU008'"></pack-manage-component>
                <font-manager-component v-if="activeMenu && activeMenu.menu_id == 'MU010'"></font-manager-component>
            </div>
            <privacy-page-component v-if="activeMenu && activeMenu.type == 'PRIVACY'" v-bind:userInfo="userInfo" v-on:changeInfo="changeUserInfo" v-bind:config="config"></privacy-page-component>
            <iframe v-if="activeMenu && activeMenu.type == 'CUSTOM'" :src="activeMenu.url" width="100%" height="100%"></iframe>
        </div>

        <menu-setting-modal v-bind:list="menuList" v-on:changeMenu="changeMenu"></menu-setting-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import SideMenuComponent from "./SideMenuComponent"
    import MenuSettingModal from "./MenuSettingModal"
    import UserManageComponent from "./contents/user/UserManageComponent"
    import GradeManageComponent from "./contents/grade/GradeManageComponent"
    import PrivacyPageComponent from "./contents/privacy/PrivacyPageComponent"
    import PolicyManageComponent from "./contents/policy/PolicyManageComponent"
    import ConnectionHistoryComponent from "./contents/history/ConnectionHistoryComponent"
    import LicenseManageComponent from "./contents/license/LicenseManageComponent"
    import AccessLogInfoComponent from "./contents/log/AccessLogInfoComponent"
    import PackManageComponent from "./contents/pack/PackManageComponent"
    import UserActionLogComponent from "./contents/log/UserActionLogComponent"
    import FontManagerComponent from './contents/font/FontManagerComponent'
    import * as constants from "../api/Constants"

    @Component({
        components: {
            MenuSettingModal,
            SideMenuComponent,
            UserManageComponent,
            GradeManageComponent,
            PrivacyPageComponent,
            PolicyManageComponent,
            LicenseManageComponent,
            ConnectionHistoryComponent,
            AccessLogInfoComponent,
            PackManageComponent,
            UserActionLogComponent,
            FontManagerComponent
        }
    })

    export default class AdminMainComponent extends Vue {
        private isHidden: boolean = true;
        private isAdmin: boolean = true;
        private activeMenu: Object = null;
        public userInfo: any = {};
        public menuList: any = null;
        public user_id:string;
        public usePwPolicy:string = "N";
        public title:string;
        public config: any = {};
        private language:string = window.navigator.language;
        private installedLocale:string = 'ko-KR';
        private showCopyRight:boolean = true;
        renobitInstalled: string = "";
        pnidInstalled: string = "";
        CONSTANTS = constants;

        langPack: Array<any> = [];
        created(): void {
            const module = new URL(location).searchParams.get('module')
            if (window['error'] == "LICENSE_EXPIRED") {
                return module == 'renobit' ?  
                this.$router.push({name: 'LicenseChangePage', query:{module:module}}) : 
                this.$router.push({name: 'LicenseChangePage'})
            }

            if (window['error'] == "INIT_PW_CHANGE") {
                return module == 'renobit' ?  
                this.$router.push({name: 'PasswordChangePage', params: {user_id: sessionStorage.tempId}, query:{module:module}}) :
                this.$router.push({name: 'PasswordChangePage', params: {user_id: sessionStorage.tempId}});
            }

            this.$adminAPI.configInitInfo()
            .then(result => {
                this.pnidInstalled = sessionStorage.getItem(constants.PNID_CHECK_STORAGE_KEY)
                this.renobitInstalled = sessionStorage.getItem(constants.RENOBIT_CHECK_STORAGE_KEY)
                this.user_id = result["userId"]
                this.getUserInfo();
                this.getPolicyinfo();
            }).catch(err => {
                console.log(err)
                this.$message.error('Failed to Get Solution Information')
                this.goToPrivacyPage()
            })
        }
        mounted(): void {
            document.onkeyup = function(e) {
                if (e.ctrlKey && e.altKey && e.shiftKey && e.which == 85) {
                    var message = (this.isHidden ? "Activate" : "Deactivate") + " Uninstall";
                    this.isHidden = !this.isHidden;
                    this.$message.warning(message);
                }
            }.bind(this);
            this.$adminAPI.getConfig().then(result => {
                this.langPack = result.languages;
            });
        }

        private goUninstall() {
            this.$adminAPI.uninstall().then(()=>{
                setTimeout(function() {
                    location.reload()
                },100)
            }).catch((err) => {

            })
        }

        private getPolicyinfo() {
            this.$adminAPI.getPolicyInfo().then(result => {
                result.map(value => {
                    let config_id = value.config_id;
                    this.config[config_id] = value.value;

                    if(config_id == 'PW_POLICY') {
                        this.usePwPolicy = value.value;
                    } else if(config_id == 'LOCALE') {
                        this.installedLocale = value.value;
                    } else if(config_id == 'SHOW_COPYRIGHT') {
                        this.showCopyRight = JSON.parse(value.value);
                    }
                });

                var msg = this.$i18n.messages.wv;
                this.config.policyString = '';
                if (this.config.PW_POLICY == "Y") {
                    let pString = '';
                    pString = "( *"+msg.policy.policy13+"" + this.config.PW_LENGTH + msg.policy.policy14;

                    if (this.config.PW_MIX == 'CN') {
                        pString += msg.policy.policy15

                    } else if (this.config.PW_MIX == 'CNS') {
                        pString += msg.policy.policy16
                    }
                    pString += msg.policy.policy17 +" )"

                    this.config.policyString = pString;
                }

                this.language = this.getLocaleInfo();
                this.callLocaleFile(this.language);
                this.$validator.localize(this.language);
                this.$validator.validateAll();
            });
        }

        private getUserInfo() {
            this.$adminAPI.getUserInfo({user_id: this.user_id}).then(({ user }) => {
                this.userInfo = user;
                this.isAdmin = user ? JSON.parse(this.userInfo.is_admin) : false;

                // 관리자 인지 아닌지 확인
                if (this.isAdmin) {
                    // 메뉴 리스트 가져오기
                    this.$adminAPI.getMenuList().then(result => {
                        if(sessionStorage.getItem(constants.RENOBIT_CHECK_STORAGE_KEY)) this.menuList = result;
                        else this.menuList = result.filter(menu => menu.type !== "RENOBIT")
                        this.activeMenu = this.menuList[0];
                    }).catch(err => {
                        console.error(err, 'error from userinfo')
                        this.goToPrivacyPage()
                    });
                } else {
                    this.goToPrivacyPage();
                }
            })
        }

        private goToPrivacyPage() {
            this.activeMenu = {type: "PRIVACY", menu_id: null};
        }

        private menuSettingClick() {
            this.$modal.show("menu-setting");
        }

        private selectMenu(menu) {
            this.activeMenu = menu;
        }

        private changeMenu(list) {
            this.menuList = list;
        }

        private changeUserInfo(info) {
            this.userInfo = info;
        }

        private changePwPolicy(flag) {
            this.usePwPolicy = flag;
            this.getPolicyinfo(); // 보안정책 저장 후, RELOAD
        }

        private proclinkClick(flag, module) {
            /**
             * 임시 바로가기 - Admin.js 는 성격상 맞지않아 임시로 정의
             **/

            if (module === constants.RENOBIT) {
                if (flag === "VIEWER") {
                    location.href = this.$adminAPI._getFullPathName(module) + "/visualViewer.do"
                } else if (flag === "EDITOR") {
                    location.href = this.$adminAPI._getFullPathName(module) + "/visual.do"
                } else if (flag === "HELP") {
                    this.gotoManual();
                }
            } else {
                if (flag === "VIEWER") {
                    location.href = this.$adminAPI._getFullPathName(module) + "/#/viewer"
                } else if (flag === "EDITOR") {
                    location.href = this.$adminAPI._getFullPathName(module)
                }
            }
        }

        gotoManual() {
            const locale = localStorage.getItem('__renobit_locale__') || ''
            let url = '';

            switch (locale) {
                case 'en-US':
                        url = '/en';
                        break;
                case 'zh-CN':
                case 'zh-HK':
                        url = '/cn'
                        break;
            }

            let context = this.$adminAPI._getContext();
            let manualURL = location.origin + context +  "/manual" + url + "/manager.html";

            // window focus를 위한 타임아웃
            setTimeout(function() {
                window.open(manualURL, "_blank");
            },100)
        }

        private procLogOut() {
            /**
             * 임시 로그아웃 - Admin.js 는 성격상 맞지않아 임시로 정의
             **/
            location.href = this.$adminAPI._getFullPathName() + "/logout.do?mode=MANAGER"
        }
        changeLanguage(e) {
            let lang = e.target.value;
            this.language = lang;
            localStorage.setItem("__renobit_locale__", lang);
            this.callLocaleFile(lang);

            this.$validator.localize(lang);
            this.$validator.validateAll();
            this.getPolicyinfo();
        }

        /**
         *  다국어 설정 우선순위
         *      1. queryString
         *      2. localStorage
         *      3. install 시 설정한 다국어 값
         */
        getLocaleInfo() {
            let locale = 'ko-KR';
            let regex = new RegExp('lang=([^&]*)');
            let match_result = location.href.match(regex);
            let lang = match_result !== null ? match_result[1] : null;

            if(lang) {
                let valid_locale = this.langPack.find(d => {return (d.user_locale === lang || d.locale === lang)})
                if (valid_locale) {
                    locale = valid_locale.locale;
                }else {
                    locale = this.installedLocale;
                }
            } else {
                let temp_locale = localStorage.getItem('__renobit_locale__');
                let valid_locale = this.langPack.find(d=> {return (d.locale === temp_locale)});
                if (valid_locale) {
                    locale = temp_locale;
                } else {
                    locale = this.installedLocale;
                }
            }

            return locale;
        }

        callLocaleFile(locale) {
            this.$adminAPI.getLanguage(locale).then(result => {
                this.$i18n.setLocaleMessage('wv', result);
            }).catch(err =>{
                // TODO 다국어 파일이 없을 경우 예외처리 필요
                console.log(err);
            })
        }
    }
</script>

<style scoped>
    .container {
        height: 100%;
        background-color: #f0f1f5;
        overflow: hidden;
    }

    .main {
        width: 100%;
        height: 100%;
        /*background-color: #f0f1f5;*/
        overflow: auto;
    }

    .content {
        padding: 30px;
    }

    .header {
        height: 40px;
        width: 100%;
        justify-content: flex-end;
        align-items: center;
    }

    .header .btn {
        margin: 0 5px;
        height: 16px;
        cursor: pointer;
    }

    .header .btn-viewer {
        width: 62px;
        background: url(../assets/image/topbtn_viewer.png);
    }

    .header .btn-viewer:hover {
        background: url(../assets/image/topbtn_viewer_hover.png);
    }

    .header .btn-editor {
        width: 59px;
        background: url(../assets/image/topbtn_editor.png);
    }

    .header .btn-editor:hover {
        background: url(../assets/image/topbtn_editor_hover.png);
    }

    .header .btn-setting {
        width: 65px;
        background: url(../assets/image/topbtn_setting.png);
    }

    .header .btn-setting:hover {
        background: url(../assets/image/topbtn_setting_hover.png);
    }

    .header .btn-logout {
        width: 64px;
        background: url(../assets/image/topbtn_logout.png);
    }

    .header .btn-logout:hover {
        background: url(../assets/image/topbtn_logout_hover.png);
    }

    .langs {
        background:#f0f1f5;
        color:#363a45;
        outline:none;
        border:0px;
    }

    .link.el-dropdown {
        margin: 10px;
        cursor: pointer;
    }

    .link .el-dropdown-link {
        color: #363a45;
    }

    .link-dropdown .el-dropdown-menu__item {
        background: none !important;
        padding: 0;
        width: 101px;
    }

    .el-dropdown-menu__item:not(:first-child) {
        margin-top: 20px;
    }

    .link-dropdown li.el-dropdown-menu__item a {
        width: 61px;
        height: 16px;
        display: block;
        padding: 0 20px;
        background-repeat: no-repeat;
        background-position: center;
    }

    .link-dropdown li.el-dropdown-menu__item.viewer a {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAQCAYAAABOZ8wCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTkyNEYwMjExMUU3MTFFNzhDRTBCNTcxMzlFMDk4OTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTkyNEYwMjIxMUU3MTFFNzhDRTBCNTcxMzlFMDk4OTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFOTI0RjAxRjExRTcxMUU3OENFMEI1NzEzOUUwOTg5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFOTI0RjAyMDExRTcxMUU3OENFMEI1NzEzOUUwOTg5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm9KkcEAAAIESURBVHja7FaxTsMwEHVRPiBsDAxMDLCUCsTAgAe6oA7hD7Kxhj/IH8AnhA0xZYCFMgSJCSQaCcHAlBGmlrlI8A6dqyNy2jRShrac9HTO6WzfO9/FbuzsHT4qpQaqmiwD2zR4uL9WsyQO8AF0Ks6/UjMqS2pBZWGJO3UtvNlqn0G5L09dX9jWoFLYXIy/oRvQIWzkk4npEc0F9Gvv1iPDxtZBE6oHHMEWsy0S8/Jr0D4B7YPxHdv2eew5NSaVgkpytgCIbb4gE0oDSFGSpE0Dn6xjYfNZRyAa2gKBXXPiXY7Jr63UsVlKtwU284TZ44RMFCSCTm/AJ21IhqxNYqiikiliotuL4nKdmlspYrIxEtDkzW2BahCRp5WAeMKnoznY37InP8Blu1xLc9uM1jB7wa5N63A8moi3gMuKxFoliKeiB+MCvyxHwvQq+fsgmop1EhN8br2iNZRoGUp+QNVIxJ+B44rELyaUVoZsZ1zuBlbifMJ5SUTyYpEMLUp/tEZR2YseD027EfEh0K9IfFiy3GnDAfd9aUEyqMcz/ilqkYxQ/AemEbpp+nS7mB7vWpxWgHfLWMpXSeKnwMkYHypnLa8ikArECQf4Tg1Z+CpL2/jcy3+us/zPDT7nlLgG3urjnqMdy9gqs/ZW/3+yClnn0t9lbcY3wOo8P1nfgPa8n/iPAAMAFWnPN6Cf/vAAAAAASUVORK5CYII=);
    }

    .link-dropdown li.el-dropdown-menu__item.viewer a:hover {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAQCAYAAABOZ8wCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTZGODNCNDMxMUU5MTFFNzhDRTBCNTcxMzlFMDk4OTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTZGODNCNDQxMUU5MTFFNzhDRTBCNTcxMzlFMDk4OTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQTM5NTUwQzExRTgxMUU3OENFMEI1NzEzOUUwOTg5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5NkY4M0I0MjExRTkxMUU3OENFMEI1NzEzOUUwOTg5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqsRKQ4AAAHiSURBVHja7FaxTsNADL2ifEDYGDp0Yo4qJEZuYesQPgAUwcAa/iB/AD+AVJgQUwYmWMLMQCQ2pkgwwNQyFwmeJR9yT9c0iZQhLSc9+Wr5bD+f3Uvv+PDtSSk1Vc3WJrBDm8vrvurS8oBPYNTw/J3q6NpQa7rWlrjXluOTo/cLCB+zHwndACKHzsf+B7IHmUBHNoU4PqazgAZC1gXAM3AApMLOnLN9UJyY4mD/yLo93odei0WlpDJLF4ukbdvE0g0sHRXhi2UqdBHLMYgmrkSg11x4n3OKWmt1BMvptUCwUKhDJlllFfzaBIJkwtIUhjoqq5ET+aO8fK/lURoz2RQFCDi4K1Ft3W4moDlZ0/aJGAPpS/PY/PkwsaDX1uhoIj4EbhsSG1YgnosZTEtuN7N+K7aP2EcuihJaLV/mQ4miUvFj6kYi/gKcNiR+s6S1ClS74HYPxR/VMuLy5k3xUlEM7eiSYlHbixlPzLgR8RkwaUh8VrHdKeCU577OmnJRYjHbmSBc1PRHL82EXhcz4w8Ooy3gw7GX67si8XPgrMQmEsQU33AsbjgWrS7HYM4Hz/Lcc2b/ucHmigrXw7d62efoyLFf1Nb/X25dJb7Nrb/L0uzvgf6qEHe946/A/qrf+K8AAwBjr6kxvb0w+wAAAABJRU5ErkJggg==);
    }

    .link-dropdown li.el-dropdown-menu__item.editor a {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAQCAYAAACoTgdGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkEzOTU1MDIxMUU4MTFFNzhDRTBCNTcxMzlFMDk4OTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkEzOTU1MDMxMUU4MTFFNzhDRTBCNTcxMzlFMDk4OTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFOTI0RjAyMzExRTcxMUU3OENFMEI1NzEzOUUwOTg5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFOTI0RjAyNDExRTcxMUU3OENFMEI1NzEzOUUwOTg5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pqo7MXcAAAIQSURBVHja1Fe9SsNQFE4luxl0bkGHioOhIg4qtoMOTp1cXOIb5BHyBvYNzOzUgk4iRnRRUFpFcBHioA4itDg41u+UL3IJbXMLmjYHPu7fObn3/NxzbnIrazvGX9DN1Ykx6WQCH8A5x6tAPkHmBbhmvwLMGhkhUfYJ2OX4HugmyDwo/JdGhmgqNu4AuQR0JkmBxdJWGSjoelYUeAZugW8NGeE5ApaB94SDSJRcqHOPd6dyOA9dBwgBG2gDLtbqcnj0Zd0FahSzySt8TfC54BP5Q16rPMYN+SbW2ugH6Fvk3yRPVZRdZ+jOaRpzm62WjCg3YMnHmkejyMF91UNYa6Ipc10O72Eu4LhARSsyx3FAA3n8hKvw12V+ahJCEYfyFS/rUBVoRcqgDRkFgwwrylpmCnfKU4YhFetHbSrb1PisRU+qJHIHytjG3gYN0PO4mYLjgphC/0lq8nS4n4R4HUaumSmEaKDJaml6NTJaNTYXjwqX91k86/crPeMqHx49oKus3MElJrYoYbl9QttQkpQjnj1j2ZFyMs9U/TVkIznQG2VasmmCIsGA7OzQ6lFpKLNs6ERLCL59SUpoJTFNAw2lVMWpV+pyeBvLK2iDk8fAXsLD4RUo0iC/suN6G0NZm2Vq5BdUdB+6Q/CZ4Pm0y5Zu6PdeUDMMYaESE0Un4Ucg4i9m6W0syi6MKJM3Mko/AgwA77DBsMPATTIAAAAASUVORK5CYII=);
    }

    .link-dropdown li.el-dropdown-menu__item.editor a:hover {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAQCAYAAACoTgdGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTZGODNCNDcxMUU5MTFFNzhDRTBCNTcxMzlFMDk4OTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTZGODNCNDgxMUU5MTFFNzhDRTBCNTcxMzlFMDk4OTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NkY4M0I0NTExRTkxMUU3OENFMEI1NzEzOUUwOTg5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5NkY4M0I0NjExRTkxMUU3OENFMEI1NzEzOUUwOTg5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pkxcx5YAAAINSURBVHja1Fe9SgNBEL6E671COyEBLWLloYWNYtJYp7IR5dQXuEe4NzAvIB6WVgnYiidWFkKijY1w4l8hQoKFZfwmfCfLkWQ3oJdk4GP/Zm53fnZmL3ew+2z9BR2fzluTTjbwAVxyvAYUNDJPwA37FWDOmhISZR+AbY7vgK5G5l7hv7amiPKpcQfIadCZJAUO917KQNHUs6LAI3ALfBvICM8ZsAq8aw4iUXKVuttyuABdD4gBF2gDPtbqcnj0Zd0HahRzySt8TfD54BP5E16rAsYN+SbW2uhH6Dvk3yRPVZRdZ+guGBpzi62RjCg3YCnEWkCjyMFD1UNYa6Ipc10OH2Au4rhIRSsyx3FEAwX8hK/w12U+PwmhiEOFipdNqAq0EmXQxoyCQYYVZR07gzsVKMOYivWjNpVtGnzWoSdVErkjZexib4sG6HnczsBxUUqh/yQ1eXrcT0K8DiPX7AxCNDJkdQy9mhitmppLR4XP+yyeDfuVnnGVj4AeMFVW7uAyE1uSsPw+oW0pScoTz16w7Eg5WWSq/hqykRzojTIt2VSjSDQgO3u0elIayiwbJtESg29fkhJaSUwzQEMpVWnqlboc3sbyCtrg5Dmwo3k4vAIlGuRXdlxvYyjrskyN/IJK7kN3CD41ns+6bJmGfu8FNcsQFlphouhofgQS/tI0vY1F2aURZQrWlNKPAAMA3KfFvFVI/owAAAAASUVORK5CYII=);
    }

    li.el-dropdown-menu__item.help {
        line-height: inherit;
    }

    li.el-dropdown-menu__item.help a {
        font-weight: bold;
        font-size: 12px;
        display: flex;
        align-items: center;
    }

    li.el-dropdown-menu__item.help i {
        margin-right: 5px;
        margin-left: 2px;
        font-size: 17px;
    }
</style>
