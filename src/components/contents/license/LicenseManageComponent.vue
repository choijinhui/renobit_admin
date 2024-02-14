<template>
  <div class="license-area">
    <div class="title d-flex">
      <div class="title-bullet"></div>
      {{ $t("sideMenu.MU004") }}
    </div>
    <el-tabs type="card" v-model="activeTabName" @tab-click="tabClick">
      <div class="btn-area">
        <el-button size="small" @click="showLicenseChangeModal(activeTabName)"
          >{{ $t("license.__name__") }} {{ $t("common.change") }}</el-button
        >
        <el-button
          v-if="licenseInfo.type !== 'trial' && activeTabName === 'RenobitLicense'"
          type="primary"
          size="medium"
          @click="saveLicenseSetting"
        >
          <i class="fa fa-floppy-o fa-lg"></i> {{ $t("common.save") }}
        </el-button>
      </div>

      <el-tab-pane
        label="Renobit"
        name="RenobitLicense"
        v-if="renobitInstalled"
      >
      </el-tab-pane>

      <el-tab-pane :label="$t('pnid.pnid')" name="PnidLicense" v-if="pnidInstalled">
      </el-tab-pane>

      <div class="license-content">
        <div>
          <div class="hLine"></div>
          <div class="license-info">
            <div class="info">
              <div class="info-title">{{ $t("license.ip") }}</div>
              <div>
                <div class="info-value" v-for="ip in licenseInfo.ipInfo.ipList">
                  {{ ip }}
                </div>
              </div>
            </div>

            <div class="info">
              <div class="info-title">{{ $t("license.expirationDt") }}</div>
              <div class="info-value">{{ licenseInfo.period }}</div>
            </div>

            <div class="info" v-if="activeTabName === 'RenobitLicense'">
              <div class="info-title">{{ $t("license.userLicense") }}</div>
              <div class="info-value">{{ licenseInfo.licenseUser }}</div>
            </div>

            <div class="info">
              <div class="info-title">
                {{
                  activeTabName === "RenobitLicense"
                    ? $t("license.sessionLicense")
                    : $t("license.drawingLicense")
                }}
              </div>
              <div class="info-value">
                {{
                  activeTabName === "RenobitLicense"
                    ? licenseInfo.sessionUser
                    : licenseInfo.drawing
                }}
              </div>
            </div>

            <div class="info">
              <div class="info-title">{{ $t("license.licenseState") }}</div>
              <div class="info-value">{{ licenseInfo.status }}</div>
            </div>
          </div>
          <div class="hLine" style="height: 1px"></div>
        </div>
      </div>
      <license-change-modal
        v-on:changeLicense="initLicense(CONSTANTS.RENOBIT)"
        :isRouter="false"
      ></license-change-modal>
      <pnid-license-change-modal v-on:changeLicense="initLicense(CONSTANTS.PNID)"></pnid-license-change-modal>
      <user-select-modal
        :licenseUser="licenseInfo.licenseUser"
        @user-list-add="addUser"
      ></user-select-modal>
    </el-tabs>
    <user-list-component
      v-if="licenseInfo.type !== 'trial' && activeTabName === 'RenobitLicense'"
      class="user-list"
      ref="user"
      mode="list"
      :total_count="tmpUserList.length"
      :list="searchList"
      @grade-user-add="modalOpen"
      @grade-user-del="deleteUser"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import LicenseChangeModal from "./LicenseChangeModal.vue";
import PnidLicenseChangeModal from "./PnidLicenseChangeModal.vue";
import UserListComponent from "../user/UserListComponent.vue";
import UserSelectModal from "../user/modal/UserSelectModal.vue";
import * as constants from "../../../api/Constants";

@Component({
  components: {
    UserSelectModal,
    UserListComponent,
    LicenseChangeModal,
    PnidLicenseChangeModal
  },
})
export default class LicenseManageComponent extends Vue {
  licenseInfo: any = {
    ipInfo: {
      ipList: [],
    },
    type: "trial",
    licenseUser: 0,
  };
  userList: any = [];
  tmpUserList: any = [];
  renobitInstalled: string;
  pnidInstalled: string;
  activeTabName: string = "RenobitLicense";
  CONSTANTS = constants;

  created() {
    this.renobitInstalled = sessionStorage.getItem(constants.RENOBIT_CHECK_STORAGE_KEY);
    this.pnidInstalled = sessionStorage.getItem(constants.PNID_CHECK_STORAGE_KEY);
    this.initTab(this.renobitInstalled);
  }

