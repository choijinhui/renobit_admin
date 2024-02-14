<template>
  <div>
    <div class="title d-flex">
      <div class="title-bullet"></div>
      {{ $t("sideMenu.MU002") }}
    </div>
    <div class="d-flex" style="width: 100%; align-items: flex-start">
      <div class="grade-area-wrap">
        <div class="grade-area">
          <div class="label d-flex">
            <span>
                <b>{{ $t("grade.gradeList") }}</b>
                </span>
            <el-button size="small" type="success" @click="addGrade">
                <i class="fa fa-plus fa-lg"></i>
            </el-button>
          </div>

          <div
            class="grade-item d-flex"
            v-for="(item, index) in gradeMap"
            :class="{
              active: item.grade_id === currentGrade.grade_id,
            }"
          >
            <div
              class="ellipsis"
              style="width: 100%"
              @click="changeGrade(index)"
            >
              <i
                class="fa fa-asterisk"
                style="color: #f5b757"
                v-if="item.grade_id == ADMIN_GRADE"
              ></i>
              <span>{{ item.name }}</span>
            </div>
            <el-button
              type="text"
              v-if="item.grade_id != ADMIN_GRADE"
              @click="removeGrade(item, index)"
            >
              <i class="fa fa-trash-o fa-lg"></i>
            </el-button>
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="content-wrapper">
          <el-tabs type="card" v-model="activeTabName">
            <el-tab-pane v-if="renobitInstalled" label="Renobit" name="Renobit">
              <div class="content-info">
                <div class="label">
                  <b>{{ $t("grade.registPage") }}</b>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="$t('privacy.messages.saveMasterInfo')"
                    placement="bottom"
                  >
                    <i class="el-icon-warning"></i>
                  </el-tooltip>
                </div>
                <page-grade-setting
                  ref="pageSetting"
                  :pageList="pageList"
                  :init_page="init_page"
                  :use_page="use_page"
                >
                </page-grade-setting>
              </div>
            </el-tab-pane>

            <el-tab-pane v-if="pnidInstalled" :label="$t('pnid.pnid')" name="Pnid">
              <div class="content-info">
                <div class="label">
                  <b>{{ $t("grade.drawing") }}</b>
                </div>
                <pnid-page-grade-setting
                  ref="pnidSetting"
                  :drawingList="drawingList"
                  :init_page="pnid_init_page"
                  :useDrawingList="useDrawingList"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="info-container">
          <div class="btn-area">
            <el-button type="primary" @click="saveGrade" size="medium"
              ><i class="fa fa-floppy-o fa-lg"></i>
              {{ $t("common.save") }}</el-button
            >
          </div>
          <div class="hLine"></div>
          <div class="d-flex content-info">
            <div class="content-title">
              {{ $t("grade.groupName") }}
            </div>
            <el-input
              class="grade-input"
              v-model="currentGrade.name"
            ></el-input>
          </div>
          <div class="subHLine"></div>
          <div class="content-info">
            <user-list-component
              ref="user"
              mode="list"
              :list="searchList"
              :total_count="list.length"
              @grade-user-del="deleteUser"
              @grade-user-add="modalOpen"
            />
          </div>
          <div class="hLine"></div>
        </div>
      </div>
    </div>
    <user-select-modal @user-list-add="addUser"></user-select-modal>
  </div>
</template>

<script lang="ts">
import util from "../../../api/AdminUtil";
import * as constants from "../../../api/Constants";
import { Component, Vue } from "vue-property-decorator";
import PageGradeSetting from "../PageGradeSetting.vue";
import PnidPageGradeSetting, { Drawing } from "../PnidPageGradeSetting.vue";
import UserListComponent from "../user/UserListComponent.vue";
import UserSelectModal from "../user/modal/UserSelectModal.vue";

@Component({
  components: {
    UserSelectModal,
    UserListComponent,
    PageGradeSetting,
    PnidPageGradeSetting
  }
})
export default class GradeManageComponent extends Vue {
  ADMIN_GRADE: string = "";
  gradeMap: any = [];
  pageList: any = [];
  drawingList: Drawing[] = [];
  currentGrade: any = { userList: [] };
  currentGradeIndex: number = 0;
  init_page: string = "";
  pnid_init_page: string = "";
  use_page: any = [];
  useDrawingList: string[] = [];
  renobitInstalled: string = "";
  pnidInstalled: string = "";
  activeTabName: string = "";
  public list: any = [];
  private gradeUserList: any = [];

