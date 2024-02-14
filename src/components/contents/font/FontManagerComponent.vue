<template>
    <div>
        <div class="title d-flex">
            <div class="title-bullet"></div>
            {{$t('sideMenu.MU010')}}
            <el-button
              @click="$modal.show('font-tooltip')"
              type="success"
              plain
              class="font-tooltip"
            >
              How to create a font upload file?
            </el-button>
        </div>
        <div class="container">
            <div class="upload-font">
                <el-upload
                    class="upload-demo" drag multiple
                    :action="url"
                    :before-upload="onBeforeUpload"
                    :on-success="onUploadSuccess"
                    :on-error="onUploadError"
                    :show-file-list="false"
                    >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                </el-upload>
            </div>
            <div>
                <div id="font-tree"></div>
            </div>
        </div>
        <font-tool-tip-modal></font-tool-tip-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import AdminUtil from '../../../api/AdminUtil';
    import FontToolTipModal from '../font/FontToolTipModal.vue'

    @Component({
        components : {
            FontToolTipModal,
        }
    })
    export default class FontManagerComponent extends Vue{
        private url:string = "";
        private title:string = "";
        private uploadCount: number = 0;
        private uploadFontList: Array<object> = [];

        public fontTreeData:Array = [];
        public selectedFont:string = "";
        public fontsCss:string = "";
        public fontsFiles:any = {};
        public fonts:string = "";

        private basicFontTree = {
            "NanumGothic" : ["NanumGothic-Regular.eot","NanumGothic-Regular.ttf", "NanumGothic-Regular.woff", "NanumGothic-Regular.woff2"],
            "NanumSquareB" : ["NanumSquareB.eot", "NanumSquareB.woff"],
            "NanumSquareR" : ["NanumSquareR.eot", "NanumSquareR.woff"],
            "NanumMyeongjo" : ["NanumMyeongjo.eot", "NanumMyeongjo.woff", "NanumMyeongjoBold.eot", "NanumMyeongjoBold.woff"],
            "NanumBarunGothic" : ["NanumBarunGothic.eot", "NanumBarunGothic.woff", "NanumBarunGothicBold.eot", "NanumBarunGothicBold.woff"]
        };

        makeFontTree(type, data){
            if(type === "custom") {
                for(let key in data) {
                    for(let basicKey in this.basicFontTree) {
                        if(basicKey === key) {
                            delete data[key]
                            break;
                        }
                    }
                }
            } 

            if(this.fontTreeData.length === 0){
                this.fontTreeData.push(...[{
                    id : 'extra_fonts',
                    text : 'Extra Fonts',
                    parent : '#',
                    type : 'group',
                    state : {
                        "opened" : false
                    }
                },{
                    id : 'basic_fonts',
                    text : 'Basic Fonts',
                    parent : '#',
                    type : 'group',
                    state : {
                        "opened" : false
                    }
                }]);
            }
            for(let font in data){
                // const parentId = AdminUtil.generateUUID();
                const parentId = font
                this.fontTreeData.push({
                    id : parentId,
                    text : font,
                    parent : type ==='basic' ? "basic_fonts" : "extra_fonts",
                    type : 'group',
                    state : { opened : false }
                });
                data[font].forEach((font_c)=>{
                    this.fontTreeData.push({
                        // id : font_c,
                        id : AdminUtil.generateUUID(),
                        parent : parentId,
                        text : font_c,
                        type : 'file'
                    })
                })
            }
        }

        makeConfigString(data){
            this.fonts = data.replace(/[\[|\]]/g,'').replace(/\}\,/g,'}<br>')
        }

        refresh(){
            this.$adminAPI.getFontList().then((result) => {
                this.fontTreeData = [];
                this.selectedFont = result.data.selected_font;
                this.fontsFiles = result.data.fontsFiles;
                this.makeConfigString(result.data.fonts);
                this.makeFontTree('basic',this.basicFontTree);
                this.makeFontTree('custom',this.fontsFiles);

                $('#font-tree')['jstree'](true).settings.core.data = this.fontTreeData;
                $('#font-tree')['jstree'](true).refresh();

                this.selectedFont = result.data.selected_font;
            })
        }
        created(){
            this.title = this.$parent.activeMenu.name;
            this.url = this.$adminAPI._getFullPathName() + "/fontUpload";
            this.makeFontTree('basic', this.basicFontTree);
        }
        mounted(){
            this.$nextTick(function(){
                this.$adminAPI.getFontList().then(function(result){
                    this.selectedFont = result.data.selected_font;
                    this.fontsFiles = result.data.fontsFiles;
                    this.makeConfigString(result.data.fonts);
                    this.makeFontTree('custom', this.fontsFiles);
                    let that = this;
                    $('#font-tree')['jstree']({
                        "core" : {
                            "data" : that.fontTreeData,
                            "themes" : {
                                "url" : true,
                                "icons" : true
                            }
                        },
                        "contextmenu" : {
                            "items" : function(node){
                                var contextItems = {};
                                if(node.id !== 'extra_fonts' && node.id !== 'basic_fonts' && node.type !== 'file'){
                                    contextItems['use_font'] = {
                                        "label" : "use this font",
                                        "action" : function(){
                                            that.$adminAPI.setFont({"newFont" : node.text}).then(() => {
                                                that.refresh()
                                            });
                                        }
                                    };
                                    if(node.type !== 'basic-font'){
                                        contextItems['delete_font'] = {
                                            "label" : "delete this font",
                                            "action" : function(){
                                                that.$confirm(that.$i18n.messages.wv.msg04, that.$i18n.messages.wv.common.notification, {
                                                    confirmButtonText: 'OK',
                                                    cancelButtonText: 'Cancel',
                                                    type: 'warning'
                                                }).then(()=>{
                                                    that.$adminAPI.deleteFont({"deleteFont" : node.text}).then((result) => {
                                                        if(result.result === 'ok'){
                                                            that.refresh()
                                                        }
                                                    });
                                                }).catch(()=>{
                                                    console.log("cancel!")
                                                })
                                            }
                                        };
                                    }
                                }
                                return contextItems;
                            }
                        },
                        "types": {
                            "#": {
                                "max_children": 1,
                                "max_depth": 15
                            },
                            "file": {
                                "icon": "fa fa-file-o",
                            },
                            "basic-font" : {
                                "icon": "fa fa-folder-o",
                            },
                            "extra-font" : {
                                "icon": "fa fa-folder-o",
                            }
                        },
                        "plugins": ["types", "wholerow", "contextmenu",  "themes", 'unique']
                    }).on('loaded.jstree', function(e, data){
                        if(this.selectedFont === 'null'){
                            this.selectedFont = null;
                        }else{
                            $('#'+that.selectedFont).css('color', 'blue');
                        }
                    }).on('refresh.jstree', function(){
                        if(this.selectedFont === 'null'){
                            this.selectedFont = null;
                        }else{
                            $('#'+that.selectedFont).css('color', 'blue');
                        }
                    }).on('open_node.jstree', function(){
                        if(this.selectedFont === 'null'){
                            this.selectedFont = null;
                        }else{
                            $('#'+that.selectedFont).css('color', 'blue');
                        }
                    })
                }.bind(this));
            })
        }

        onBeforeUpload(file){
            this.uploadCount++;
        }

        onUploadSuccess(response, file, fileList){    
            this.uploadCount--;
            this.uploadFontList.push(response.fontData);

            try{
                if(response.result === 'FAIL') throw 'Error';

                if(this.uploadCount === 0){
                    this.$adminAPI.addFont(this.uploadFontList).then((result) => {                        
                        this.$message({
                            message: this.$i18n.messages.wv.msg27,
                            showClose: true,
                            type: "success"
                        })
                        
                        this.uploadFontList.length = 0;
                        this.refresh();
                    })
                }
            }catch{
                this.onUploadError();
            }
        }

        onUploadError(){
            this.$message({
                showClose: true,
                message: this.$i18n.messages.wv.msg28,
                type: 'error'
            });

            return false;
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .font-tooltip {
      margin-left: 200px;
    }

    .upload-font {
        width: 260px;
        padding-right: 10px;
    }

    .upload-font >>> .el-upload-dragger {
        width: 260px;
        height: 150px;
        background-color: #fbfbfb;
    }
</style>
