import Axios from 'axios';
import qs from 'qs';

const clientSecret = process.env.VUE_APP_FORGE_CLIENT_SECRET;
const clientId = process.env.VUE_APP_FORGE_CLIENT_ID;

let access_token = null;

/* ------------------------ METHODS ------------------------ */
const Authenticate = async () => {
  const authorization = btoa(`${clientId}:${clientSecret}`);

  let data = qs.stringify({
    'grant_type': 'client_credentials',
    'scope': 'data:read data:write data:create bucket:create bucket:read bucket:delete'
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://developer.api.autodesk.com/authentication/v2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${authorization}`
    },
    data: data
  };

  try {
    const res = await Axios.request(config);
    access_token = await res.data.access_token;
  } catch (error) {
    console.log(error.message)
  }

  return access_token
}

const GetBuckets = async () => {
  let buckets = null;

  const config = {
    method: 'get',
    url: 'https://developer.api.autodesk.com/oss/v2/buckets',
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }

  try {
    const res = await Axios.request(config);
    buckets = await res.data.items;
  } catch (error) {
    console.log(error)
  }

  return buckets;
}

const GetObjectsInBucket = async (bucketKey, numberOfModels) => {
  let models = null;

  const url = numberOfModels
    ? `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects?limit=${numberOfModels}`
    : `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects`

  const config = {
    method: 'get',
    url: url,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }

  try {
    const res = await Axios.request(config);
    models = await res.data.items;
  } catch (error) {
    console.log(error);
  }

  return models;
}

const AddBucket = async (bucket) => {
  let addedBucket = null;
  const data = JSON.stringify(bucket);

  const config = {
    method: 'post',
    url: 'https://developer.api.autodesk.com/oss/v2/buckets',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    data: data
  }

  try {
    addedBucket = await Axios.request(config);
    return addedBucket;
  } catch (error) {
    return {
      message: error.response.data.reason
    };
  }
}

const DeleteBucket = async (bucketKey) => {
  const config = {
    method: 'delete',
    url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }

  try {
    await Axios.request(config);
    return {
      bucketKey: bucketKey
    }
  } catch (error) {
    return {
      error: error
    }
  }
}

const getSignedS3UploadUrl = async (bucketKey, objectKey) => {
  const config = {
    method: 'get',
    url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }

  try {
    const res = await Axios.request(config);
    return await res.data;
  } catch (error) {
    return {
      error: error
    }
  }
}

const uploadFileToSignedUrl = async (signedUrl, file) => {
  // In a browser environment, you can't directly access the file system using fs.
  // However, you can handle file uploads using the FormData API
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: signedUrl,
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    data: formData
  };

  try {
    const res = await Axios.request(config);
    return res.data;
  } catch (error) {
    console.log(error)
  }
}

const finalizeFileUpload = async (bucketKey, objectKey, uploadKey) => {
  const data = JSON.stringify({
    uploadKey: uploadKey
  });

  const config = {
    method: 'post',
    url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'x-ads-meta-Content-Type': 'application/octet-stream',
    },
    data: data
  }

  try {
    const res = await Axios.request(config);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

const UploadFileToBucket = async (bucketKey, file) => {
  const objectKey = file.name;

  const { urls, uploadKey } = await getSignedS3UploadUrl(bucketKey, objectKey);
  await uploadFileToSignedUrl(urls[0], file);
  const objectData = await finalizeFileUpload(bucketKey, objectKey, uploadKey);

  return objectData;
}

const DeleteObjectFromBucket = async (bucketKey, objectKey) => {
  const config = {
    method: 'delete',
    url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }

  try {
    const res = await Axios.request(config)
    console.log(res.data);
  } catch(error) {
    console.log(error);
  }
}

const InitializeViewer = () => {
  const options = {
    env: 'AutodeskProduction2',
    api: 'streamingV2',  // for models uploaded to EMEA change this option to 'streamingV2_EU'
    getAccessToken: function (onTokenReady) {
      const timeInSeconds = 3600; // Use value provided by APS Authentication (OAuth) API
      onTokenReady(access_token, timeInSeconds);
    }
  };

  Autodesk.Viewing.Initializer(options, function () {
    const htmlDiv = document.getElementById('forgeViewer');
    let viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
    const startedCode = viewer.start();
    if (startedCode > 0) {
      console.error('Failed to create a Viewer: WebGL not supported.');
      return;
    }
    console.log('Initialization complete, loading a model next...');
  });
}

export {
  Authenticate,
  GetBuckets,
  GetObjectsInBucket,
  AddBucket,
  DeleteBucket,
  UploadFileToBucket,
  DeleteObjectFromBucket,
  InitializeViewer
}