IMAGE_STREAMER = {
    UpdateImg: async function (imageElementId, imageStream) {
        const arr = await imageStream.arrayBuffer();
        const blob = new Blob([arr]);
        const url = URL.createObjectURL(blob);
        const img = document.getElementById(imageElementId);

        img.onload = () => { URL.revokeObjectURL(url); }

        img.src = url;
    },
    GetImgSrc: async function (imageStream) {
        const arr = await imageStream.arrayBuffer();
        const blob = new Blob([arr]);
        const url = URL.createObjectURL(blob);
        return url;
    },
    DownloadFileFromStream: async (fileName, contentStreamRefrence) => {
        const arrayBuffer = await contentStreamRefrence.arrayBuffer();
        const blob = new Blob([arrayBuffer]);
        const url = window.URL.createObjectURL(blob);
        const anchorElement = document.createElement('a');
        anchorElement.href = url;
        anchorElement.download = fileName ?? '';
        anchorElement.click();
        anchorElement.remove();
        URL.revokeObjectURL(url);
    }
}