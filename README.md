# Vue lite

## Useage

```html
<div id="app">
        <span>{{user.data}}</span>
        <input type="text" v-model="user.data">
        <div>{{user}}</div>
        <ul>
            <li>{{user.data +"hhahahha"}}</li>
        </ul>
        <ul>
            <li v-repeat="$item in users">
                {{$item + "~~hha $$$"}}
            </li>
        </ul>
        <ul>
            <li v-repeat="var (item ,key) in users1">
               My name is  {{item.name }}    ,Im  {{item.age}} years old....   {{key}}
            </li>
        </ul>
        <ul >
            <li v-repeat="(item) in  strs">{{item}}</li>
        </ul>
        <ul>
            <li v-repeat="(val ,key ) in objs">
                key {{key}}  value : {{val}}
            </li>
        </ul>
</div>
```

```js
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
```

## implements

Only two instructions(v-model,v-repeat) and parsing expressions are implemented in vue-lite.
diretive not allow nested  .
just to understand `Object.defineProperty` property.