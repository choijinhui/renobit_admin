<template>
    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU005')}}
        </div>

        <div class="search-area d-flex">
            <div class="d-flex">
                <div class="d-flex">
                    <div class="label-bullet"></div>
                    <span>{{$t('history.division')}}</span>
                    <el-select v-model="type" @change="changeType">
                        <el-option v-bind:label="$t('history.accessHistory')" value="history"></el-option>
                        <el-option v-bind:label="$t('history.currentUser')" value="current"></el-option>
                    </el-select>
                </div>

                <div class="d-flex" v-if="type == 'history'">
                    <div class="label-bullet"></div>
                    <span>{{$t('history.dateCondition')}}</span>
                    <el-date-picker v-model="period" size="mini" type="daterange"
                                    range-separator="To" start-placeholder="Start date" end-placeholder="End date">
                    </el-date-picker>
                </div>

                <div class="d-flex">
                    <div class="label-bullet"></div>
                    <span>{{$t('history.userSearch')}}</span>
                    <el-select v-model="column">
                        <el-option v-bind:label="$t('user.name')" value="user_name"></el-option>
                        <el-option v-bind:label="$t('user.id')" value="user_id"></el-option>
                    </el-select>
                    <el-input class="search-field" v-bind:placeholder="$t('msg09')" v-model="searchStr">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
            </div>

        </div>

        <div class="content-area">
            <el-table :data="searchList" maxHeight="515" border v-bind:empty-text="$t('msg08')">
                <el-table-column property="user_id" v-bind:label="$t('user.id')" sortable show-overflow-tooltip></el-table-column>
                <el-table-column property="user_name" v-bind:label="$t('user.name')" sortable show-overflow-tooltip></el-table-column>
                <el-table-column property="c_login_time" v-bind:label="$t('user.loginTime')" sortable show-overflow-tooltip></el-table-column>;
                <el-table-column property="c_logout_time" v-bind:label="$t('user.logoutTime')" sortable :sort-method="sortLogoutTime" :sort-orders="['ascending', 'descending', null]" show-overflow-tooltip></el-table-column>
                <el-table-column property="logout_type" v-bind:label="$t('user.logoutType')" sortable show-overflow-tooltip></el-table-column>
                <el-table-column property="client_ip" v-bind:label="$t('user.clientIp')" sortable show-overflow-tooltip></el-table-column>
            </el-table>

            <el-pagination @size-change="handleSizeChange"
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
    import {Component, Vue} from "vue-property-decorator";

    @Component
    export default class ConnectionHistoryComponent extends Vue {
        type: string = 'history';
        period: any = [];
        column: string = 'user_name';
        searchStr: string = '';
        userList: any = [];
        total_count:number = 0;
        page_size:number = 20;
        currentPage:number = 1;

        get searchList() {
            var list =  this.userList.filter( (info:any) => {
                var result:boolean = info[this.column].toLowerCase().includes(this.searchStr.toLowerCase());

                if (this.type == 'history') {
                    var periodFlag = false;

                    if (this.period == null || this.period.length < 2) {
                        periodFlag = true;
                    } else {
                        this.period[1].setHours(23);
                        this.period[1].setMinutes(59);
                        this.period[1].setSeconds(59);

                        var from = this.period[0].getTime();
                        var to = this.period[1].getTime();
                        var check = Date.parse(info.c_login_time);

                        if (check <= to && check >= from) {
                            periodFlag = true;
                        }
                    }

                    result = result && periodFlag;
                } else {
                    // 현재 접속 사용자
                    result = (result && info.c_logout_time == null);
                }

                return result;
            });

            this.total_count = list.length;
            return list.splice((this.currentPage - 1) * this.page_size, this.page_size);
        }

        created() {
            this.title = this.$parent.activeMenu;

            this.$adminAPI.getLoginHistory().then((result) => {
                this.userList = result;
            });
        }

        sortLogoutTime(a, b) {
            const aLogoutTime = new Date(a.logout_time).getTime();
            const bLogoutTime = new Date(b.logout_time).getTime();
            return aLogoutTime > bLogoutTime ?  -1 : aLogoutTime < bLogoutTime ? 1 : 0
        }

        changeType() {
            this.period = [];
            this.searchStr = '';
            this.column = "user_name";
        }

        handleSizeChange(val) {
            this.page_size = val;
        }
    }

</script>
<style scoped>

    .search-area {
        height: 45px;
        background-color: #fbfbfc;
        border-radius: 5px;
        border-left: 5px solid #9cb4e9;
        padding: 0 10px;
        color: #576cab;
        font-weight: bold;
        margin-bottom: 20px;
        justify-content: space-between;
        overflow: hidden;
    }

    .search-area span {
        padding-left: 10px;
        width: 70px;
    }

    .search-area >>> .el-input {
        width: 270px;
    }

    .search-area >>> .el-select > .el-input {
        width: 120px;
        padding-right: 5px;
    }

    .content-area {
        height: 547px;
        display: flex;
        flex-direction: column;
        overflow: auto;
    }

    .content-area >>> .el-table {
        background-color: transparent;
        border: none;
    }

    .content-area >>> .el-table th {
        cursor: pointer;
        background-color: #869cd6;
    }

    /*.content-area >>> .el-table thead tr th:first-child {
        border-radius: 40px 0 0 40px;
    }

    .content-area >>> .el-table thead tr th:nth-last-child(2) {
        border-radius: 0px 40px 40px 0px;
    }*/

    .content-area >>> .el-table thead tr {
        color: #ffffff;
    }

    .content-area >>> .el-table tr {
        background-color: #f0f1f5;
    }

    .content-area >>> .el-table td {
        padding: 0;
        border-color: #e0e1ec;
    }

    .content-area >>> .el-pager li,
    .content-area >>> .el-pagination .btn-next,
    .content-area >>> .el-pagination .btn-prev,
    .content-area >>> .el-pagination button.disabled {
        background-color: transparent;
    }

    .content-area >>> .el-pager li.active {
        color: #4690e5;
    }


</style>