  created() {
    this.ADMIN_GRADE = constants.ADMIN_GRADE;

    this.renobitInstalled = sessionStorage.getItem(constants.RENOBIT_CHECK_STORAGE_KEY)
    this.pnidInstalled = sessionStorage.getItem(constants.PNID_CHECK_STORAGE_KEY)
    this.renobitInstalled
      ? (this.activeTabName = "Renobit")
      : (this.activeTabName = "Pnid");

    // 페이지 트리 구성을 위한 전체 페이지 리스트 호출
    this.renobitInstalled && this.$adminAPI.getPageList(constants.RENOBIT).then(
      result => {
        this.pageList = result.pageTreeList;
        this.callGradeList();
      },
      error => {
        console.log(error);
      }
    );

    this.pnidInstalled && this.$adminAPI.getPageList(constants.PNID).then(
      result => {
        this.drawingList = result.pageTreeList;
        this.callGradeList();
      },
      error => {
        console.log(error);
      }
    );
  }

  callGradeList() {
    this.$adminAPI.getGradeList().then(
      result => {
        this.setGradeData(result);
        this.changeGrade(this.currentGradeIndex);
      },
      error => {
        console.log(error);
      }
    );
  }

  checkSetInitPage() {
    var init;
    if (this.isRenobit()) {
        init = this.init_page = this.$refs.pageSetting.init;
        this.use_page = this.$refs.pageSetting.getCheckedPage();
    } else {
        init = this.pnid_init_page = this.$refs.pnidSetting.init;
        this.useDrawingList = this.$refs.pnidSetting.getCheckedPage();
    }

    if (!init || init == "" || init == "wv_root") {
      return false;
    }

    return true;
  }

  isRenobit() {
    return this.activeTabName === 'Renobit';
  }

  checkMoreThanOnePage() {
    let page;

    if (this.isRenobit()) {
      page = this.$refs.pageSetting;
    } else {
      page = this.$refs.pnidSetting;
    }

    return !!page.getCheckedPage().length;
  }

  createParam() {
    let pageList;
    let param = { ...this.currentGrade };
    let usePage;

    if (this.isRenobit()) {
      usePage = this.use_page;
    } else {
      usePage = this.useDrawingList.filter((page) => {
        const selectedPage = this.drawingList.find((p) => p.id === page);
        return selectedPage && selectedPage.type === 'dwg';
      });;
    }

    pageList = usePage.map((page_id) => ({
      page_id,
      init_page: page_id === (this.isRenobit() ? this.init_page : this.pnid_init_page) ? "Y" : "N"
    }));

    // 권한 그룹별 페이지 리스트
    param.pageList = pageList;
    param.userList = this.currentGrade.userList.map(value => value.user_id);
    param.module = this.isRenobit() ? constants.RENOBIT : constants.PNID;

    return param;
  }

  saveGrade() {
    const msg = this.$i18n.messages.wv;

    if (!this.checkMoreThanOnePage()) {
      this.$message.error(msg.msg35);
      return;
    }

    if (!this.checkSetInitPage()) {
      this.$message.error(msg.msg21);
      return;
    }

    // '권한' 속성 저장 시, 중복 체크
    const duplicateGradeList = this.gradeMap
      .map(item => {
        if (!item.grade_id.includes(this.currentGrade.grade_id))
          return item.name.trim();
      })
      .includes(this.currentGrade.name.trim());

    if (duplicateGradeList) {
      this.$message.error(msg.msg32);
      return;
    }

    if (this.currentGrade.name.trim() == "") {
      this.$message.error(msg.grade.groupName + "을 " + msg.msg09);
      return;
    }

    const param = this.createParam();

    this.$adminAPI.setGradeList(param).then(
      result => {
        if (result != "ok") {
          this.$message.error(msg.msg07);
        } else {
          this.$message.success(msg.msg06);
          this.callGradeList();
        }
      },
      error => {
        this.$message.error(msg.msg07);
      }
    );
  }

