declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

// 1. 'vue'를 보충된 타입 선언 전에 import해야 합니다.
import {VueRouter} from "vue-router/types/router";
import {Route} from "vue-router";

// 2. 보충하고자 하는 타입이 있는 파일을 지정하세요.
//    Vue의 constructor type은 types/vue.d.ts에 있습니다.
declare module 'vue/types/vue' {
	// 3. Vue에 보강할 내용을 선언하세요.

	interface VueConstructor {
		$loading: any;
		$msgbox:any;
		$alert:any;
		$confirm:any;
		$notify:any;
		$message:any;
		$router: VueRouter;
		$route:Route;
	}
}

declare module 'vue/types/vue' {
	interface Vue {

	}
}
