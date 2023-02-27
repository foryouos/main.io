# 瓶子的跋涉

#### 主页的网站思路

* 是根据抖音主页，将较少的主页内容后面加入视频画面。
* 《你的名字》剪辑背景
* 通过`超星尔雅云盘`，找到视频地址进行存储，目前运行两年较为稳定，但图片有防盗链不行
* 通过圆形图标呈现各个GitHub项目的名称以及logo

**** 注意问题:

* 如何将视频右键出现“控件组件”，视频另存为，视频下载等情况。即在网页取消鼠标右键的功能：

将视频放在div下，即才可以取消下面的播放操作。 
```HTML
 <div>
    <video muted data-autoplay loop="loop" src="" autoplay="autoplay" class="video-bg" id="sound" controlsList="nodownload" oncontextmenu="return false;">你的浏览器不支持视频</video>
 </div>
 ```
 * autoplay为自动播放。
 * controlslist="nodownload"  取消下载播放的视频下载操作
 * oncontextmenu="return false"  此操作为取消页面的右键操作

#### QQ空间防盗链
```HTML
 <meta name="referrer" content="never">
```