  setGradeData(result) {
    let gradeList = result.gradeList;
    this.gradeUserList = result.gradeUserList;
    gradeList.map((value, index) => {
      this.gradeMap[index] = {
        grade_id: value.grade_id,
        name: value.name,
        use_page: [],
        useDrawingList: [],
        pageList: result.gradePageList
          .filter(page => page.module === constants.RENOBIT)
          .filter(
              page => page.grade_id == value.grade_id
          ),
        drawingList: result.gradePageList
          .filter(page => page.module === constants.PNID)
          .filter(
              page => page.grade_id === value.grade_id
          )
      };
    });
  }

  addGrade() {
    var msg = this.$i18n.messages.wv;

    // '새 권한' 초기 Name 중복 예외
    var newGradeName = msg.grade.newGrade;
    var arrDefaultGrade = this.gradeMap.filter(function(item) {
      return item.name === msg.grade.newGrade;
    });
    if (arrDefaultGrade.length > 0) {
      // '새 권한/새 권한 (n)' Name 중, 비어있는 n번째 권한 생성
      let defaultGradeList = this.gradeMap.filter(function(item) {
        return item.name.match(msg.grade.newGrade);
      });
      let tmpDefaultList = defaultGradeList.map(function(grade) {
        return grade.name;
      });
      let i = 0;
      do {
        i++;
      } while (tmpDefaultList.indexOf(newGradeName + " (" + i + ")") > -1);
      newGradeName = newGradeName + " (" + i + ")";
    }

    var newGrade = {
      grade_id: util.generateUUID(),
      name: newGradeName,
      userList: [],
      pageList: [],
      seq: this.gradeMap.length
    };

    this.$adminAPI.addGrade(newGrade).then(
      result => {
        this.$message.success(msg.msg15);
        this.gradeMap.push(newGrade);
        this.changeGrade(this.gradeMap.length - 1);
      },
      error => {
        console.log(error);
      }
    );
  }

