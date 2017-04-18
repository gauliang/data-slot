# data-slot
Load component from remote html page and append it in current page.

---

为提高协同开发效率，降低页面维护成本，开发 data-slot 组件。

data-slot 旨在解决下列问题：

1. 重复造轮子的问题
1. 多人协同开发中遇到的公共资源管理问题
1. 网站呈现风格上细节不一致问题

## 特性
1. 加载远程组件
1. 跨域加载
1. 反向注入
1. 脚本分发
1. 样式分发
1. 组件内容替换
1. 组件嵌套

## 文件结构
1. local/data-slot.js  
    加载完成后，会在 window 上注册 DataSlot 对象。

1. local/client.html  
    预置了 data-slot 插槽的页面    

1. remote/data-slot-proxy.js  
    服务器端，用以代理跨域请求的模块

1. remote/datasource.html  
    存储组件资源

1. remote/data-slot-style.css  
    存储组件资源的 CSS 样式

1. remote/ui.html  
    打印远程组件清单


## 使用说明

安装部署 data-slot 包含两个部分。

### 1. 服务器端部署

1. 创建组件资源文件 datasource.html 文件
1. 在 datasource.html `head` 中引入 data-slot-style.css 
1. 在 datasource.html `head` 中引入 data-slot-proxy.js 
1. 在 datasource.html 'body' 的结束前，插入下面代码
    ```javascript
    <script>
        var proxy = new DataSlotProxy();
        proxy.init();
    </script>
    ```
1. 将上述文件发布到服务器

### 2. 本地部署
1. 页面中个引用 data-slot.js 
    ```javascript
    <script src="scripts/data-slot.js"></script>
    ```
1. 初始化 DataSlot
    ```javascript
    var option = {
        url: {
            web: 'http://example.app/datasource.html',
            local: 'http://localhost/datasource.html'
        }
    }
    var callback = function(){}
    var slot = new DataSlot(option,callback);
    ```

1. DataSlot options  
    1. url      
        * local: 组件库的预览地址
        * web: 组件库发布后的地址

        组件库具备跨域加载资源的能力，无论是local或web均可正常加载。  
        但由于web地址需待页面发布完成后才生效，所以一般把local配置为资源库的预览地址。
        
    1. remotePath  
        针对翔宇系统，若当前页面的发布规则与组件库的发布规则不是同一个，那么组件库中的所有相对链接均不能直接在当前页面使用。所以在组件插入到页面之前要先进性路径转换， remotePath 参数用来配置 组件库页面发布规则中指定的目录名称。

1. 加载远程组件
    ```markup
    <div data-slot="component"></div>
    ```

### 声明组件
本质上，组件库是一个包含多个指定格式代码片段的集合，以 html 文件的形式存放在服务器上，每个代码片段就是一个组件。

**1. 声明组件**  
通过 html 注释的形式声明组件，格式为`标记:组件名称`，标记说明如下：

| 注释标记 | 说明 |
| --- | --- |
| CS | 组件开始 #component-start |
| CE | 组件开始 #component-end |

下面声明了名为 focus 的 data-slot 组件：

```markup
<!--CS:focus-->
<div class="focus">
    <div class="viewport">
        <ul><li><img src="..."></li></ul>
    </div>
</div>
<!--CE:focus-->
```

注意：`CS` 和 `CE` 是大小写敏感的，所有组件必须放到组件库文件的 `<body>` 与 `</body>` 之间。

**2. 反向注入**

有时候，我们需要把 client 面上的内容反向注入到组件中。这个可以通过在组件中声明 `region` 实现。

`region` 本质上是一个 html 注释，其标记了位置和名称信息，格式为`region:name`，其标记的是一个位置信息，所以无需像标记组件那样设置结束标记，这里采用 html 的自闭合语法。

为上面的 focus 组件声明 region 信息，代码如下：

```markup
<!--CS:focus-->
<div class="focus">
    <div class="viewport">
        <ul><li><img src="..."></li></ul>
    </div>
    <!--region:navigation/-->
</div>
<!--CE:focus-->
```

上例中，我们在focus组件中添加名为 navigation 的 region。在该组件被渲染时，会尝试将页面中的 navigation 内容填充到 region 所在位置。

说明：如果页面渲染时，没有找到关于 region 的数据，则 region 不会被处理。


### 加载组件库中的组件到当前页面

加载组件库的组件到当前页面，须先在页面中定义 `slot`。slot 是装载 data-slot 组件的容器，页面渲染时 slot 指定的内容将会插入到容器中。

通过为 HTML 元素添加自定义属性 `data-slot` 声明 `slot` 容器，`data-slot` 属性值指定要装载的组件的名字。

通过 `data-slot` 属性可以把页面中的任何元素声明为 data-slot 组件容器。

```markup
<div data-slot="focus"></div>
```

**反向注入**

要从当前页面向组件中注入内容，首先需要在当前 slot 中定义将来要注入到组件中的代码片段。`region` 本质上是一个 html 注释，其标记了位置和名称信息，格式为`region:name`，由于是标记代码片段，所以要有始有终。格式如下：

```markup
<!--region:name-->content<!--/region:name-->
```

上例中定义了一个名称为 name 的 region，其内容是 content。

## 使用案例

加载组件库中的 focus 组件到当前页面：

组件代码
```markup
<!--CS:focus-->
<div class="focus">
    <!--region:nextpage/-->
    <div class="viewport">
        <ul><li><img src="..."></li></ul>
        <ul><li><img src="..."></li></ul>
    </div>
    <!--region:navigation/-->
</div>
<!--CE:focus-->
```

模板代码
```markup
<div data-slot="focus">
    <!--region:navigation-->
    <ul><li></li><li></li></ul>
    <!--/region:navigation-->
</div>
```

渲染结果
```markup
<div data-slot="focus">
    <div class="focus">
        <!--region:nextpage/-->
        <div class="viewport">
            <ul><li><img src="..."></li></ul>
            <ul><li><img src="..."></li></ul>
        </div>
        <!--region:navigation-->
        <ul><li></li><li></li></ul>
        <!--/region:navigation-->
    </div>
</div>
```

## MIT License

Copyright (c) 2017 Gau Liang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
