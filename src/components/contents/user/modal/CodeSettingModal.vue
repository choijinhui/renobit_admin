<template>

    <modal name="code-setting"
           :click-to-close="false"
           :resizable="true"
           :reset="true"
           :width="450"
           :height="700"
           :min-width="450"
           :min-height="700"
           draggable=".modal-header"
           @before-open="beforeOpen">
        <div class="modal-header">
            <span>{{$t('common.code')}} {{$t('common.setting')}} {{$t('common.popup')}}</span>
            <a class="close-modal-btn" @click="_onHidden"><i class="el-icon-error"></i></a>
        </div>

        <div class="modal-content">
            <div class="d-flex search-area">
                <el-input class="search-field" placeholder="Type something" v-model="filterText">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>

                <el-button size="small" type="primary" @click="saveCode"><i class="fa fa-floppy-o fa-lg"></i> {{$t('common.save')}}
                </el-button>
            </div>

            <div class="tree-area">
                <el-tree
                    id="codeTree"
                    v-bind:empty-text="$t('msg08')"
                    ref="codeTree"
                    class="filter-tree"
                    :data="codeList"
                    :props="defaultProps"
                    :default-expand-all="true"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    :render-content="renderContent"
                >
                </el-tree>
            </div>

        </div>
    </modal>
</template>

<script lang="ts">
    import util from "../../../../api/AdminUtil"
    import {Component, Vue, Watch} from "vue-property-decorator";
    import {VNode} from "vue";
    @Component
    export default class CodeSettingModal extends Vue {
        private id:number = 1000;
        private codeList:any = [];
        private defaultProps:any =  {children: 'children', label: 'name'};

        public filterText:string = '';
        private delList:any; addList:any; list:any;

        @Watch("filterText")
        filter(val) {
            this.$refs.codeTree.filter(val);
        }

        beforeOpen(event) {
            var list = $.extend(true, [], event.params.codeList);
            this.codeList = this.convertListToTree(list);

            this.delList = null;
            this.addList = null;
            this.list = null;
        }

        convertListToTree(list) {
            var map = {}, node, roots = [];

            list.map((value, index) => {
                map[list[index].code] = index;
                list[index].children = [];
            });

            list.map((value, index) => {
                node = list[index];
                if (node.parent) {
                    list[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            });

            return roots;
        }

        convertTreeToList(data, list) {
            for (let i = 0; i < data.length; i++) {
                var item = data[i];
                list.push(item);

                if (item.children) {
                    this.convertTreeToList(item.children, list);
                }
            }
        }

        _onHidden() {
            this.$modal.hide("code-setting");
        }

        filterNode(value, data) {
            if (!value) return true;
            return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }

        saveCode() {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg05, msg.common.notification, {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.list = [];
                this.convertTreeToList(this.codeList, this.list);

                var editList = [];

                this.list.map(value => {
                    if (value.mode === 'edit') {
                        editList.push(value);
                    }
                });

                this.$adminAPI.setCodeList({
                    addList: this.addList,
                    editList: editList,
                    delList: this.delList
                }).then(result => {
                    this.$message.success(msg.msg06);
                    this.$emit('getCodeList', this.list);

                    this._onHidden();
                }, error => {
                    this.$message.error(msg.msg07);
                    console.log(error);
                });
            })
        }

        editNode(data, event = null) {
            var node = $(event.currentTarget).parent().parent()[0];     // $('.tree-area').find('.tree-node')[data.$treeNodeId - 1];
            var $nodeParent = $(node).parent();
            $(node).remove();

            var $editArea = $('<div class="d-flex"></div>');
            var $saveBtn = $('<button id="btnSave" class="editBtn saveIconBtn"><i class="fa fa-check"></i></button>');
            var $cancleBtn = $('<button id="btnCancle" class="editBtn cancelIconBtn"><i class="fa fa-times-circle"></i></button>');
            var $input = $('<input type="text" value="' + data.name + '" class="editInput">');

            $editArea.append($input, $saveBtn, $cancleBtn);
            $nodeParent.append($editArea);

            $($cancleBtn).on('click', function (e) {
                $editArea.remove();
                $nodeParent.append($(node));
            });

            $($saveBtn).on('click', function (e) {
                data.name = $input.val();
                data.mode = "edit";
                $editArea.remove();
                $nodeParent.append($(node));
            });
        }

        addNode(node, data) {
            var msg = this.$i18n.messages.wv;
            var id = util.generateUUID();
            const newChild = {
                code: id, name: msg.common.newCode, children: [], seq: data.children.length,
                mode: "add", level: node.level, parent: data.code
            };
            if (!data.children) {
                this.$set(data, 'children', []);
            }
            data.children.push(newChild);

            if (!this.addList) {
                this.addList = [];
            }

            this.addList.push(newChild);

            // 편집모드 전환
        //    setTimeout(() => {
                var editBtn = $("#codeTree").find("#" + id)[0];

                if (editBtn) {
                    $(".tree-area").animate({scrollTop: editBtn.offsetTop - $('.tree-area').height()}, 400, 'linear');
                    $(editBtn).trigger("click");
                }
        //    }, 1);
        }

        delNode(node, data) {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg04, msg.common.notification, {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex(d => d.code === data.code);

                if (!this.delList) this.delList = [];
                this.convertTreeToList([data], this.delList);

                children.splice(index, 1);
            })
        }



        renderContent(h, {node, data, store}):VNode {
            let label = this.$createElement("div", data.name, "+");
            let editButton = this.$createElement(
                "el-button",
                {
                    on: {
                        click: ($event) => this.editNode(data, $event)
                    },
                    props: {
                        id: data.code,
                        size: "mini",
                        type: "text"
                    }
                },
                [this.$createElement("i", {class : "fa fa-pencil-square-o fa-2x"})]
            );

            let addButton = this.$createElement(
                "el-button",
                {
                    on: {
                        click: () => this.addNode(node, data)
                    },
                    props: {
                        id: data.code,
                        size: "mini",
                        type: "text"
                    }
                },
                [this.$createElement("i", {class : "fa fa-plus-circle fa-2x"})]
            );

            let delButton = this.$createElement(
                "el-button",
                {
                    on: {
                        click: () => this.delNode(node, data)
                    },
                    props: {
                        id: data.code,
                        size: "mini",
                        type: "text"
                    }
                },
                [this.$createElement("i", {class : "fa fa-minus-circle fa-2x"})]
            );

            let span = this.$createElement("span", {}, [editButton, addButton, delButton]);
            let treeNode = this.$createElement("div", { class: "tree-node" }, [label, span]);

            return treeNode;
        }
    }

</script>

<style scope>

    .modal-content {
        padding: 10px;
        height: 100%;
    }

    .modal-content > .tree-area {
        height: 84%;
        overflow: auto;
        padding-top: 10px;
        flex: 1;
    }

    .modal-content > .search-area {
        padding-bottom: 10px;
        justify-content: space-between;
    }

    .tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }

    .tree-node > span .fa-minus-circle {
        color: #F56C6C;
    }

    .tree-node > span .fa-minus-circle:hover {
        color: #fb7777;
    }

    .tree-node > span .fa-plus-circle {
        color: #67C23A;
    }

    .tree-node > span .fa-plus-circle:hover {
        color: #85ce61;
    }

</style>
