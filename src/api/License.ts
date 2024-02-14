import httpAPI from "axios";

export default {
    PATH: "",
    _getContext() {
        let pathName = location.pathname;

        //pathName에 '/' (슬래쉬) 가 한 개만 들어가면 Context가 Root임
        let isContextRoot = pathName.match(/\//ig).length === 1;

        if (isContextRoot) {
            pathName = ""
        } else {
            pathName = pathName.split("/")[1];
            pathName = "/" + pathName;
        }

        return pathName;
    },
    _getFullPathName() {
        return location.origin + this._getContext();
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
            return error
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
            return error
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
}
