<template>

    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU009')}}
        </div>

        <div class="content-area">

            <el-table :data="actionLogList" maxHeight="515" border v-bind:empty-text="$t('msg08')">

                <el-table-column property="user_id" v-bind:label="$t('User ID')" sortable show-overflow-tooltip >
                </el-table-column>
                <el-table-column property="client_ip" v-bind:label="$t('Client IP')" sortable show-overflow-tooltip >
                </el-table-column>
                <el-table-column property="server_ip" v-bind:label="$t('Sever IP')" sortable show-overflow-tooltip>
                </el-table-column>
                <el-table-column property="action_url" v-bind:label="$t('Action Url')" sortable show-overflow-tooltip>
                </el-table-column>
                <el-table-column property="request_param" v-bind:label="$t('Request Param')" sortable show-overflow-tooltip>
                </el-table-column>
                <el-table-column property="request_dt" v-bind:label="$t('Request Date')" sortable show-overflow-tooltip>
                </el-table-column>

            </el-table>

            <el-pagination @size-change="handleSizeChange"
                           @current-change="handlePageChange"
                           :current-page.sync="currentPage"
                           :page-sizes="[20, 50, 100, 200]"
                           :page-size="pageSize"
                           layout="sizes, prev, pager, next, jumper"
                           :total="totalCount"
                           style="text-align: center;">
            </el-pagination>
        </div>
    </div>
    
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";

    @Component
    export default class UserActionLogComponent extends Vue {

        actionLogList : any = [];

        private totalCount : number = 0;
        private pageSize : number = 20;
        private currentPage : number = 1;

        period: any = [];
        column: string = 'user_id';
        searchStr: string = '';

        created() {
            this.getUserActionLogList();
        }

        getUserActionLogList() {
            let msg = this.$i18n.messages.wv.actionLog;

            let param = {

                // 페이징
                pageSizeSearch: this.pageSize,
                pageSearch: this.currentPage,

            };
            this.$adminAPI.getUserActionLogList(param).then((result) => {
                if (!result.data) return this.$message.error(msg.messages.noExistData)
                this.actionLogList = result.data
                this.totalCount = result.total;
            });
        }

        handleSizeChange(val) {
            this.pageSize = val;
            this.getUserActionLogList();
        }

        handlePageChange(val) {
            this.currentPage = val;
            this.getUserActionLogList();
        }
    }

</script>

<style scoped>

    .content-area {
        height: 547px;
        display: flex;
        flex-direction: column;
        overflow: visible;
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

    .content-area >>> .el-table thead tr th.gutter {
        background-color: transparent;
    }

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
