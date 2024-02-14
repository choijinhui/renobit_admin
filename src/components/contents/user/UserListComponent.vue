<template>
    <div>
        <div class="search-area d-flex">
            <div class="d-flex user-search">
                <div class="label-bullet"></div>
                <span v-if="mode == 'manage'">{{$t("user.__name__")}} {{$t("common.search")}}</span>
                <el-select v-model="searchValue">
                    <el-option v-bind:label="$t('user.name')" value="name"></el-option>
                    <el-option v-bind:label="$t('user.id')" value="user_id"></el-option>
                    <el-option v-bind:label="$t('user.phone')" value="phone"></el-option>
                    <el-option v-bind:label="$t('user.deptName')" value="dept_name"></el-option>
                </el-select>
                <el-input class="search-field" v-bind:placeholder="$t('msg09')" v-model="searchStr" clearable
                          @change="handleChangeSearch">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </div>
            <div v-if="mode == 'manage'">
                <el-button size="small" @click="handleCodeSettingClick"><i class="fa fa-cogs fa-lg"></i> {{$t('common.code')}}
                    {{$t('common.setting')}}
                </el-button>
                <el-button size="small" type="primary" @click="handleUserAddClick">{{$t('user.userAdd')}}</el-button>
            </div>
            <div v-if="mode == 'list'">
                <el-button size="small" @click="handleDeleteGradeUser">{{$t('user.__name__')}} {{$t('common.delete')}}</el-button>
                <el-button size="small" @click="handleAddGradeUser">{{$t('user.userAdd')}}</el-button>
            </div>
            <div :class="searchTag" v-for="(tag, key) in searchTagList" :key="key">
                <el-tag
                    v-if="tag != null"
                    closable
                    @close="handleClose(tag, key)">
                    {{ showTagName(tag, key) }}
                </el-tag>
            </div>
        </div>

        <div class="user-area">
            <el-table :data="list" maxHeight="555" border v-bind:empty-text="$t('msg08')" @selection-change="handleSelectionChange" @sort-change="sortChange" :default-sort="{property:'user_id', order:'ascending'}">
                <el-table-column type="selection" v-if="mode !== 'manage'"></el-table-column>
                <el-table-column property="user_id" v-bind:label="$t('user.id')" sortable show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div class="d-flex">
                            <span class="user-id">{{scope.row.user_id}}</span>
                            <i class="fa fa-lock fa-lg" v-if="scope.row.lock == 'Y' && mode == 'manage'"></i>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column property="name" v-bind:label="$t('user.name')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column property="dept_name" v-bind:label="$t('user.department')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column property="spot_name" v-bind:label="$t('user.spot')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column property="position_name" v-bind:label="$t('user.position')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column property="phone" v-bind:label="$t('user.phone')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column v-if="mode == 'manage'" property="email" v-bind:label="$t('user.email')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column v-if="mode == 'manage'" property="last_login_dt" v-bind:label="$t('user.lastLogin')" sortable
                                 show-overflow-tooltip></el-table-column>
                <el-table-column v-if="mode == 'manage'" property="pw_update_dt" v-bind:label="$t('user.pwdExpire')" sortable show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div v-if="usePwPolicy == 'Y'">{{scope.row.pw_update_dt}}</div>
                        <div v-if="usePwPolicy == 'Y'" class="d-day-label">{{scope.row.pwChangeDay}}</div>
                        <div v-if="usePwPolicy == 'N'">-</div>
                    </template>
                </el-table-column>
                <el-table-column v-if="mode == 'manage'" property="grade" :label="$t('grade.__name__')" >
                    <template slot-scope="scope">
                        <div v-for="g in scope.row.grade">{{getGradeName(g)}}</div>
                    </template>
                </el-table-column>
                <el-table-column  v-if="mode == 'manage'"v-bind:label="$t('user.action')" width="142">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleUserEditClick(scope.row)">{{$t('common.change')}}</el-button>
                        <el-button class="user-delete-button" size="mini" type="danger" v-if="scope.row['user_id'] != 'admin'"
                                   @click="handleUserDelClick(scope.row)">{{$t('common.delete')}}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination @size-change="handleSizeChange"
                           @current-change="callList"
                           :current-page.sync="currentPage"
                           :page-sizes="[20, 50, 100, 200]"
                           :page-size="page_size"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="total_count"
                           style="text-align: center;">
            </el-pagination>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UserListComponent extends Vue {
        @Prop({})
        public mode:string;
        @Prop({})
        public list: any;
        @Prop({})
        public total_count: number;
        @Prop({default: "N"})
        public usePwPolicy:string;

        public searchValue: string = "name";
        public searchStr: string = "";
        private selection:any;
        private gradeList:any = [];
        private tagNames = null;
        private searchTagList = {};

        page_size: number = 20;
        currentPage: number = 1;

        sort_id:string = "name";
        sort_order:string = "ascending";

        created() {
            let lang = this.$i18n.messages.wv.user;

            this.tagNames = {
                "s_user_id" : lang.id,
                "s_name" : lang.name,
                "s_phone" : lang.phone,
                "s_dept_name" : lang.deptName
            };
        }

        handleSizeChange(val) {
            this.page_size = val;
            this.callList();
        }

        callList() {
            if(this.searchStr.length > 0) {
                this.addSearchTag("s_" + this.searchValue, this.searchStr);
            }
            this.$emit('load-list');
        }

        handleChangeSearch() {
            this.currentPage = 1;
            this.callList();
        }

        handleUserAddClick() {
            this.$emit("user-add");
        }

        handleUserEditClick(userInfo) {
            this.$emit("user-edit", userInfo);
        }

        handleUserDelClick(userInfo) {
            this.$emit("user-del", userInfo);
        }

        handleCodeSettingClick() {
            this.$emit("code-setting");
        }

        handleSelectionChange(val) {
            this.selection = val;
        }

        sortChange(sortProps){
            this.sort_id = sortProps.column ? sortProps.column.property : "";
            this.sort_order = sortProps.column ? sortProps.column.order : "";
            this.$emit('load-list', null);
        }

        handleDeleteGradeUser() {
            let msg = this.$i18n.messages.wv;
            if(this.selection === undefined || this.selection.length <= 0 ) {
                this.$message.error(msg.msg36);
            } else {
                this.$emit("grade-user-del", this.selection);
            }
        }

        handleAddGradeUser() {
            this.$emit("grade-user-add");
        }

        getGradeName(grade_id) {
            let target = this.gradeList.find(grade => {
                return grade.grade_id === grade_id;
            });
            return target && typeof target === 'object' ? target.name : '';
        }

        showTagName(tag, key) {
            return `${this.tagNames[key]}=${tag}`;
        }

        get searchTag() {
            return {
                "search-tag": true,
                "search-tag-show": this.isNotEmptyBySearchTag()
            }
        }

        isNotEmptyBySearchTag() {
            return Object.keys(this.searchTagList).some(key => {
                return this.searchTagList[key] && this.searchTagList[key].length > 0;
            });
        }

        handleClose(tag, key) {
            this.searchTagList[key] = null;
            this.searchStr = "";
            this.$emit('load-list');
        }

        addSearchTag(key, value) {
            let tags = this.searchTagList[key];
            if (!tags) {
                Vue.set(this.searchTagList, key, "");
            }

            this.searchTagList[key] = value;
        }
    }
