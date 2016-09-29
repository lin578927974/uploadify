using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using Newtonsoft.Json;
using WQB.BLL;
using WQB.Components.Common;
using WQB.OuterApi.BaiChuan;

namespace WQB.Website.Js.SWFUpload.handler
{
    /// <summary>
    /// TslmUpload 的摘要说明
    /// </summary>
    public class TslmUpload : IHttpHandler
    {
        public string path = "~/Upload/Tslm/Supplier";
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

            try
            { 
                if (!Directory.Exists(context.Server.MapPath(path)))
                {
                    Directory.CreateDirectory(context.Server.MapPath(path));
                }

                string filename = file.FileName;
                var newfilename = CommFun.getRandomFileName(filename);

                // 本地文件系统路径
                string savePath = Path.Combine(context.Server.MapPath(path), newfilename);
                file.SaveAs(savePath);
                string Api = "/api/proxy/upload";
                string appKey = "";
                string appSession = "";
                string imgnameSpace = "";
                string imgDir = "";
                using (SqlConnection Conn = SqlHelper.CreateConn())
                {
                    appKey = Sys_Para_Set.GetParaStrValue(Conn, "ImgAppKey");
                    appSession = Sys_Para_Set.GetParaStrValue(Conn, "ImgSession");
                    imgnameSpace = Sys_Para_Set.GetParaStrValue(Conn, "ImgNameSpace");
                    imgDir = Sys_Para_Set.GetParaStrValue(Conn, "ImgDir");
                }

                BaiChuanResult baichuanresult = JsonConvert.DeserializeObject(UploadFileToBaiChuan.UploadFile(savePath, newfilename, Api, appKey, appSession, imgnameSpace, imgDir), typeof(BaiChuanResult)) as BaiChuanResult;
                if (baichuanresult == null || baichuanresult.code == false)
                {
                    throw new Exception(string.Format("上传图片到图片库失败！请确认图片库参数是否正确！"));
                }
                var fileurl = baichuanresult.fileUrl;

                var FileID = Guid.NewGuid();
                using (SqlConnection Conn = SqlHelper.CreateConn())
                {
                    var para = new List<SqlParameter>();
                    para.Add(new SqlParameter("FlieID", FileID));
                    para.Add(new SqlParameter("FileUrl", fileurl));
                    //
                    SqlHelper.ExecuteNonQuery(Conn, "INSERT INTO Sys_UploadFile(FlieID,FileUrl)VALUES(@FlieID,@FileUrl)", para.ToArray());
                }

                var model = new TslmPicModel();
                model.code = true;
                model.message = "上传成功";
                model.fileUrl = fileurl;
                model.FileId = FileID.ToString();

                var result = JsonConvert.SerializeObject(model);
                context.Response.Write(result);

            }
            catch (Exception ex)
            {
                WQB.BLL.SysErrorLog.SaveErrorInfo(ex);
                throw;
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        public class TslmPicModel
        {
            public bool code { get; set; }
            public string message { get; set; }
            public string fileUrl { get; set; }
            public string FileId { get; set; }
        }
    }
}