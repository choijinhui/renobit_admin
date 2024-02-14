import Vue from 'vue';
import Router from 'vue-router';
import AdminMainComponent from "../components/AdminMainComponent";
import LicenseChangePage from "../components/LicenseChangePage";
import PasswordChangePage from "../components/PasswordChangePage";
Vue.use(Router);
export default new Router({
    routes: [
        {
            path: '/',
            name: 'AdminMainComponent',
            component: AdminMainComponent
        }, {
            path: "/licenseChange",
            name: 'LicenseChangePage',
            component: LicenseChangePage
        }, {
            path: "/passwordChangePage",
            name: 'PasswordChangePage',
            component: PasswordChangePage,
            props: {
                user_id: ""
            }
        }
    ]
});
//# sourceMappingURL=index.js.map