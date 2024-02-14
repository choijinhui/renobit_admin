<template>
    <div>
        <el-input class="search-field" v-bind:placeholder="$t('msg09')" v-model="filterText">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-tree
            :data="data"
            ref="tree"
            show-checkbox
            node-key="id"
            default-expand-all
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @check-change="checkChange">
            <div class="tree-node" slot-scope="{ node, data }">
                <el-tooltip :content="data.text" placement="top">
                <span class="label">
                    <i class="fa fa-folder-open-o" v-if="data.type=='group'"></i>
                    <div class="treeicon_master" v-if="data.type==='master' && data.master_type ==='default'"></div>
                    <div class="treeicon_mobilemaster"  v-if="data.master_type ==='mobile'"></div>
                 <i class="fa fa-file-text-o" v-if="data.type=='page'"></i>
                    <span>{{ data.text }}</span>
                </span>
                </el-tooltip>
                <span v-if="data.type == 'page'">
              <el-radio size="mini" border v-model="init" :label="data.id" :disabled="!node.checked">
                  {{$t('privacy.initPage')}}
              </el-radio>
            </span>
            </div>
        </el-tree>
    </div>

</template>

<script lang="ts">

    import {Component, Prop, Vue, Watch} from "vue-property-decorator";

    @Component
    export default class PageGradeSetting extends Vue {
        @Prop() pageList: any;
        @Prop() init_page: string;
        @Prop() use_page: Array<any>;
        filterText:string = '';
        private use:Array<any> = this.use_page;
        private init:string = this.init_page;
        private data:Array<any> = [];

        @Watch('pageList', {immediate: true, deep: true})
        onPageListChange() {
            this.data = this.convertListToTree(this.pageList);
        }

        @Watch('use_page', {immediate:true, deep: true})
        onUsePageChange() {
            this.use = this.use_page;
            if(this.$refs.tree) {
                this.$refs.tree.setCheckedKeys(this.use);
            }
        }

        @Watch('init_page', {immediate:true, deep: true})
        onInitPageChange() {
            this.init = this.init_page;
        }

        @Watch('filterText')
        onFilterTextChange(value) {
            this.$refs.tree.filter(value);
        }

        getCheckedPage() {
            return this.$refs.tree.getCheckedKeys();
        }

        filterNode(value, data) {
            if (!value) return true;
            return data.text.indexOf(value) !== -1;
        }

        convertListToTree(list) {
            let map = {}, node, roots = [];

            list.map((value, index) => {
                map[list[index].id] = index;
                list[index].children = [];
            });

            list.map((value, index) => {
                node = list[index];
                if (node.parent && node.parent != '#') {
                    list[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            });

            return roots;
        }

        checkChange(data, checked, indeterminate) {
            let checkedNodes = this.$refs.tree.getCheckedNodes().map(node => {
                return node.id
            });

            if (!checkedNodes.length ||
                (!checkedNodes.includes(this.init))) {
                this.init = null;
            }
        }
    }
</script>
<style scoped>

    .search-field {
        width: 100%;
        padding-bottom: 3px;
    }

    .el-tree {
        width: 400px;
        height: 670px;
        overflow: auto;
        background: #f5f7fa;
        border: 1px solid #c9d2e0;
    }

    .el-tree .tree-node {
        flex: 1;
        font-size: 13px;
        overflow: hidden;
        cursor:text;
    }

    .el-tree >>> .el-tree-node {
        outline: none;
    }

    .el-tree >>> .el-tree-node__content {
        height: 30px;
    }

    .el-tree >>> .label {
        padding-right: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        outline: none;
        display: flex;
    }

    .el-tree >>> .label > i {
        font-size: 17px;
        padding-right: 3px;
    }

    .el-tree >>> .label > .treeicon_master {
        background-image: url('../../assets/image/treeicon_master.png');
        background-position: center;
        width: 14px;
        height: 16px;
        margin-right: 4px;
    }

    .el-tree >>> .label > .treeicon_mobilemaster {
        background-image: url('../../assets/image/treeicon_mobilemaster.png');
        background-position: center;
        width: 14px;
        height: 16px;
        margin-right: 4px;
    } 

    .tree-node >>> .el-radio--mini.is-bordered {
        padding: 3px 4px;
    }

    .tree-node >>> .el-radio__label {
        padding-left: 3px;
    }

</style>
