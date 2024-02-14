import i18n from '../lang';
import * as constants from "./Constants"

interface solution {
   name:string;
   context_path:string
  }

export default class AdminUtil {

    /**
     * UUID 생성 함수
     * @returns {string}
     */
    public static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 비밀번호 validation 체크 함수
     * @param pw
     * @param config
     * @returns {boolean}
     */
    public static pwdValidationCheck(pw, config): boolean {



        // 1.특수문자 체크
        var chk_num = pw.search(/[0-9]/g);
        var chk_eng = pw.search(/[a-z]/ig);
        var chk_Special = pw.search(/[`~!@#$%^&*|\\\'\";:\/?]/gi);

        switch (config.PW_MIX) {
            case "C" :
                if (chk_eng = !-1 || chk_Special != -1) {
                    return false;
                }
                break;
            case "CN" :
                if (chk_Special != -1 || chk_num == -1 || chk_eng == -1) {
                    return false;
                }
                break;
            case "CNS" :
                if (chk_Special == -1 || chk_num == -1 || chk_eng == -1) {
                    return false;
                }
                break;
        }

        // 2. 공백 체크
        if (pw.indexOf(" ") > -1) {
            return false;
        }

        // 3. 자리수 체크
        if (pw.length < config.PW_LENGTH) {
            return false;
        }

        // 4. 비밀번호 연속성 체크
        if (config.PW_CONTI == "N") {

            var oPw = pw;

            var samePw = 0;
            var conPwMinu = 0;
            var conPwPlus = 0;

            var comparePw;
            var comparePw_;
            var comparePw_con;

            for (var i = 0; i < oPw.length; i++) {

                comparePw = oPw.charAt(i);
                comparePw_ = oPw.charAt(i + 1);
                comparePw_con = oPw.charAt(i + 2);

                //연속성(+) 카운트
                if (comparePw.charCodeAt(0) - comparePw_.charCodeAt(0) == 1 && comparePw_.charCodeAt(0) - comparePw_con.charCodeAt(0) == 1) {
                    conPwMinu++;
                }

                //연속성(-) 카운트
                if (comparePw.charCodeAt(0) - comparePw_.charCodeAt(0) == -1 && comparePw_.charCodeAt(0) - comparePw_con.charCodeAt(0) == -1) {
                    conPwPlus++;
                }
            }

            if (conPwMinu > 0 || conPwPlus > 0) {
                return false;
            }

            if (samePw > 1) {
                return false;
            }
        }

        return true;

    }


    /**
     * 패스워드 유효성 검사시 코드값 > msg 컨버팅 메소드
     *
     * data = {
     *      "config_id" : 비밀번호 정책 ID
     *      "value"     : 비밀번호 정책 값
     * }
     * @param data
     */
    public static convertPwdCode(data): string {
        let msg:string = "";
        let config_id: string = data.config_id;
        let value: string = data.value;
        const locale:any = i18n.messages.wv.policy;

        switch (config_id) {
            case "PW_LENGTH" :
                msg = `${locale.pwLength1} ${value} ${locale.pwLength2}`;
                break;
            case "PW_MIX" :
                switch(value) {
                    case "CN" :
                        msg = locale.pwMixCN;
                        break;

                    case "CNS":
                        msg = locale.pwMixCNS;
                        break;
                }
                break;
            case "PW_CONTI" :
                msg = locale.pwConti;
                break;
            case "PW_SIMILAR" :
                msg = locale.pwSimilar;
                break;
            case "PW_RECENT" :
                msg = locale.pwRecent;
                break;
            case "PW_CURRENT" :
                msg = locale.pwCurrent;
                break;
            case "PW_EQUAL_CURRENT" :
                msg = locale.pwEqualCurrent;
                break;
            case "PW_REQ_INVALID":
                msg = locale.pwReqInvalid;
                break;
            default :
                msg = locale.pwError;
        }

        return msg;
    }

    public static isValidUrl(url): boolean {
        const res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return res !== null;
    }

    public static getCurrentMonthLastDate() {
        const date = new Date();
        return this.getLastDate(date.getFullYear(), date.getMonth() + 2);
      };

      public static getNextMonthLastDate() {
        const date = new Date();
        return this.getLastDate(date.getFullYear(), date.getMonth() + 3);
    };

    public static getLastDate(year: number, month: number) {
        const newDate = new Date();
        newDate.setDate(1);
        newDate.setFullYear(year);
        newDate.setMonth(month - 1);
        newDate.setDate(0);
        return this.getFormatDate(newDate);
    };

    public static getFormatDate(date: Date) {
        return date.getFullYear() + '-' + this.padStart(String(date.getMonth() + 1), 2, '0') + '-' + this.padStart(String(date.getDate()), 2, '0');
    };

    public static padStart(str: string, maxLength: number, fillString: string) {
        if (str.length >= maxLength) {
            return str;
        }

        return new Array(maxLength - str.length).fill(fillString).join('') + str;
    };

    public static saveSessionStorageData(solutions:Array<solution> = []) {
        let pnidInstalled, renobitInstalled;
        sessionStorage.removeItem(constants.PNID_CHECK_STORAGE_KEY)
        sessionStorage.removeItem(constants.PNID_CONTEXT_STORAGE_KEY)
        sessionStorage.removeItem(constants.RENOBIT_CHECK_STORAGE_KEY)
        sessionStorage.removeItem(constants.RENOBIT_CONTEXT_STORAGE_KEY)
        solutions.forEach(solution => {
            if (solution && solution.name === constants.PNID) {
                let name = solution.name,
                context_path = solution.context_path ? solution.context_path : constants.PNID_DEFAULT_CONTEXT_PATH
                sessionStorage.setItem(constants.PNID_CHECK_STORAGE_KEY, name)
                sessionStorage.setItem(constants.PNID_CONTEXT_STORAGE_KEY, context_path)
                pnidInstalled = name;
            }
            if (solution && solution.name === constants.RENOBIT) {
                let name = solution.name,
                context_path = solution.context_path ? solution.context_path : constants.RENOBIT_DEFAULT_CONTEXT_PATH
                sessionStorage.setItem(constants.RENOBIT_CHECK_STORAGE_KEY, name)
                sessionStorage.setItem(constants.RENOBIT_CONTEXT_STORAGE_KEY, context_path)
                renobitInstalled = name;
            }
        })
        return { pnidInstalled, renobitInstalled }
    }

    public static redirectToSolution(module) {
        const redirectToManager = './login.do'
        if (!module) return location.href = redirectToManager

        const context = module === constants.RENOBIT ? 
            `${sessionStorage.getItem(constants.RENOBIT_CONTEXT_STORAGE_KEY)}/login.do` : 
            sessionStorage.getItem(constants.PNID_CONTEXT_STORAGE_KEY)

        location.href = `${location.origin}${context}`
    }
}

