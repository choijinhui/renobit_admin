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
                        <i class="fa fa-file-text-o" v-if="data.type=='dwg'"></i>
                        <span>{{ data.text }}</span>
                    </span>
                </el-tooltip>
                <span v-if="data.type == 'dwg'">
                    <el-radio size="mini" border v-model="init" :label="data.id" :disabled="!node.checked">
                        {{$t('privacy.initPage')}}
                    </el-radio>
                </span>
            </div>
        </el-tree>
    </div>

</template>

<script lang="ts">
import { ElTree } from "element-ui/types/tree";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

export type Drawing = {
    type: 'dwg' | 'group';
    id: string;
    children: Drawing[];
    parent: string | null;
    initpage_yn?: string;
    use_yn?: string;
    text?: string;
    name?: string;
};

@Component
export default class PageGradeSetting extends Vue {
    @Prop() drawingList: Drawing[];
    @Prop() useDrawingList: string[];
    @Prop() init_page: string;
    filterText:string = '';
    private use:string[] = [];
    private data:Array<any> = [];
    private init:string = this.init_page;

    @Watch('drawingList', { immediate: true, deep: true  })
    onPageListChange() {
        this.data = this.convertListToTree(this.drawingList);
    }

    @Watch('useDrawingList', { immediate:true, deep: true })
    onUsePageChange() {
        this.use = this.useDrawingList;
        if(this.$refs.tree) {
            (this.$refs.tree as ElTree).setCheckedKeys(this.use);
        }
    }

    @Watch('filterText')
    onFilterTextChange(value) {
        (this.$refs.tree as ElTree).filter(value);
    }

    @Watch('init_page', {immediate:true, deep: true})
        onInitPageChange() {
            this.init = this.init_page;
    }

    getCheckedPage() {
        return (this.$refs.tree as ElTree).getCheckedKeys();
    }

    filterNode(value, data) {
        if (!value) return true;
        return data.text.indexOf(value) !== -1;
    }

    convertListToTree(list: Drawing[] & { privacy?: boolean }) {
        if (list.privacy) return list;

        let map: Record<string, number> = {}, node: Drawing, roots: Drawing[] = [];

        list.map((_, index) => {
            map[list[index].id] = index;
            list[index].children = [];
        });

        list.map((_, index) => {
            node = list[index];
            if ((node.parent && node.parent !== '#') || node.parent === null) {
                list[map[node.parent || 'wv_root']].children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    checkChange() {
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
    }

    .el-tree >>> .label > i {
        font-size: 17px;
        padding-right: 3px;
    }

    .tree-node >>> .el-radio--mini.is-bordered {
        padding: 3px 4px;
    }

    .tree-node >>> .el-radio__label {
        padding-left: 3px;
    }

</style>
