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
        public string FileName { get; set; } = default!;
        public string StoredFileName { get; set; } = default!;
        public string ContentType { get; set; } = default!;
        public long FileSize { get; set; }
        public bool IsSuccess { get; set; }
    }
}
