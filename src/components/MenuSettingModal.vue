<template>
    <modal name="menu-setting"
           :click-to-close="false"
           :resizable="true"
           :reset="true"
           :width="400"
           :height="700"
           :min-width="400"
           :min-height="700"
           draggable=".modal-header"
           @opened="openedModal()">
        <div class="modal-header">
            <span>{{$t('menu.menuSettingPopup')}}</span>
            <a class="close-modal-btn" role="button" @click="onHidden()"><i class="el-icon-error"></i></a>
        </div>

        <div class="top-btn-area">
            <el-button size="small" type="success" icon="el-icon-plus" @click="addMenuItem">{{$t('common.add')}}</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="refreshMenuList">{{$t('common.sync')}}</el-button>
        </div>

        <div id="menuArea" class="dd flex-scroll"></div>

        <div class="btm-area d-flex">
            <el-button size="mini" type="primary" @click="saveMenuList()">{{$t('common.save')}}</el-button>
            <el-button size="mini" type="primary" @click="onHidden()">{{$t('common.close')}}</el-button>
        </div>

    </modal>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import util from '../api/AdminUtil'

    @Component
    export default class MenuSettingModal extends Vue {
        @Prop()
        private list:Array<any>;
        private menuList:Array<any> = [];

        private onHidden() {
            Vue.prototype.$modal.hide("menu-setting");
        }

        private openedModal() {
            let msg = this.$i18n.messages.wv;
            this.menuList = this.list;
            for(let item of this.menuList){
                if (msg.sideMenu.hasOwnProperty(item.menu_id)) {
                    item.name = msg.sideMenu[item.menu_id];
                }
            }

            $("#menuArea").nestable(
                {
                    maxDepth: 1,
                    json: this.menuList,
                    itemRenderer: this.itemRenderer
                }).on("change", this.menuChange);

            var $menuItem = $("#menuArea > ol > li");
            this.setBtnEvent($menuItem);
        }

        private setBtnEvent(item) {
            var $edit = $(item).find('.btnEditPage');
            var $del = $(item).find('.btnDelPage');

            $edit.click(function (e) {
                this.editMenuItem(e.target);
            }.bind(this));

            $del.click(function (e) {
                this.delMenuItem(e.target);
            }.bind(this));
        }

        private menuChange() {
            this.menuList = $("#menuArea").nestable('serialize');
        }

        private addMenuItem() {
            var msg = this.$i18n.messages.wv;
            $('#menuArea').nestable('add', {menu_id: util.generateUUID(), name: msg.menu.__name__, url: "", type: "CUSTOM"});

            var $menuItem = $("#menuArea > ol > li:last-child");
            this.setBtnEvent($menuItem);
            $("#menuArea").animate({scrollTop: $("#menuArea").prop("scrollHeight")}, 400);
            $menuItem.find(".btnEditPage").trigger("click");
        }

        private refreshMenuList() {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg00, msg.common.notification, {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                $("#menuArea").nestable("destroy");
                this.openedModal();
            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });
        }

        private editMenuItem(target) {
            var msg = this.$i18n.messages.wv;
            var $this = this;
            var $menuItem = $(target).closest("li");          // li 태그
            var data = $menuItem.data();

            // 기존 item 살리기
            var orgElement = $menuItem.find('.dd-content:eq(0) > div');
            var $content = orgElement;

            // 기존 item 지우기
            orgElement.remove();

            var $handler = $menuItem.find('.dd-content:eq(0)');

            // 편집영역
            var editArea = $('<div class="editArea"></div>');
            var $nameInput = $('<input type="text" value="' + data.name + '" class="editInput">');
            var $urlInput = $('<input type="text" id="urlInput" placeholder="'+msg.msg30+'" value="' + data.url + '" class="editInput">');

            var cancleBtn = $('<button id="btnCancle" class="editBtn cancelIconBtn"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button>');
            var saveBtn = $('<button id="btnSave" class="editBtn saveIconBtn"><i class="fa fa-check" aria-hidden="true"></i></button>');
            var nameArea = $('<div class="flex-space-between"></div>');
            var urlArea = $('<div class="flex-space-between"></div>');

            $handler.append(editArea);
            nameArea.append($nameInput, saveBtn, cancleBtn);

            if (data.type != 'DEFAULT') {
                urlArea.append($urlInput);
            }
            editArea.append(nameArea, urlArea);

            $(cancleBtn).on('click', function (e) {
                $menuItem.find('.dd-content:eq(0) > div').remove();
                $handler.append($content);
                $this.setBtnEvent($content);
            });

            $(saveBtn).on('click', function (e) {
                var name:any = $nameInput.val();
                var url:any = $urlInput.val();

                if(name === '' || url === '') return $this.$message.warning(msg.msg24);
                if(util.isValidUrl(url) === false) return $this.$message.warning(msg.msg03);

                $menuItem.find('.dd-content:eq(0) > div').remove();
                $handler.append($content);
                $menuItem.data("name", name);
                $($handler.find("div.text-no-wrap")[0]).text(name);

                if (data.type != 'DEFAULT') {
                    $($handler.find("div.text-no-wrap")[1]).text(url);
                    $menuItem.data("url", url);
                }

                $this.setBtnEvent($content);
                $this.menuChange();
            });

        }

        private delMenuItem(target) {
            var msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg04, msg.common.notification, {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                var $menuItem = $(target).closest("li");
                $menuItem.remove();
                this.menuChange();
            }).catch((response) => {
                if (response === 'cancel') {
                    this.$message(msg.msg40);
                }
            });
        }

        private saveMenuList() {
            // save 버튼 체크
            let isEditing = $("#btnSave").length > 0;
            let msg = this.$i18n.messages.wv;

            let noNameOrUrl = this.menuList.some(eachMenu => (!eachMenu.url || !eachMenu.name))

            if(isEditing || noNameOrUrl) {
                this.$message.warning(msg.msg24);
            } else {
                this.$confirm(msg.msg05, msg.common.notification, {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(() => {
                    this.save();
                }).catch((response) => {
                    if (response === 'cancel') {
                        this.$message(msg.msg40);
                    }
                });
            }
        }

        private save() {
            var msg = this.$i18n.messages.wv;

            this.$adminAPI.setMenuList(this.menuList).then((result) => {
                this.$message.success(msg.msg06);
                this.$emit('changeMenu', this.menuList);
            }, (error) => {
                this.$message.error(msg.msg07);
                console.log(error);
            });
        }

        private itemRenderer(item_attrs:any, content:any, children:any, options:any, item:any) {
            var item_attrs_string = $.map(item_attrs, function (value, key) {
                return ' ' + key + '="' + value + '"';
            }).join(' ');


            var html = '<' + options.itemNodeName + item_attrs_string + '>';
            html += '<div class="dd-content">';
            html += '<div class="dd-handle">';
            html += '<i class="fa fa-bars fa-lg" aria-hidden="true"></i>';
            html += '</div>';
            html += '<div class="menu-item-cont" >';
            html += '<div name="label" class="text-no-wrap">';
            html += item.name;
            html += '</div>';
            if (item.type != "DEFAULT") {
                html += '<div class="text-no-wrap">';
                html += item.url;
                html += '</div>';
            }
            html += '</div>';

            html += '<div class="editBtnWrap">';
            if (item.type != "DEFAULT") {
                html += '<button class="btnEditPage editBtn"><i class="fa fa-pencil" aria-hidden="true"></i></button>';
                html += '<button class="btnDelPage editBtn"><i class="fa fa-times-circle" aria-hidden="true"></i></button>';
            }
            html += '</div>';
            html += '</div>';
            html += '</' + options.itemNodeName + '>';

            return html;
        }
    }

</script>

<style scoped>
    .top-btn-area {
        height: 35px;
        padding: 5px 20px;
        text-align: left;
    }

    #menuArea {
        padding-right: 20px;
        height: 80%;
        overflow: auto;
    }

    .btm-area {
        justify-content: center;
        padding-top: 13px;
    }
    #menuArea >>> .menu-item-cont div {
        width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