  removeGrade(item, index) {
    var msg = this.$i18n.messages.wv;
    var activeItemRemove = this.currentGradeIndex === index;
    this.$confirm(msg.msg04, msg.common.notification, {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(() => {
      let updateList = [];

      for (let i = index + 1; i < this.gradeMap.length; i++) {
        var grade = this.gradeMap[i];
        grade.seq = i - 1;
        updateList.push(JSON.parse(JSON.stringify(grade)));
      }

      item.updateList = updateList;

      this.$adminAPI.deleteGrade(item).then(
        () => {
          this.$message.success(msg.msg10);
          this.gradeMap.splice(index, 1);
          if (activeItemRemove) {
            this.changeGrade(index - 1);
          } else {
            this.changeGrade(this.currentGradeIndex);
          }
        },
        error => {
          this.$message.error(msg.msg11);
        }
      );
    }).catch((response) => {
        if (response === 'cancel') {
            this.$message(msg.msg40);
        }
    });
  }

  changeGrade(index) {
    this.currentGradeIndex = index;
    this.currentGrade = { ...this.gradeMap[index] };
    let gradePageList = this.currentGrade.pageList;
    let init;
    let pnid_init;
    this.use_page = (gradePageList || []).map(value => {
      if (value.init_page == "Y") init = value;
      return value.page_id;
    });
    this.useDrawingList = (this.currentGrade.drawingList || []).map((page) => {
      if (page.init_page === "Y") pnid_init = page;
      return page.page_id;
    });

    this.init_page = init ? init.page_id : "";
    this.pnid_init_page = pnid_init ? pnid_init.page_id : "";


    this.getUserList();
    let $list = <UserListComponent>this.$refs.user;
    $list.searchTagList = {};
  }

  get searchList() {
    let $list = <UserListComponent>this.$refs.user;
    if ($list) {
      let list = this.list.filter(info => {
        return info[$list.searchValue]
          .toLowerCase()
          .includes($list.searchStr.toLowerCase());
      });

      return list.splice(
        ($list.currentPage - 1) * $list.page_size,
        $list.page_size
      );
    }

    return this.list;
  }

  getUserList() {
    let $list = <UserListComponent>this.$refs.user;
    let param = {
      grade_id: this.currentGrade.grade_id
    };
    if ($list.isNotEmptyBySearchTag()) {
      param.searchTag = $list.searchTagList;
    }

    if ($list.sort_id !== "" && $list.sort_order !== "") {
      param["s_sort_id"] = $list.sort_id;
      param["s_sort_order"] = $list.sort_order == "ascending" ? "asc" : "desc";
    }

    this.$adminAPI.getGradeUserList(param).then(res => {
      this.list = res.list;
      this.currentGrade.userList = this.list;
    });
  }

  modalOpen() {
    this.$modal.show("user-select-list", { except_list: this.list });
  }

  addUser(list) {
    let msg = this.$i18n.messages.wv;

    this.$confirm(msg.msg05, msg.common.notification, {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(() => {
      this.list = this.list.concat(list);
      this.currentGrade.userList = this.list;

      this.$modal.hide("user-select-list");
    });
  }

  deleteUser(list) {
    let msg = this.$i18n.messages.wv;

    this.$confirm(msg.msg04, msg.common.notification, {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(() => {
      let userList = this.list;

      if (
        list.some(value => value.user_id === "admin") &&
        this.ADMIN_GRADE === this.currentGrade.grade_id
      ) {
        this.$message.error(msg.msg34);
        return;
      }

      list.map(item => {
        let index = userList.indexOf(item);
        if (index != -1) userList.splice(index, 1);
      });
    }).catch((response) => {
        if (response === 'cancel') {
            this.$message(msg.msg40);
        }
    });
  }
}
</script>

<style scoped>
.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  width: 300px;
  overflow: hidden;
}

.grade-area-wrap {
  min-width: 270px;
  max-height: 780px;
  overflow: auto;
  overflow-x: hidden;
}

.grade-area {
  width: 250px;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
}

.label {
  justify-content: space-between;
  padding-bottom: 10px;
  font-size: 15px;
  height: 38px;
  box-sizing: border-box;
}

.grade-area > .grade-item {
  width: 203px;
  height: 40px;
  background-color: #e2e2e2;
  border-radius: 5px;
  border-left: 7px solid #6b6e82;
  padding: 0 20px;
  color: #5c5e69;
  font-weight: bold;
  line-height: 40px;
  margin-bottom: 10px;
  transition: background-color 300ms;
  justify-content: space-between;
  box-shadow: 2px 2px #d4d4d4;
}

.grade-area > .grade-item span {
  font-size: 13px;
}

.grade-area > .grade-item:hover {
  cursor: pointer;
  background-color: #ffffff;
}

.grade-area > .grade-item.active {
  border-left: 7px solid #6e8aea;
  background-color: #fbfbfb;
  color: #2b2b2b;
  font-weight: bold;
  box-shadow: 2px 2px #c1c1c1;
}

.hLine {
  height: 3px;
  background-color: #819eea;
}

.subHLine {
  height: 1px;
  background-color: #abbdec;
}

.content-area {
  display: flex;
  width: 100%;
  flex: 1;
  padding-left: 10px;
  border-left: 1px solid #dadada;
}

.content-area .content-info {
  margin: 10px;
}

.content-area .info-container {
  /* width: 900px; */
  width: 100%;
  padding-left: 20px;
}

.content-area .info-container .btn-area {
  padding-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}

.content-area .content-info .grade-input {
  width: 250px;
}

.content-title {
  color: #5269ab;
  font-weight: bold;
  font-size: 13px;
  margin-right: 10px;
}

.item {
  margin: 4px;
  cursor: pointer;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

.content-wrapper >>> .el-tabs--card > .el-tabs__header {
  border-bottom: 1px solid #d3d3d3;
  margin-left: 10px;
}

.content-wrapper >>> .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: none;
  border-radius: 4px 4px 0 0;
}

.content-wrapper >>> .el-tabs__item {
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: none !important;
  background-color: #8eb7e7;
  color: #ffffff;
  transition: all 0.3s;
}

.content-wrapper >>> .el-tabs__item:first-child {
  border-top-left-radius: 3px;
}

.content-wrapper >>> .el-tabs__item:last-child {
  border-top-right-radius: 3px;
}

.content-wrapper >>> .el-tabs__item:hover {
  background-color: #62a0e8;
}

.content-wrapper >>> .el-tabs__item.is-active {
  background-color: #4690e5;
  font-weight: bold;
}
</style>
