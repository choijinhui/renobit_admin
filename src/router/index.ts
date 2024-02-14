import { MessageBoxInputData } from 'element-ui/types/message-box'
import Vue from 'vue'
import Router from 'vue-router'
import AdminMainComponent from "../components/AdminMainComponent"
import LicenseChangePage from "../components/LicenseChangePage"
import PasswordChangePage from "../components/PasswordChangePage"
const Admin = () => import('../api/Admin')
const ElementUI  = () => import('element-ui')
const Store = () =>  import( "../store/index.js")

Vue.use(Router);




const checkPassword = async (to, from , next) => {
    if (window['error'] == "LICENSE_EXPIRED" || window['error'] == "INIT_PW_CHANGE" ) { return next() }
    const [ elementUi, store, adminApi ] = await Promise.all([ElementUI(), Store(), Admin()])

    const policyInfo = await adminApi.default.getPolicyInfo().catch(console.error)
    const userConfigInfo = await adminApi.default.configInitInfo().catch(console.error)
    const adminPolicy = policyInfo && policyInfo.find((policy) => policy.config_id == 'ADMIN_AUTH')

    const managerLoginCookie = document.cookie.split(';').find(cookie => cookie.includes('manager_login'))
    const managerLoginCookieArray = managerLoginCookie ? managerLoginCookie.split('=') : []
    const passOrNot = managerLoginCookieArray[1]
    document.cookie = `manager_login=; Path=${adminApi.default._getContext()}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`

    const passCondition = [(adminPolicy && adminPolicy.value == 'N'), passOrNot == 'true'].some(condition => condition)
    if (!(userConfigInfo && userConfigInfo['user_id']) || passCondition) return next()
    
    const { value } =  await elementUi.MessageBox.prompt(`User : ${userConfigInfo['user_id']}`,'Enter user password', {
        closeOnPressEscape:false,
        showCancelButton:false,
        confirmButtonText: 'OK',
        showClose:false,
        inputType:'password',
        closeOnClickModal:false
    }) as MessageBoxInputData

    const handlingError = (error, fn) => {
        elementUi.MessageBox.alert(`${error}`,'Wrong', {
            type: 'error',
            confirmButtonText: 'OK',
            callback: () => fn()
        }) 
    }

    store.default.dispatch("checkAuth", { password: value }).
    then(() => {
        store.default.getters.isAuthenticated ? next() :  handlingError('Wrong Password', () => checkPassword(to, from ,next))
    })
    .catch(err => {
        handlingError(`${err}`, () => checkPassword(to, from ,next))
    })
}




const router = new Router({
    routes: [
        {
            path: '/',
            name: 'AdminMainComponent',
            component: AdminMainComponent,
            beforeEnter:checkPassword
        },
        {
            path: "/licenseChange",
            name: 'LicenseChangePage',
            component: LicenseChangePage,
            props: function(route) {
                return {
                    module: route.query.module
                }
            }
        }, {
            path: "/passwordChangePage",
            name: 'PasswordChangePage',
            component: PasswordChangePage,
            props: {
                user_id: ""
            }
        }
    ]
})

export default router