  initLicense(solution) {
    var msg = this.$i18n.messages.wv;
    // 1. 라이선스 정보 가져오기
    // prameter renobit or pnid를 넘겨주어 해당 라이선스만 받아오기
    this.$adminAPI.getLicenseInfo(solution).then((result) => {
      //해당 솔루션 라이센스 정보 저장
      this.licenseInfo = result.lic_info;
      if (solution === constants.PNID) {
        if (this.licenseInfo.type == "T") {
          this.licenseInfo.type = "trial";
          var date = new Date(this.licenseInfo.expired);
          var offset = date.getTimezoneOffset() * 60000;
          this.licenseInfo.period = new Date(date.getTime() - offset)
            .toISOString()
            .substring(0, 10)
            .replace(/-/g, "");
        } else {
          this.licenseInfo.ipInfo = { ipList: this.licenseInfo.ipList };
        }
      }

      this.licenseInfo.status =
        this.licenseInfo.type == "trial"
          ? msg.license.trial
          : msg.license.formally;

      if (this.licenseInfo.type == "trial") {
        this.licenseInfo.ipInfo = { ipList: [] };
      } else {
        this.$adminAPI.getUserList().then((result) => {
          this.tmpUserList = [];
          this.userList = result.list;
          this.userList.map((value) => {
            if (value.license_yn == "Y") {
              this.tmpUserList.push(value);
            }
          });
        });
      }
    });
  }

  initTab(renobit) {
    let currentTab: string;
    if (renobit) {
      this.activeTabName = "RenobitLicense";
      currentTab = constants.RENOBIT;
    } else {
      this.activeTabName = "PnidLicense";
      currentTab = constants.PNID;
    }
    this.initLicense(currentTab);
  }

  showLicenseChangeModal(activeTabName) {
    if (activeTabName === "RenobitLicense") {
      this.$modal.show("license-change");
    } else {
      this.$modal.show("pnid-license-change");
    }
  }

  saveLicenseSetting() {
    let msg = this.$i18n.messages.wv;
    // 유효성 체크
    let userCount = this.licenseInfo.licenseUser;
    let assignedCount = this.tmpUserList.length;
    if (userCount < assignedCount) {
      this.$message.error(msg.msg17);
    } else {
      this.$confirm(msg.msg05, msg.common.notification, {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning",
      }).then(() => {
        this.userList.forEach((user) => {
          user.license_yn = this.tmpUserList.some(
            (tmp) => tmp.user_id === user.user_id
          )
            ? "Y"
            : "N";
        });

        this.$adminAPI.setLicenseInfo({ userList: this.userList }).then(
          (result) => {
            this.$message.info(msg.msg06);
          },
          (error) => {
            this.initLicense(constants.RENOBIT);
            console.log("adminAPI.setLicenseInfo", error);
          }
        );
      }).catch((response) => {
            if (response === 'cancel') {
                this.$message(msg.msg40);
            }
      });;
    }
  }

  addUser(list) {
    let msg = this.$i18n.messages.wv;

    if (!list) {
      this.$message.error(msg.msg38);
      return;
    }

    let assignedCount = this.tmpUserList.length;
    if (this.licenseInfo.licenseUser < assignedCount + list.length) {
      this.$message.error(msg.msg17);
      return;
    }

    this.$confirm(msg.msg05, msg.common.notification, {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    }).then(() => {
      this.tmpUserList = this.tmpUserList.concat(list);
      this.$modal.hide("user-select-list");
    }).catch((response) => {
        if (response === 'cancel') {
            this.$message(msg.msg40);
        }
    });;
  }

  deleteUser(list) {
    let msg = this.$i18n.messages.wv;
    this.$confirm(msg.msg04, msg.common.notification, {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    }).then(() => {
      let userList = this.tmpUserList;
      list.map((item) => {
        let index = userList.indexOf(item);
        if (index != -1) userList.splice(index, 1);
      });
    }).catch((response) => {
        if (response === 'cancel') {
            this.$message(msg.msg40);
        }
    });;
  }

  get searchList() {
    let $list = <UserListComponent>this.$refs.user;
    if ($list) {
      let list = this.tmpUserList.filter((info) => {
        return info[$list.searchValue]
          .toLowerCase()
          .includes($list.searchStr.toLowerCase());
      });

      return list.splice(
        ($list.currentPage - 1) * $list.page_size,
        $list.page_size
      );
    }

    return this.tmpUserList;
  }

  modalOpen() {
    this.$modal.show("user-select-list", { except_list: this.tmpUserList });
  }

  //tabclick
  tabClick(tab, event) {
    //click한 tab에 따라 해당 라이선스 요청
    if (this.activeTabName === "PnidLicense") {
      this.initLicense(constants.PNID);
    } else {
      this.initLicense(constants.RENOBIT);
    }
  }
}
</script>

<style scoped>
.btn-area {
  text-align: right;
  padding-bottom: 10px;
}

.hLine {
  height: 2px;
  background-color: #81acea;
}

.license-info {
  display: flex;
}

.license-info > .info {
  width: 100%;
  min-height: 30px;
  display: flex;
}

.license-info > .info > .info-title {
  width: 40%;
  padding-left: 20px;
  background-color: #e2e7f1;
  color: #5269ab;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.license-info > .info .info-value,
.license-info > .info > .info-value {
  width: 60%;
  padding-left: 10px;
  line-height: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.user-list {
  width: 1000px;
  margin: 0 auto;
  padding: 15px 0;
}

.license-area >>> .el-tabs__item {
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: none !important;
  background-color: #8eb7e7;
  color: #ffffff;
  transition: all 0.3s;
}

.license-area >>> .el-tabs__item.is-active {
  background-color: #4690e5;
  font-size: small;
  font-weight: bold;
}

.license-area >>> .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: none;
  border-radius: 4px 4px 0 0;
}
</style>
