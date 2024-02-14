<template>
    <modal name="user-select-list"
           :click-to-close="false"
           :reset="true"
           :width="950"
           :height="820"
           :min-width="950"
           :min-height="820"
           resizable
           draggable=".modal-header"
           @opened="onOpened"
           @before-open="beforeOpen">
        <div class="modal-header">
            <span>{{$t('user.__name__')}} {{$t('common.add')}} {{$t('common.popup')}}</span>
            <a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>
        </div>

        <user-list-component
            class="user-list"
            ref="user"
            :list="list"
            :total_count="total_count"
            @load-list="getUserList"/>

        <div class="btn-area">
            <el-button size="small" type="primary" @click="save">{{$t('common.save')}}</el-button>
            <el-button size="small" type="primary" @click="_onHidden">{{$t('common.close')}}</el-button>
        </div>
    </modal>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import UserListComponent from "../UserListComponent.vue";

    @Component({
        components: {
            UserListComponent
        }
    })
    export default class UserSelectModal extends Vue {
        except_list: any;
        public total_count:number = 0;
        public list: any = [];

        beforeOpen(event) {
            this.except_list = event.params.except_list;
        }

        onOpened() {
            this.getUserList();
        }

        _onHidden() {
            this.$modal.hide("user-select-list");
        }

        save() {
            this.$emit("user-list-add", this.$refs.user.selection)
        }

        getUserList() {
            let $list = <UserListComponent> this.$refs.user;
            let param = {
                s_page: $list.page_size * ($list.currentPage-1) + 1,
                e_page: $list.page_size * $list.currentPage,
                exceptList: this.except_list
            }

            if ($list.isNotEmptyBySearchTag()) {
                param.searchTag = $list.searchTagList;
            }

            this.$adminAPI.getUserList(param).then((res) => {
                this.list = res.list;
                this.total_count = res.total_count;
            });
        }
    }
</script>

<style scoped>

    .btn-area {
        text-align: center;
    }

    .user-list {
        padding: 20px;
    }

</style>
