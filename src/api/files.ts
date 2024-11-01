import config from "app/config";
import { authAtom } from "atoms/auth";
import { getDefaultStore } from "jotai";

export const filesApi = {
  listFiles: async (path: string) => {
    const auth = getDefaultStore().get(authAtom);

    const queryParams = path ? `?path=${encodeURIComponent(path)}` : "";

    const filesResponse = await fetch(`${config.lambdasBaseUrl}/listMedia${queryParams}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${auth?.tokenRaw}`,
      },
    });

    const filesResponseBody = await filesResponse.json();
    const fileNames = filesResponseBody.data as string[];
    return fileNames.map((fileName) => `${config.cdnBaseUrl}/${fileName}`);
  },
  uploadFile: async (file: File, path: string) => {
    const auth = getDefaultStore().get(authAtom);

    const filePath = path ? `${path}/${file.name}` : file.name;

    const presignedUrlResponse = await fetch(`${config.lambdasBaseUrl}/uploadFile`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${auth?.tokenRaw}`,
      },
      body: JSON.stringify({
        path: filePath,
        contentType: file.type,
      }),
    });

    const presignedUrlResponseBody = await presignedUrlResponse.json();

    const uploadResponse = await fetch(presignedUrlResponseBody.data, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (uploadResponse.status !== 200) {
      throw new Error(`Failed to upload file with status ${uploadResponse.status}`);
    }

    return `${config.cdnBaseUrl}/${filePath}`;
  },
};
