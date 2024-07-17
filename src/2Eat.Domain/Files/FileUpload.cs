using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain.Files
{
    public class FileUpload
    {
        public int Id { get; set; }
        public string? FileName { get; set; }
        public string? StoredFileName { get; set; }
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public bool IsSuccess { get; set; }
    }
}
