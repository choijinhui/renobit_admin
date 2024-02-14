interface JQuery {
    nestable():void;
    nestable(any:any):any;
    nestable(str:string):any;
    nestable(str:string, param:any):void;
}

declare var encrypt:(text:string)=>string;
