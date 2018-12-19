/**
 * @Vue lite
 * @author github.com/lucky51
 * @date 2018-09-09 
 */

//evevt subscriber
let Subscriber = function (callback, execlines){
    this.func = callback;
    this.lines = execlines;
}
Subscriber.prototype={
    constructor:Subscriber,
    line :function () {
        var gen; var args = arguments;
        if (arguments.length === 0) return;
        else {
            gen = function* () {
                for (let index = 0; index < args.length; index++) {
                    const element = args[index];
                    if (typeof element === 'function') {
                        if (index === args.length - 1) return yield element;
                        else {
                            var val = yield element;
                        }
                    };
                }
            }
        }
        return function () {
            var initdata = null;
            if (arguments.length === 1) {
                initdata = arguments[0];
            }
            return async function (callback) {
                var gfun = gen();
                var result;
                try {
                    while (!((result = gfun.next()).done)) {
                        var nx = result.value;
                        if (typeof nx === 'function') {
                            var backrs = nx(initdata);
                            if (backrs['then']) {
                                initdata = await backrs;
                            } else {
                                initdata = backrs;
                            }
                        }
                    }
                    callback(initdata);
                } catch (error) {
                    callback(error);
                }
            }
        }
    },
    update(val){ 
        if(this.lines){
            this.line(...this.lines)(val)((result)=>{       
                this.func(result);
            });
        }else{
            this.func(val);
        }           
    }
}
//event publisher
let Publisher = function(){
    this.subs = [];
}
Publisher.prototype={
    constructor:Publisher,
    notify(val){
        this.subs.forEach((item,idx,arr)=>{
            item.update(val);
        });
    },
    addSub(sub){
        this.subs.push(sub);
    }
}
/**
 * Vuelite constructor
 * @param {*} opts 
 */
let VueLite = function(opts){
    this.taget = null;
    this._data = opts["data"];
    this._directives ={
        "v-model":(el,data,exp)=>{
            el.value = this.execExp2(exp, data, function () {
                data.taget = new Subscriber(function (newVal) {
                    el.value = newVal;
            },
            [
                function (newVal2) {
                    return data.execExp2(exp, data);
                }
            ]);
            },
            function () {
                data.taget = null;
            });
            el.addEventListener("keyup",(event)=>{
                this.setExpData(event.target.value, data, exp);
            });
            // add watcher
            return false;
        },
        "v-repeat": (el, data, exp) => {
            //resolve exp    old /^(var\s+)?\s*(\(\s*[_a-zA-Z]+[_a-zA-Z0-9]*\s*\,\s*[_a-zA-Z]+[_a-zA-Z0-9]*\s*\))*?\s+in\s+[\S\s]+/
            //xx in arry cloneNode      
            if (/^(var)?\s*[_$a-zA-Z]+[_$a-zA-Z0-9]*\s+in\s+[\S\s]+/.test(exp) ||
             /^(var\s+)?\s*\((\s*[_$a-zA-Z]+[_$a-zA-Z0-9]*\s*\,\s*)*\s*[_$a-zA-Z]+[_$a-zA-Z0-9]*\s*\)\s+in\s+[\S\s]+/g.test(exp)) {
                var param1, param2,exp;
                if (exp.indexOf('(') > -1) {
                    var splt = exp.split('in');
                    var lr = splt[0].replace(/[\s\(\)]/g, '').replace(/var/,'');
                    if(lr.indexOf(',')>-1){
                        var lrarr =lr.split(',');
                        param1 = lrarr[0];
                        param2 = lrarr[1];    
                    }else{
                        param1 =lr
                    }
                    exp = splt[1].replace(/[\s]/g,'');                 
                }else{
                    var result = this.split(exp, ' ');
                    param1 = result[0], exp = result[result.length - 1];

                    if (result[0] === ('var')) {
                        param1 = result[1];
                    }
                }
                var resolveData = this.execExp2(exp, this),counter=0;
                if (typeof resolveData !== "object" && typeof resolveData !== 'string') throw 'data type is not iterable';
                var temp = el.cloneNode(true);
                    for (let index in resolveData) {
                       
                        let element = resolveData[index];
                        if (typeof resolveData === 'object' && !Array.isArray(resolveData)){
                            if(!resolveData.hasOwnProperty(index))continue;
                        }
                        var tmpele = temp.cloneNode(true);
                        this.findChildNode(tmpele, (sub) => {
                            var res = this.getExpMustache(sub.textContent, (txt, content) => {
                                var tmpresult = (new Function(param1, param2, `return ${content};`)).call(this, element, index);
                               
                                return tmpresult;
                            })
                            sub.textContent = res;
                        });
                        if (counter === 0) {
                            this.replaceElement(tmpele, el);
                            el = tmpele;
                        } else {
                            this.insertAfter(tmpele, el);
                            el = tmpele;
                        }
                        counter++;
                    }    
            }
        }
    
    };   
    this.$el =  this.toDom(opts.el);
    this.toObserve(this._data);
    this.bindtoSelf(this._data);
    this.replaceExp(this,this.$el);   
}
VueLite.Global={
}

