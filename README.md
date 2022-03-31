# uirunner-web-recoder

本项目为chrome插件项目  
使用vue-cli-plugin-chrome-extension-cli开发

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run build-watch
```

### Compiles and minifies for production

```
npm run build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

```
打包插件的时候修改background.js中的host来确保提交内容地址正确  
localStage.setItem("recording","true")可以开启定位元素 
localStage.setItem("recording","false")可以关闭定位元素      
localStage.setItem("dockerName","xxxx")设置上报接口数据  
直接点击插件Icon也可以开启定位元素,单不会上报便于调试
```  