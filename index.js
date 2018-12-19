

let app = new VueLite({
    el:'#app',
    data:{
        user:{
            data:123
        },
        users:[
           "1.hello","2.how are you?","3.haha"
        ],
        users1:[
            {name:"wangwu",age:1},
            { name: "zhangsan", age: 12 },
            { name: "lisi", age: 13 }
        ],
        strs:"hello,Im string",
        objs:{
            name:"hello ,Im object",
            age:22
        }
    }
});


console.log(app);
