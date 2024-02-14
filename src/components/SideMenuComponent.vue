<template>
    <div class="side">
        <div class="logo"></div>

        <div class="d-flex user-profile">
            <i class="fa fa-user fa-3x" aria-hidden="true"></i>
            <div class="d-flex">
                <span>{{userInfo.name}}</span>
                <el-button size="small" type="success" round @click="goToPrivacyPage">
                    <i class="fa fa-cog fa-lg" aria-hidden="true"></i>
                </el-button>
            </div>
        </div>

        <div class="user-info">
            <div><b>{{$t('user.lastLogin')}}</b></div>
            <input type="text" readonly :value="userInfo.last_login_dt">
            <div><b>{{$t('user.pwdExpire')}}</b></div>
            <input type="text" readonly :value="usePwPolicy == 'N' ? '-': userInfo.pw_update_dt">
        </div>

        <el-menu :default-active="selectedMenu" background-color="#333847" text-color="#8da4e8"
                 active-text-color="#c4d3ff" @select="selectMenu">
            <el-menu-item v-for="menuItem in menuList" :key="menuItem.menu_id" :index="menuItem.menu_id">
                <span>{{getLocales(menuItem)}}</span>
            </el-menu-item>
        </el-menu>

        <div class="copyright" v-if="showCopyRight">Copyrights(c) WeMB.CORP.</div>
    </div>

</template>

<script lang="ts">
    import {Vue, Component, Prop} from "vue-property-decorator";

    @Component
    export default class SideMenuComponent extends Vue {
        @Prop({default: []})
        menuList:Array<any>;

        @Prop({default: {}})
        userInfo:Object;

        @Prop({default: ''})
        selectedMenu:string;

        @Prop({default: "N"})
        usePwPolicy:string;

        @Prop({default: true})
        showCopyRight:boolean;

        selectMenu(url) {
            var selectMenu = this.menuList.find((value) => value.menu_id == url);
            this.$emit('selectMenu', selectMenu);
        }

        goToPrivacyPage() {
            this.$emit('goToPrivacyPage');
        }

        getLocales(menu){
            let msg = this.$i18n.messages.wv;
            return menu.type === 'DEFAULT' || "RENOBIT" ? msg.sideMenu[menu.menu_id] : menu.name;
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

    }

</script>

<style scoped>
    .side {
        width: 250px;
        height: 100%;
        background-color: #333847;
        overflow: auto;
    }

    .side > .logo {
        height: 40px;
        color: #dedede;
        background-color: #3a3a3a;
        text-align: center;
        font-size: 1.5rem;
    }

    .side > .user-profile {
        color: #f1f1f1;
        font-weight: bold;
        font-size: 14px;
        justify-content: space-around;
        align-items: center;
        padding: 10px 20px;
        border-bottom: 1px solid #252a34;
    }

    .side > .user-profile > i {
        color: #f7f7f7;
    }

    .side > .user-profile > .d-flex > span {
        margin-right: 5px;
    }

    .side > .user-info {
        padding: 10px 20px;
        border-bottom: 2px solid #252a34;
    }

    .side > .user-info > div {
        height: 24px;
        color: #a8acbd;
        font-size: 12px;
        text-align: left;
        line-height: 24px;
    }

    .side > .user-info > input {
        background-color: #272d37;
        border: none;
        height: 26px;
        border-radius: 9px;
        width: 100%;
        color: #ffffff;
        font-size: 13px;
        text-align: center;
        border-top: 2px solid #131515;
        border-left: 2px solid #131515;
    }

    .side >>> .el-menu {
        text-align: left;
        font-size: 13px;
        border: none;
        border-bottom: 2px solid #252a34;
    }

    .side > .el-menu >>> .el-menu-item.is-active {
        font-weight: bold;
        font-size: 14px;
        background-color: #2d303a !important;
    }

    .copyright {
        color: #697084;
        background-color: #333847;
        text-align: center;
        padding-top: 19px;
        margin-top: 10px;
        font-size: 13px;
        font-weight: bold;
    }

</style>
