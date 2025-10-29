import AwsS3Multipart from "@uppy/aws-s3";
import Uppy from "@uppy/core";

/**
 * Fetch with exponential backoff retry logic
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} maxRetries
 * @returns {Promise<Response>}
 */
const retryFetch = async (url, options, maxRetries = 5) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && attempt < maxRetries) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * 
 * @param {*} nodeUrl 
 * @returns {Uppy}
 */
export const getUppy = (nodeUrl, token) => {
  const headers = { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` }
  return new Uppy()
    .use(AwsS3Multipart, {
      async getUploadParameters(file) {
        const response = await retryFetch(`${nodeUrl}/upload/sign`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            fileId: file.meta.id
          }),
        });

        const { url } = await response.json();

        return {
          method: 'PUT',
          url: url,
          fields: {},
          headers: {
            'Content-Type': file.type,
          },
        };
      },

      async createMultipartUpload(file) {
        const response = await retryFetch(`${nodeUrl}/upload/multipart/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            fileId: file.meta.id
          }),
        });
        return response.json(); // { uploadId }
      },

      async signPart(file, { uploadId, key, partNumber }) {
        const response = await retryFetch(`${nodeUrl}/upload/multipart/sign-part`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileId: file.meta.id, uploadId, partNumber }),
        });
        return response.json(); // { url }
      },

      async completeMultipartUpload(file, { uploadId, key, parts }) {
        return await retryFetch(`${nodeUrl}/upload/multipart/complete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileId: file.meta.id, uploadId, parts }),
        });
      },

      async abortMultipartUpload(file, { uploadId, key }) {
        return await retryFetch(`${nodeUrl}/upload/multipart/abort`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileId: file.meta.id, uploadId }),
        });
      },

      getChunkSize(file) {
        return 100e6
      }
    });
}