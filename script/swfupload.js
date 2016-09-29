
/*By Xuwx Add*/

//初始化 SWFUploader 
/*
参数说明：
id - 加载组建上传按钮
viewId -显示预览图的元素Id
hid-接收上传成功的图片完整地址
*/
var InitSWFUploader = function (id, viewId, hid,imgSize) {
    $(id).uploadify({
        //开启调试
        'debug': false,
        //是否自动上传
        'auto': true,
        'buttonText': '选择照片',
        //flash
        'swf': "../Js/SWFUpload/script/uploadify.swf",
        //文件选择后的容器ID
        'queueID': 'uploadfileQueue2',
        'uploader': '../Js/SWFUpload/handler/upload.ashx',
        'width': '75',
        'height': '24',
        'multi': true,
        'fileTypeDesc': '支持的格式：',
        'fileTypeExts': '*.jpg;*.png',
        'fileSizeLimit': (imgSize == undefined || imgSize === "") ? '0.5MB' : imgSize,
        'removeTimeout': 1,
        //返回一个错误，选择文件的时候触发
        'onSelectError': function (file, errorCode) {
            switch (errorCode) {
                case -100:
                    alert("上传的文件数量已经超出系统限制的" + $(id).uploadify('settings', 'queueSizeLimit') + "个文件！");
                    break;
                case -110:
                    alert("文件 [" + file.name + "] 大小超出系统限制的" + $(id).uploadify('settings', 'fileSizeLimit') + "大小！");
                    break;
                case -120:
                    alert("文件 [" + file.name + "] 大小异常！");
                    break;
                case -130:
                    alert("文件 [" + file.name + "] 类型不正确！");
                    break;
            }
        },
        //检测FLASH失败调用
        'onFallback': function () {
            alert("您未安装FLASH控件，无法上传图片！请安装FLASH控件后再试。");
        },
        //上传到服务器，服务器返回相应信息到data里
        'onUploadSuccess': function (file, data) {
            data = JSON.parse(data);

            switch (data.code) {
                case true:
                    //如果需要即时预览请传标签ID 如 span or div
                    if (viewId != undefined && viewId !== "") {
                        $(viewId).empty();
                        $(viewId).html("<img style='width:80px;height:80px;' src='" + data.fileUrl + "'/><br/>");
                    }
                    //赋值回传给前台hidden值
                    if (hid != undefined && hid !== "") {
                        $(hid).val(data.fileUrl);
                    }
                    break;
                case false:
                    //api 返回错误信息处理

                    if (data.message.indexOf("NameDuplicated") > 0)
                        alert("已存在相同名称的文件名！");
                    else {
                        alert(data.message);
                    }
                    break;
            }
        }
    });
}



/*
    上传控件，不自动上传
*/
var InitSWFUploaderNoAuto = function (id, viewId, hid, imgSize) {
    $(id).uploadify({
        //开启调试
        'debug': false,
        //是否自动上传
        'auto': true,
        'buttonText': '选择照片',
        //flash
        'swf': "../Js/SWFUpload/script/uploadify.swf",
        //文件选择后的容器ID
        'queueID': 'uploadfileQueue2',
        'uploader': '../Js/SWFUpload/handler/LoadUpload.ashx',
        'width': '75',
        'height': '24',
        'multi': true,
        'fileTypeDesc': '支持的格式：',
        'fileTypeExts': '*.jpeg;*.png,',
        'fileSizeLimit': (imgSize == undefined || imgSize === "") ? '0.5MB' : imgSize,
        'removeTimeout': 1,

        //返回一个错误，选择文件的时候触发
        'onSelectError': function (file, errorCode) {
            switch (errorCode) {
                case -100:
                    alert("上传的文件数量已经超出系统限制的" + $(id).uploadify('settings', 'queueSizeLimit') + "个文件！");
                    break;
                case -110:
                    alert("文件 [" + file.name + "] 大小超出系统限制的" + $(id).uploadify('settings', 'fileSizeLimit') + "大小！");
                    break;
                case -120:
                    alert("文件 [" + file.name + "] 大小异常！");
                    break;
                case -130:
                    alert("文件 [" + file.name + "] 类型不正确！");
                    break;
            }
        },
        //检测FLASH失败调用
        'onFallback': function () {
            alert("您未安装FLASH控件，无法上传图片！请安装FLASH控件后再试。");
        },
        //上传到服务器，服务器返回相应信息到data里
        'onUploadSuccess': function (file, data) {
            data = JSON.parse(data);

            switch (data.code) {
                case true:
                    //如果需要即时预览请传标签ID 如 span or div
                    if (viewId != undefined && viewId !== "") {
                        $(viewId).empty();
                        $(viewId).html("<img style='width:80px;height:80px;' src='" + data.fileUrl + "'/><br/>");
                    }
                    //赋值回传给前台hidden值
                    if (hid != undefined && hid !== "") {
                        $(hid).val(data.fileUrl);
                    }
                    break;
                case false:
                    //api 返回错误信息处理

                    if (data.message.indexOf("NameDuplicated") > 0)
                        alert("已存在相同名称的文件名！");
                    else {
                        alert(data.message);
                    }
                    break;
            }
        }
    });
}