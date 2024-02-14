import httpAPI from "axios";
import * as constants from './Constants'

export default {
    PATH: "",
    _getContext(solution) {
        if (!solution) return this._getAdminPageContext();
        
        let storageContextKey
        if (solution === constants.PNID) {
            storageContextKey = constants.PNID_CONTEXT_STORAGE_KEY
        }
        if (solution === constants.RENOBIT) {
            storageContextKey = constants.RENOBIT_CONTEXT_STORAGE_KEY
        }
        return sessionStorage.getItem(storageContextKey)
    },
    _getAdminPageContext() {
        let pathName = location.pathname,
        isContextRoot = pathName.match(/\//ig).length === 1;
        return isContextRoot ?  "" : `/${pathName.split("/")[1]}`
    },
    _getFullPathName(solution) {
        return location.origin + this._getContext(solution);
    },
    getConfig() {
        let path = this._getFullPathName() + "/custom/config/config.json";
        return httpAPI.get(path).then((res) => {
            return res.data.config;
        });
    },
    getLanguage(locale) {
        let path = this._getFullPathName() + "/admin/static/locales/" + locale.replace("_", "-") + ".json";
        return httpAPI.get(path).then((res) => {
            return res.data;
        })
    },

    getPackJSON(pack_name) {
        let path = this._getFullPathName(constants.RENOBIT) + "/custom/packs/" + pack_name + "/tb_package.json";
        return httpAPI.get(path).then((res) => {
            return res.data;
        });
    },
    getMenuList() {
        let data = {
            id: "adminService.getMenuList",
            params: {}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            throw new Error(error)
        });
    },

    setMenuList(list) {
        let data = {
            id: "adminService.setMenuList",
            params: {
                menuList: list
            }
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getUserInfo(param = {}) {
        let data = {
            id: "adminService.getUserInfo",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getUserList(param = {}) {
        let data = {
            id: "adminService.getUserList",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getUserCodeList(param) {
        let data = {
            id: "adminService.getUserCodeList",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    addUser(param) {
        let data = {
            id: "adminService.addUser",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            if (result.data.result == 'error') throw new Error(result.data.errorMsg)
            return result.data.data;
        }, (error) => {
            console.log(error);
            return Promise.reject(error)
        });
    },

    checkCurrentUserPwd(param) {
        let data = {
            id: "adminService.checkCurrentUserPwd",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    editUser(param) {
        let data = {
            id: "adminService.editUser",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            if (result.data.result == 'error') throw new Error(result.data.errorMsg)
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },


    editUserSelf(param){
        let data = {
            id: "adminService.editUserSelf",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    deleteUser(param) {
        let data = {
            id: "adminService.deleteUser",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    setCodeList(param) {
        let data = {
            id: "adminService.setCodeList",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getGradeList() {
        let data = {
            id: "adminService.getGradeList",
            params: {}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getPageList(module) {
        let data = {
            id: "adminService.getPageTreeList",
            params: { module }
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    setGradeList(param) {
        let data = {
            id: "adminService.setGradeList",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    addGrade(param) {
        let data = {
            id: "adminService.addGrade",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    deleteGrade(param) {
        let data = {
            id: "adminService.deleteGrade",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    changeGrade(param) {
        let data = {
            id: "adminService.changeGradeFromOneUser",
            params: param
        };
        return httpAPI.post(this.PATH, data).then(result => {
            return result.data.result;
        }, error => {
            console.log(error);
            return error;
        });
    },

    getUserMenu(param) {
        let data = {
            id: "adminService.getUserMenu",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    setUserMenu(param) {
        let data = {
            id: "adminService.setUserMenu",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            throw error;
        });
    },

    getLicenseInfo(module) {
        let data = {
            id: "adminService.getLicenseInfo",
            params: {module}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },
    getInstalledLicenseInfo() {
        let checkInstalledLicensePath = this._getFullPathName()+'/solutions/list';  
        return httpAPI.get(checkInstalledLicensePath)
    },

    setLicenseInfo(param) {
        let data = {
            id: "adminService.setLicenseInfo",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            throw error
        });
    },

    checkLicenseKey(param) {
        let data = {
            id: "adminService.checkLicenseKey",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            throw error
        });
    },

    changeLicense(param) {
        let data = {
            id: "adminService.changeLicense",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            throw error
        });
    },

    getPolicyInfo() {
        let data = {
            id: "adminService.getPolicyInfo",
            params: {}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    setPolicyInfo(param) {
        let data = {
            id: "adminService.setPolicyInfo",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.result;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getLoginHistory() {
        let data = {
            id: "adminService.getLoginHistory",
            params: {}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    validationPwdCheck(param) {
        let data = {
            id: "adminService.validationPwdCheck",
            params: param
        }

        return httpAPI.post(this.PATH, data).then((result) => {

            console.log(result);

            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });

    },
    setInitUserMenu(param) {
        let data = {
            id: "adminService.setInitUserMenu",
            params: param
        }

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            throw error;
        });
    },
    configInitInfo() {
        let data = {
            id: "configManageService.configInitInfo",
            params: {}
        };
        return httpAPI.post(this._getFullPathName() + "/config.do", data).then((result) => {

            console.log(result);

            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    initPw(param) {
        let data = {
            id: "adminService.initUserPwd",
            params: param
        }

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    unLockUser(param) {
        let data = {
            id: "adminService.unLockUser",
            params: param
        }

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getLogInfo() {
        let data = {
            id: "adminService.getLogInfo",
            params: {}
        }

        return httpAPI.post(this.PATH, data).then((result) => {
            console.log(result.data);
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getPackageInfo() {
        let data = {
            id: "adminService.getPackageInfo",
            params: {}
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    deletePack(info) {
        let data = {
            id: "componentInstallService.installProcess",
            params: {
                type: "uninstall",
                info: info
            }
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    uninstall() {
        let data = {
            id: "setupManageService.procUninstall",
            params: { }
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getGradeUserList(param) {
        let data = {
            id: "adminService.getGradeUserList",
            params: param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    getUserActionLogList(param) {

        let data = {
            id : "adminService.getUserActionLogList",
            params : param
        };

        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });

    },
    getFontList() {
        let data = {
            id: "adminService.getFontInfo",
            params: {}
        };
        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    addFont(param) {
        let data = {
            id: "adminService.addFont",
            params: {
                fontFaceInfo : param
            }
        };
        return httpAPI.post(this.PATH, data).then((result) => {
            return result;
        }, (error) => {
            console.log(error);
            return error;
        })
    },

    setFont(param) {
        let data = {
            id: "adminService.setFont",
            params: {
                newFont : param.newFont
            }
        };
        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    deleteFont(param) {
        let data = {
            id: "adminService.deleteFont",
            params: {
                deleteFont : param.deleteFont
            }
        };
        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            console.log(error);
            return error
        });
    },

    checkAdminUser({ pw }) {
        let data = {
            id: "adminService.checkAdminUser",
            params: {
              pw
            }
        };
        return httpAPI.post(this.PATH, data).then((result) => {
            return result.data;
        }, (error) => {
            
            console.log(error);
            return error
        });
    }
}
