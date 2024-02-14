<template>
    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU008')}}
        </div>

        <div class="container">
            <div class="upload-area">
                <el-upload
                    class="upload-demo" drag multiple
                    :action="url"
                    :file-list="fileList"
                    :before-upload="onBeforeUpload"
                    :on-success="onUploadSuccess"
                    :on-error="onUploadError"
                    ref="uploadComp">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                </el-upload>
            </div>

            <div class="content-area">
                <el-collapse v-model="activePanel" v-if="packList.length > 0" @change="onCollapseChange" accordion>
                    <el-collapse-item :title="pack.pack_name" :name="pack.pack_name" v-for="pack in packList">
                        <template slot="title">
                            <el-tag>{{pack.pack_name}}</el-tag>
                            <el-tag type="success">ver {{pack.major}}.{{pack.minor}}</el-tag>
                        </template>

                        <div class="search-area d-flex">
                            <div class="d-flex">
                                <div class="label-bullet"></div>
                                <span>{{$t('common.search')}}</span>
                                <el-select v-model="column">
                                    <el-option v-bind:label="$t('pack.label')" value="label"></el-option>
                                    <el-option v-bind:label="$t('pack.name')" value="name"></el-option>
                                </el-select>
                                <el-input class="search-field" v-bind:placeholder="$t('msg09')" v-model="searchStr">
                                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                                </el-input>
                            </div>
                        </div>

                        <el-table :data="pack.list.filter(data => !searchStr || data[column].toLowerCase().includes(searchStr.toLowerCase()))"
                                  maxHeight="400" border
                                  v-bind:empty-text="$t('msg08')">
                            <!--<el-table-column property="file_id" v-bind:label="$t('pack.file_id')" sortable
                                             show-overflow-tooltip></el-table-column>-->
                            <el-table-column property="label" v-bind:label="$t('pack.label')" sortable
                                             show-overflow-tooltip></el-table-column>
                            <el-table-column property="name" v-bind:label="$t('pack.name')" sortable
                                             show-overflow-tooltip></el-table-column>
                            <el-table-column property="type" v-bind:label="$t('pack.type')" sortable></el-table-column>
                            <el-table-column property="category" v-bind:label="$t('pack.category')" sortable></el-table-column>
                            <el-table-column v-bind:label="$t('pack.version')" sortable>
                                <template slot-scope="scope">
                                    {{scope.row.major}}.{{scope.row.minor}}
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-collapse-item>
                </el-collapse>

                <div class="empty-msg" v-else> {{$t('msg29')}} </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";

    @Component
	export default class PackManageComponent extends Vue {
        private packList: any = [];
        private fileList:Array = [];
        private url:string = "";
        private searchStr:string = "";
        private column: string="label";
        private activePanel:string = '';
        private uploadCount;
        private prevFile:Object = {};

        created() {
            this.url = this.$adminAPI._getFullPathName() + "/packUpload";
            this.callPackInfo();
        }

        mounted() {
            Object.defineProperty( this.$refs.uploadComp, 'handleRemove', {
                writable : true
            })
            this.$refs.uploadComp.handleRemove = this.onRemove;
        }

        callPackInfo() {
            this.$adminAPI.getPackageInfo().then((result) => {
                let packNames = result.data.packNames;
                let packages = result.data.packages;
                this.packList = [];
                this.uploadCount = 0;

                packNames.forEach(item=>{
                    item.name = item.pack_name;
                    item.list = packages.filter(x=>x.pack_name == item.pack_name);
                    item.major = item.list[0].major;
                    this.packList.push(item);
                });

                this.fileList = packNames;
            });
        }

        onBeforeUpload(file) {
            this.uploadCount++;
            let fileName = file.name.replace(".zip", "");
            let item = this.fileList.find(x=> x.name == fileName);
            if(item) {
                this.prevFile[fileName] = {
                    name: fileName,
                    prev: item.major + item.minor
                };
            }
            this.$loading({});
        }

        onUploadSuccess(response, file, fileList) {
            this.uploadCount--;
            if(this.uploadCount == 0){
                this.callPackInfo();
                this.$loading({}).close();

                this.fileList.forEach(item=>{
                    if(this.prevFile[item.name] != null) {
                        this.prevFile[item.name]["new"] = item.major + item.minor;
                    }
                });

                let msg = this.$i18n.messages.wv;
                if(response.result == 'FAIL') {
                    this.$message.error(msg.msg28);
                } else {
                    let prevFileKey = Object.keys(this.prevFile);
                    if(prevFileKey.length > 0) {
                        let tableStr = `<div>${msg.msg33}</div>`;
                        tableStr += '<table style="padding-top: 10px;">';
                        Object.keys(this.prevFile).forEach(key=>{
                            let item = this.prevFile[key];
                            tableStr += `<tr>
                                            <td style="width: 80px;"><b>${item.name}</b></td>
                                            <td>
                                                ver${item.prev}\t
                                                <i class="fa fa-chevron-right" aria-hidden="true"></i>
                                                ver${item.new}
                                            </td>
                                        </tr>`
                        });

                        tableStr += '</table>'

                        this.$message({
                            message: tableStr,
                            dangerouslyUseHTMLString: true,
                            type: "success"
                        })

                    } else {
                        this.$message.success(msg.msg27);
                    }
                }
                this.prevFile = {};
            }
        }

        onUploadError() {
            this.callPackInfo();
            this.$loading({}).close();
            let msg = this.$i18n.messages.wv;
            this.$message.error(msg.msg28);

            this.prevFile = {};
        }

        onRemove(file) {
            console.log("handle Remove file : ", file);
            let msg = this.$i18n.messages.wv;
            this.$confirm(msg.msg04, msg.common.notification, {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(()=>{
                this.$confirm(`<p style='color:red; font-weight: bold; font-size:14px;'>${msg.msg37}</p>`, msg.common.notification, {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(()=>{
                    this.onRemovePack(file);
                }).catch(()=>{
                    console.log("cancel!")
                })
            }).catch(()=>{
                console.log("cancel!")
            })
        }

        onRemovePack(file) {
            // 팩 json 읽기
            this.$adminAPI.getPackJSON(file.name).then((res)=>{
                // 팩 삭제
                console.log(res);
                let msg = this.$i18n.messages.wv;
                this.$adminAPI.deletePack(res).then(()=>{
                    this.callPackInfo();
                    this.$message.success(msg.msg10);
                })
            })
        }

        onCollapseChange() {
            this.searchStr = '';
            this.column = "label";
        }
	}
</script>

<style scoped>

    .container {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .upload-area {
        width: 260px;
        padding-right: 10px;
    }

    .upload-area >>> .el-upload-dragger {
        width: 260px;
        height: 150px;
        background-color: #fbfbfb;
    }

    .content-area {
        display: block;
        flex: 1;
    }

    .content-area >>> .el-table {
        background-color: transparent;
        border: none;
    }

    .content-area >>> .el-table th {
        background-color: #869cd6;
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

    .content-area >>> .el-collapse-item__header {
        padding: 0px 10px;
        background-color: #fbfbfb;
    }

    .content-area >>> .el-collapse-item__content{
        padding: 10px;
        background-color: #f0f1f5;
    }

    .content-area >>> .el-collapse-item__wrap {
        border-left: 1px solid #e6ebf5;
        border-right: 1px solid #e6ebf5;
    }

    .search-area {
        height: 37px;
        background-color: #fbfbfc;
        /*border-radius: 5px;*/
        border-left: 5px solid #9cb4e9;
        padding: 0 10px;
        color: #576cab;
        font-weight: bold;
        margin-bottom: 7px;
        justify-content: space-between;
        overflow: hidden;
    }

    .search-area span {
        padding-left: 10px;
        width: 40px;
    }

    .search-area >>> .el-input {
        width: 270px;
    }

    .search-area >>> .el-select > .el-input {
        width: 120px;
    }


</style>
