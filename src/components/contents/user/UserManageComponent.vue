<template>
    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU001')}}
        </div>
        <user-list-component ref="user"
                             mode="manage"
                             :list="list"
                             :total_count="total_count"
                             :usePwPolicy="usePwPolicy"
                             @load-list="getUserList"
                             @user-add="userAddClick"
                             @user-del="deleteUser"
                             @user-edit="editUser"
                             @code-setting="codeSettingClick"/>

        <user-add-modal v-on:getUserList="init"></user-add-modal>
        <user-edit-modal v-on:changeInfo="init"></user-edit-modal>
        <code-setting-modal v-on:getCodeList="getCodeList"></code-setting-modal>
    </div>
</template>

<script lang="ts">
    import UserAddModal from "./modal/UserAddModal.vue"
    import UserEditModal from "./modal/UserEditModal.vue"
    import CodeSettingModal from "./modal/CodeSettingModal.vue";
    import {Component, Prop, Vue} from "vue-property-decorator";
    import UserListComponent from "./UserListComponent.vue";

    @Component({
        components:{
            UserListComponent,
            UserAddModal,
            UserEditModal,
            CodeSettingModal
        }
    })
    export default class UserManageComponent extends Vue {
        @Prop({default: "N"})
        public usePwPolicy:string;
        @Prop({default: {}})
        public config:any;
        public list: any = [];
        public total_count:number = 0;
        private gradeList:any = [];
        private gradeUserList:any=[];

        private codeList:any;
        private readonly DEPT_CODE = 'CD00001000';
        private readonly SPOT_CODE = 'CD00000008';
        private readonly POSITION_CODE = 'CD00000002';

        private get deptList() {
            return this.serchTree(this.DEPT_CODE);
        }

        private get spotList() {
            return this.serchTree(this.SPOT_CODE);
        }

        private get positionList() {
            return this.serchTree(this.POSITION_CODE);
        }

        serchTree(code) {
            let codes = [code];

            return !this.codeList ? [] : this.codeList.filter((item) => {
                if (codes.includes(item.parent)) {
                    codes.push(item.code);
                    return true;
                }
            });
        }

        mounted() {
            /*
			  사용자 코드 리스트 가져오기
			 */
            this.$adminAPI.getUserCodeList({}).then((result) => {
                this.codeList = result;
            }, (error) => {
                console.log(error);
            });

            this.init();
        }

        /**
         * 사용자 추가 클릭 이벤트 핸들러
         * Modal 호출
         */
        userAddClick() {
            this.$modal.show('user-add', {
                userInfo: {}, // 생성 시, userInfo 초기화
                deptList: this.deptList,
                spotList: this.spotList,
                positionList: this.positionList,
                userList: this.list,
                config: this.config,
                gradeList: this.gradeList
            });
        }

        /**
         * 코드 설정 클릭 이벤트 핸들러
         * Modal 호출
         */
        codeSettingClick() {
            this.$modal.show('code-setting', {codeList: this.codeList});
        }


        /**
         * 사용자 수정 클릭 이벤트 핸들러
         * Modal 호출
         * @param userInfo
         */
        editUser(userInfo) {
            const { dept, spot, position } = userInfo;

            userInfo.dept = dept || '';
            userInfo.spot = spot || '';
            userInfo.position = position || '';

            this.$modal.show('user-edit', {
                userInfo: userInfo,
                deptList: this.deptList,
                spotList: this.spotList,
                positionList: this.positionList,
                config: this.config,
                gradeList: this.gradeList
            });
        }

        /**
         * 사용자 삭제 핸들러
         * @param userInfo
         * @param $index
         */
        deleteUser(userInfo) {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg04, msg.common.notification, {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
            })
            .then(() => {
                var param = {"user_id": userInfo.user_id};

                this.$adminAPI.deleteUser(param).then((result) => {
                    if (result !== "FAIL") {
                        this.$message.error(msg.msg10);
                        this.init();
                    } else {
                        this.$message.error(msg.msg31);
                    }
                }, error => {
                    this.$message(msg.msg11);
                });
            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });
        }

        getCodeList(param) {
            this.codeList = param;
        }

        init() {
            this.$adminAPI.getGradeList().then(result=>{
                var gradeList = result.gradeList;
                var tmp = {};
                gradeList.map((grade)=>{
                    tmp[grade.grade_id] = grade.name;
                })

                this.gradeList = gradeList;
                this.gradeUserList = result.gradeUserList;

                this.getUserList();
            })
        }

        /**
         * 사용자 리스트 가져오기
         */
        getUserList() {
            let $list = <UserListComponent> this.$refs.user;
            let param = {
                s_page: $list.page_size * ($list.currentPage-1) + 1,
                e_page: $list.page_size * $list.currentPage
            }

            if ($list.isNotEmptyBySearchTag()) {
                param.searchTag = $list.searchTagList;
            }

            if($list.sort_id !== '' && $list.sort_order !== ''){
                param["s_sort_id"] = $list.sort_id;
                param["s_sort_order"] = $list.sort_order == 'ascending' ? 'asc' : 'desc';
            }

            this.$adminAPI.getUserList(param).then((res) => {
                let now = new Date().getTime();
                let gradeUserList = this.gradeUserList;
                res.list.map(user=>{
                    user.grade = gradeUserList.filter(x=> x.user_id == user.user_id).map(item=> item.grade_id);
                    let updateDate = new Date(user.pw_update_dt);
                    let cal = now - updateDate.getTime();
                    user.pwChangeDay = "D" + Math.floor(cal / (1000 * 60 * 60 * 24));
                });

                this.list = res.list;
                this.total_count = res.total_count;
                $list.gradeList = this.gradeList;
            });
        }
    }
</script>

<style scoped>
    .el-select {
        width: 120px;
        padding-right: 5px;
    }

    .d-day-label {
        font-size: 11px;
        color: #0058ff;
        font-weight: bold;
    }

</style>
