using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using BCUpLoadImg;
using BCUpLoadImg.Model;
using WQB.BLL;
using WQB.Components.Common;
using WQB.AppConfig;
using System.Data.SqlClient;

namespace WQB.Website.Js.SWFUpload.handler
{
    /// <summary>
    /// Summary description for Upload
    /// </summary>
    public class Upload : IHttpHandler
    {
        private const string Url = "http://upload.media.aliyun.com";
        private const string Api = "/api/proxy/upload";
        //客户自定义的参数
        private string appKey = "";
        private string appSession = "";
        private string imgnameSpace = "";
        private string imgDir = "";
        public void ProcessRequest(HttpContext context)
        {
            if (!MyContext.Current.FxyAdmin.Identity.IsAuthenticated &&
                !MyContext.Current.FxsAdmin.Identity.IsAuthenticated &&
                !MyContext.Current.CkAdmin.Identity.IsAuthenticated)
            {
                SysErrorLog.SaveErrorInfo("非法访问方式");
                return;
            }
            context.Response.ContentType = "text/plain";
            HttpPostedFile file = context.Request.Files["Filedata"];
            Byte[] fileByte; string result;
            JavaScriptSerializer js = new JavaScriptSerializer();
            using (var fileMemoryStream = new MemoryStream())
            {
                if (file != null) file.InputStream.CopyTo(fileMemoryStream);
                fileByte = fileMemoryStream.ToArray();
            }
            using (SqlConnection Conn=SqlHelper.CreateConn())
            {
                //客户自定义参数的情况下使用客户自己定义的参数，否则用系统默认的
                appKey = Sys_Para_Set.GetParaStrValue(Conn, "ImgAppKey");
                appSession = Sys_Para_Set.GetParaStrValue(Conn, "ImgSession");
                imgnameSpace = Sys_Para_Set.GetParaStrValue(Conn, "ImgNameSpace");
                imgDir = Sys_Para_Set.GetParaStrValue(Conn, "ImgDir");
                if (appKey == "" && appSession == "" && imgnameSpace == ""&&imgDir=="")
                {
                    appKey = Sys_Para_Set.GetParaStrValue(Conn, "U1City_ImgAppKey");
                    appSession = Sys_Para_Set.GetParaStrValue(Conn, "U1City_ImgSession");
                    imgnameSpace = Sys_Para_Set.GetParaStrValue(Conn, "U1City_ImgNameSpace");
                    imgDir = Sys_Para_Set.GetParaStrValue(Conn, "U1City_ImgDir");
                }
            }
            UpLoadClient client = new UpLoadClient(Url,Api,appKey,appSession);
            if (appKey != "" && appSession != "" && imgnameSpace != "" && imgDir!="")
            {
                //参数说明 1-存储文件主机域名 2-域名目录 3-淘宝帐号 4-申请的token
                string fileName = CommFun.getGuidFileName(file.FileName);
                if (file != null)
                {

                    client.BaichuanModel = new BaichuanModel
                    {
                        Dir = "qqt/" + imgDir + "/",//默认根目录文件名为全渠通
                        Expiration = -1, //token 时效性  -1 默认永不过期
                        Name = fileName, //文件名
                        InsertOnly = 1, //文件上传是否可覆盖 0: 可覆盖, 1: 不可覆盖 默认不可覆盖
                        Namespace = imgnameSpace //三级域名名称 如 http://1213.aa.bb.com/
                    };
                }
                IDictionary<string, object> postData = new Dictionary<string, object>();
                postData.Add("dir", client.BaichuanModel.Dir);
                postData.Add("name", client.BaichuanModel.Name);
                postData.Add("size", fileByte.Length);
                try
                {
                    UpLoadRespond res = client.Post(postData, fileByte, client.BaichuanModel.Name);
                    result = js.Serialize(res.Code.ToLower() == "ok"
                        ? new { code = true, message = "上传成功", fileUrl = res.Url }
                        : new { code = false, message = res.Message, fileUrl = "" });
                }
                catch (Exception ex)
                {
                    result = js.Serialize(new { code = false, message = ex.Message, fileUrl = "" });
                }
            }
            else
            {
                result = js.Serialize(new { code = false, message = "没有配置上传参数！", fileUrl = "" });
            }
            context.Response.Write(result);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}