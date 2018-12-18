

let app = new VueLite({
    el:'#app',
    data:{
        user:{
            data:123
        },
        users:[
           "1.你好","2.好么","3.哈哈" ,"4.没错我是数组"
        ],
        users1:[
            {name:"wangwu",age:1},
            { name: "zhangsan", age: 12 },
            { name: "lisi", age: 13 }
        ],
        strs:"hello, Im string ",
        objs:{
            name:"hello ,Im  object",
            age:22
        }
    }
});


console.log(app);