VueLite.prototype={
    constructor:VueLite,
    split:(str,chr,opts)=>{
        var arr = String.prototype.split.call(str,chr);
        return arr.filter((item)=>{
            return item!==' ';
        });
    },
    replaceElement:(newEl,targetEl)=>{
        targetEl.parentNode.replaceChild(newEl, targetEl);
    },
    insertAfter: (newEl, targetEl)=>{
        var parentEl = targetEl.parentNode;

        if (parentEl.lastChild == targetEl) {
            parentEl.appendChild(newEl);
        } else {
            parentEl.insertBefore(newEl, targetEl.nextSibling);
        }
    },
    bindDirectives(attrs,elem){
        var obj = {};
        var isExist = false;
         Array.prototype.map.call(attrs ,(item)=>{
            var tmp ={};
            tmp[item.nodeName] = item.value ;
            Object.assign(obj, tmp);
            return tmp;
        });
        for (const item in obj) {
            obj.hasOwnProperty(item) && 
            (function(vm){
                return (isExist =vm._directives.hasOwnProperty(item));
            }(this)) &&
             this._directives[item](elem, this, obj[item])
        }
        return isExist;
    },
    setExpData(val ,data ,exp){
        if(val ===undefined) throw TypeError("val type error.");
        var expclips = exp.split('.');
        var value = data;
        for (const key in expclips) {         
            var tmp = value[expclips[key]];         
            if (typeof value === 'object' && tmp === undefined) throw `resolve error. ${key} => ${expclips[key]}`;
            if (tmp === undefined) {
                value[expclips[key]] = val;
                break;
            };
            if (typeof tmp !== 'object') {
                value[expclips[key]] = val;
                value = tmp;
                
                break;
            }
            else {
                value = tmp;
            }
        }
        return value;
    },
    resolveDynamicExp(){

    },
    execExp2(exp,data,callback1,callback2){
        var resolveExp = new Function(`with(this){return ${exp};}`);
        callback1 &&callback1();
        var result = resolveExp.call(data);
        callback2 && callback2();
        return result;
    },
    execExp(exp,data,callback1,callback2){
        var expclips =exp.split('.');
        var value = data;
        for (const key in expclips) {
            callback1&&callback1();
            var tmp =value[expclips[key]];
            callback2&& callback2();
            if (typeof value==='object' && tmp===undefined) throw `resolve error. ${key} => ${expclips[key]}`;
            if(tmp===undefined) break;           
            if(typeof tmp !=='object'){
                value = tmp;
                break;
            }
            else{
                value = tmp;
            }
        }
        return value;
    },
    //get  mustache expression
    getExpMustache(txt,callback){
        let reg = /\{\{(.*?)\}\}/g;
        var expresult = [];
        return txt.replace(reg, (exp1, expcontent, idx) => {
            expresult.push([exp1, expcontent]);          
            return callback(exp1,expcontent);
        });
    },
    getExpValue(node,prop,txt, data){
        let result ;
        let regarr=[];
        this.getExpMustache(txt, (mus,content)=>{
            let value = this.execExp2(content, data, () => {
                this.taget = new Subscriber( (newVal)=> {
                    node[prop] = this.execExp2(content,data) ;
                });
            }, () => {
                this.taget = null;
            });
            regarr.push([value, mus]);
        });                                                                                                         
        if(regarr.length>0){
            result = txt;
            for (const item of regarr) {
                result =  String.prototype.replace.call(result,item[1],item[0])
            }
        } 
        return result;
    },
    findChildNode(parent, callbackMustache,callbackAttribute){
        
        if (!parent.childNodes) return;
        Array.from(parent.childNodes).forEach((ele, idx, arr) => {
            //text node
            if (ele.nodeType === 3) {
                
                callbackMustache&& callbackMustache(ele);
               
            } // element node 
            else if (ele.nodeType === 1) {
              var isnext =   ele.attributes.length > 0 && callbackAttribute && callbackAttribute(ele, ele.attributes) ;
              if(!isnext){
                  this.replaceExp(this, ele);
              }             
            }
        });      
    }
    ,
    replaceExp(vm,el){
        this.findChildNode(el,(ele)=>{
            var regresult = this.getExpValue(ele, "textContent", ele.textContent, vm._data);
            if (regresult) {
                ele.textContent = regresult;
            }    
        },
        (ele,attrs)=>{
            return  this.bindDirectives(attrs, ele);
        }); 
    },
    toDom(sel){
        return document.querySelector(sel);
    },
    toObserve(data){
        let self = this;
        for (const key in data) {
            if(typeof data!=='object')return;
            var _publisher = new Publisher();
            if (data.hasOwnProperty(key)) {
                let element = data[key];
                Object.defineProperty(data,key,{
                    enumerable:true,
                    configurable:true,
                    get(){
                        if(self.taget !==null){
                            _publisher.addSub(self.taget);
                        }
                        return element;
                    },
                    set(newVal){
                        element = newVal;
                        _publisher.notify(newVal);
                       
                    }
                });
                if(typeof element ==='object' && Object.prototype.toString.call(element)==='[object Object]'){
                    this.toObserve(element);          
                }
            }
        }
    },
    bindtoSelf(taget){
        for (const item in taget) {
            if (taget.hasOwnProperty(item)) {
                const element = taget[item];
                Object.defineProperty(this,item,{
                    configurable:true,
                    enumerable:true,
                    get(){
                        return element;
                    },
                    set(newVal){
                        taget[item] = newVal;
                    }
                })
            }
        }
    }
}


