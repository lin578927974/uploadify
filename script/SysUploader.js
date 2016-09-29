/*
    已uploadify为基础的封装一个通用的图片上传    
    PROID:商品id,编辑商品是传入，如果不为空显示商品缩略图（这样的方式并不好，暂时也没想到好的方法。）


    调用实例：在页面加入如下模块，引入相应的js就可以了，uploadifyUploader要指定宽高，这边的宽高作为上传控件的宽高
    Id:uploadifyUploader 不可修改
    如果不需要显示缩略图的话不需要添加ul元素，其中class="filelist"不可修改
    ul里的li元素自定义添加按照如下格式：
    <li class='file_li'><div class='imgBox'><img  src='../js/SWFUpload/css/addimg_bg.png' style='width:150px;height:150px;'></div></li>

    隐藏域可以自定义，但是必须添加class="hdnFile"表示。尽量使用input元素
    <div id="uploadifyUploader" style="height: 30px; width: 204px;">
        <span id="uploadBtn" class="uploadBtn"></span>
        <ul class="filelist"></ul>
        <input type="hidden"  class="hdnFile" id="hidNewFileName" />
    </div>

    学习百度的上传控件，弄的一下，没有百度那么好的逼格。。。
*/
(function ($) {
    $(function () {

        var $wrap = $('#uploadifyUploader'),

            $uploader = $wrap.find('#uploadBtn'),

            //图片容器(缩略图返回)
            $queue = $wrap.find('.filelist'),

            //上传图片总数
            $queueSizeLimit = 1;

        //获取上传图片的控件id
        var $uploaderId = $uploader.attr('id');

        //如果没有找到就添加一个默认的图片
        if ($queue.find('li').length == 0) {
            $('<li id="baseLi" class="file_li"><div class="imgBox"><img  src="../js/SWFUpload/css/addimg_bg.png" ></div></li>').appendTo($queue);
        }


        //判断是否有隐藏域，没有默认一个
        if ($wrap.find('.hdnFile').length == 0) {
            $('<input type="hidden" class="hdnFile"  id="hdnFile" />').appendTo($wrap);
        }

        var $hdnFile = $wrap.find('.hdnFile');

        //添加删除图片按钮
        function addDeleteBtn() {
            $queue.find("li").each(function () {
                var $btns = $('<div class="file-panel">' +
                    '<span class="cancel">删除</span></div>').appendTo($(this));

                $(this).on('mouseenter', function () {
                    $btns.stop().animate({ height: 30 });
                });

                $(this).on('mouseleave', function () {
                    $btns.stop().animate({ height: 0 });
                });

                $btns.on('click', 'span', function () {
                    var index = $(this).index();
                    switch (index) {
                        case 0:
                            $queue.empty();
                            var str = "<li class='file_li'><div class='imgBox'><img  src='../js/SWFUpload/css/addimg_bg.png' style='width:150px;height:150px;'></div></li>";
                            $queue.append(str);
                            $hdnFile.val("");
                            return;
                    }
                });
            });
        };

        //返回缩略图保存到图片容器中,参数必须是一个完整的图片路径
        function addFile(fileUrl) {
            //if (ISSHOWIMG) { //如果不用显示缩略图就跳过
                $("baseLi").remove();
                if ($queueSizeLimit == 1) {
                    //如果限制上传一张的话，缩略图返回直接覆盖
                    $queue.empty();
                }
                var $li = "<li class='file_li'><div class='imgBox'><img  src='" + fileUrl + "' style='width:150px;height:150px;'></div></li>";
                $(".filelist").append($li);
                //$li.appendTo($queue);//还没找到原因为啥不行，先用上面了
                addDeleteBtn();
            //}
            if ($queueSizeLimit == 1) {
                $hdnFile.val(fileUrl);
            }
            if ($queueSizeLimit > 1) {
                var url = $hdnFile + ";" + fileUrl;
                if (url.length > 0) {
                    url = url.substring(0, url.length - 1);
                }
                $hdnFile.val(url);
            }
        }

        //初始化上传控件
        $('#' + $uploaderId + '').uploadify({
                //开启调试
                'debug': false,
                //是否自动上传
                'auto': true,
                'buttonText': '选择本地图片',
                //flash
                'swf': "../Js/SWFUpload/script/uploadify.swf",
                //重新错误信息
                'overrideEvents': ['onDialogClose', 'onUploadError', 'onSelectError'],
                //文件选择后的容器ID
                'queueID': 'uploadfileQueue2',
                'queueSizeLimit': $queueSizeLimit,
                //'uploader': '../ajax/ajax_upload.ashx',
                'uploader': '../Js/SWFUpload/handler/Upload.ashx',
                'width': $wrap.css('width').replace('px', ''),
                'height': $wrap.css('height').replace('px', ''),
                'multi': true,
                'fileTypeDesc': '支持的格式：',
                'fileTypeExts': '*.jpg;*.gif;*.png;*.jpeg',
                'fileSizeLimit': '500KB',
                'removeTimeout': 1,
                //返回一个错误，选择文件的时候触发
                'onSelectError': function (file, errorCode, errorMsg) {
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            $.messager.alert("提示","上传的文件数量已经超出系统限制的" +this.settings.queueSizeLimit + "个文件！");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            $.messager.alert("提示", "文件大小超过限制(" + this.settings.fileSizeLimit + ")");
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            $.messager.alert("提示", "文件大小为0");
                            break;
                        case -120:
                            $.messager.alert("提示","文件 [" + file.name + "] 大小异常！");
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            $.messager.alert("提示", "文件格式不正确，仅限 " + this.settings.fileTypeExts);
                            break;
                        default:
                            $.messager.alert("提示", errorMsg);
                    }
                },
                //检测FLASH失败调用
                'onFallback': function () {
                    $.messager.alert("您未安装FLASH控件，无法上传图片！请安装FLASH控件后再试。");
                },
                //上传到服务器，服务器返回相应信息到data里
                'onUploadSuccess': function (file, data) {
                    try {
                        data = eval("(" + data + ")");
                        var fileurl = data.fileUrl + "@80w_80h_90Q";
                        addFile(fileurl);
                    } catch (err) {

                    }
                }
            });

    });
})(jQuery);

//用于修改时候增加删除图片功能
function addDeleteBtn(ulClassId,hdnId) {
    $("."+ulClassId+"").find("li").each(function () {
        var $btns = $('<div class="file-panel">' +
            '<span class="cancel">删除</span></div>').appendTo($(this));

        $(this).on('mouseenter', function () {
            $btns.stop().animate({ height: 30 });
        });

        $(this).on('mouseleave', function () {
            $btns.stop().animate({ height: 0 });
        });

        $btns.on('click', 'span', function () {
            var index = $(this).index();
            switch (index) {
                case 0:
                    $("."+ulClassId+"").empty();
                    var str = "<li class='file_li'><div class='imgBox'><img  src='../js/SWFUpload/css/addimg_bg.png' style='width:150px;height:150px;'></div></li>";
                    $("."+ulClassId+"").append(str);
                    $("#" + hdnId + "").val("");
                    return;
            }
        });
    });
};