</script>

<style scoped>
    .el-select {
        width: 120px;
        padding-right: 5px;
    }

    .search-area {
        min-height: 45px;
        background-color: #fbfbfc;
        border-radius: 5px;
        border-left: 5px solid #9cb4e9;
        padding: 0 20px;
        color: #576cab;
        font-weight: bold;
        justify-content: space-between;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .search-area > .user-search {
        margin: 9px 0;
    }

    .search-area > .user-search > span {
        width: 90px;
    }

    .d-day-label {
        font-size: 11px;
        color: #0058ff;
        font-weight: bold;
    }

    .user-area {
        width: 100%;
        height: 587px;
        display: flex;
        flex-direction: column;
        overflow: auto;
    }

    .user-area >>> .el-table .cell {
        padding-left: 10px;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .user-area >>> .el-table {
        background-color: transparent;
        border: none;
    }

    .user-area >>> .el-table th {
        cursor: pointer;
        background-color: #869cd6;
    }

    /*.user-area >>> .el-table thead tr th:first-child {
        border-radius: 20px 0 0 20px;
    }

    .user-area >>> .el-table thead tr th:nth-last-child(2) {
        border-radius: 0px 40px 40px 0px;
    }*/

    .user-area >>> .el-table thead tr th.gutter {
        background-color: transparent;
    }

    .user-area >>> .el-table thead tr {
        color: #ffffff;
    }

    .user-area >>> .el-table tr {
        background-color: #f0f1f5;
    }

    .user-area >>> .el-table td {
        padding: 0;
        border-color: #e0e1ec;
    }

    .user-id {
        font-size: 13px;
        padding-right: 3px;
    }

    .user-area >>> .el-pager li,
    .user-area >>> .el-pagination .btn-next,
    .user-area >>> .el-pagination .btn-prev,
    .user-area >>> .el-pagination button.disabled {
        background-color: transparent;
    }

    .user-area >>> .el-pager li.active {
        color: #4690e5;
    }

    .search-tag {
        width: 100%;
    }

    .search-tag.search-tag-show {
        margin-bottom: 9px;
    }

    .search-tag >>> .el-tag {
        margin-right: 10px;
    }
    .el-button + .user-delete-button.el-button {
        margin-left: 0;
    }
</style>
