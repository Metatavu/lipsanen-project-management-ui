import config from "app/config";
import { authAtom } from "atoms/auth";
import { getDefaultStore } from "jotai";

export const filesApi = {
  listFiles: async () => {
    const auth = getDefaultStore().get(authAtom);

    const filesResponse = await fetch(`${config.lambdasBaseUrl}/listMedia`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${auth?.tokenRaw}`,
      },
    });

    const filesResponseBody = await filesResponse.json();
    const fileNames = filesResponseBody.data as string[];
    return fileNames.map((fileName) => `${config.cdnBaseUrl}/${fileName}`);
  },
  uploadFile: async (file: File) => {
    const auth = getDefaultStore().get(authAtom);

    const presignedUrlResponse = await fetch(`${config.lambdasBaseUrl}/uploadFile`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${auth?.tokenRaw}`,
      },
      body: JSON.stringify({
        path: `${file.name}`,
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

    return `${config.cdnBaseUrl}/${file.name}`;
  },
};
