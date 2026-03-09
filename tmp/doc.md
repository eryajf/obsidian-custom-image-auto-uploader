## Node.js S3 SDK

> 在服务端使用 JavaScript 进行存储空间管理、文件管理和文件上传的方案

如果需要在服务端对存储空间、文件进行管理，上传和下载，可以使用我们提供的 JavaScript 方法和 AWS S3 JavaScript SDK。

## 引入

### 添加 dogecloudApi 函数

首先添加 `dogecloudApi` 函数，用于调用多吉云的 API。

该函数代码请查看： [dogecloudApi](https://docs.dogecloud.com/oss/api-access-token?id=nodejs) 。

### 引入 AWS JS SDK

如果需要使用 Node.js 在服务端进行文件操作，例如获取文件列表、上传文件、删除文件、复制文件等操作，则还需要引入 AWS S3 JavaScript SDK。

首先在项目根目录安装 `aws-sdk` ：

```bash
npm install aws-sdk --save
```

然后在代码中引入：

```javascript
// 节省体积，只引入 S3 服务（推荐）
const S3 = require('aws-sdk/clients/s3'); 

// 或者：引入整个 AWS 包（不推荐）
const AWS = require('aws-sdk'); // 请注意如果这样引入，下方代码中所有 “S3” 类名，需要改为 “AWS.S3”
```

### 初始化 AWS S3 SDK

如果需要使用 Node.js 在服务端进行文件操作，需要先初始化 AWS S3 JavaScript SDK。

首先需要获取临时密钥：

```javascript
// 该 API 参考文档： https://docs.dogecloud.com/oss/api-tmp-token
dogecloudApi('/auth/tmp_token.json', {
    channel: 'OSS_FULL',
    scopes: ['*']
}, true, function(err, data) {
    if (err) { console.log(err.Error); return; }
    const credentials = data.Credentials;
    console.log(credentials);
    // 这里推荐使用 Redis 之类的缓存将获取到的临时密钥缓存下来，两小时内有效

})
```

然后使用获取到的临时密钥，初始化 S3 实例：

```javascript
const s3 = new S3({ // 用服务端返回的信息初始化一个 S3 实例
    region: 'automatic',
    endpoint: data.Buckets[0].s3Endpoint, // 存储空间的 s3Endpoint 值，控制台存储空间 SDK 参数选项卡中也可以找到
    credentials: credentials,
    params: {
        Bucket: data.Buckets[0].s3Bucket // 存储空间的 s3Bucket 值，控制台存储空间 SDK 参数选项卡中也可以找到，
                                         // 这里先绑定好 s3Bucket，之后如果操作的是同一个存储空间，就不用再传递 Bucket 了
    }
});
```

## 存储空间操作

一些简单的存储空间操作，这些操作不需要用到 AWS S3 SDK。

### 获取存储空间列表

用于获取当前账号下的存储空间列表，获取列表并输出：

```javascript
dogecloudApi('/oss/bucket/list.json', {}, false, function(err, data) {
    console.log(err || data.buckets);
});
```

### 创建存储空间

创建一个上海地域，加速类型为静态小文件，名为 `newbucket` 的存储空间：

```javascript
dogecloudApi('/oss/bucket/create.json', {
    name: 'newbucket',
    region: 0, // 0: 上海（华东），1: 北京（华北），2: 广州（华南），3: 成都（西南）
    service_type: 'web'
}, false, function(err, data) {
    console.log(err || data); // 有 err 则为失败
});
```

### 删除存储空间

删除名为 `newbucket` 的存储空间：

```javascript
dogecloudApi('/oss/bucket/delete.json', {
    name: 'newbucket'
}, false, function(err, data) {
    console.log(err || data); // 有 err 则为失败
});
```

## 文件操作

要进行文件操作，需要先初始化 S3 SDK，上面已经介绍如何初始化 S3 SDK。

### 获取文件列表

```javascript
// 列出目录 a 下所有文件：
s3.listObjects({
    Bucket: s3Bucket, // 空间的 s3Bucket 值，如果初始化 S3 时传递了 params.Bucket，则这里可以省略此参数
    Prefix: 'a/',
    Delimiter: '/',
    Marker: '',
    MaxKeys: 1000
}, function(err, data) {
    console.log(err || data.Contents);
});
```

`listObjects` 参数说明，其中 `*` 为必需参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| Bucket | String | 指定存储空间的 s3Bucket 值，控制台存储空间 SDK 参数选项卡中可以找到，获取临时密钥时也有 |
| Prefix | String | 文件列表过滤前缀，限定返回中只包含指定前缀的文件，例如 `abc/` 表示列出前缀为 `abc/` 的文件，或者可以理解为 `abc` 文件夹下的文件 |
| Delimiter | String | 一般为空，或者为 `/` ，表示用于模拟“文件夹”概念的分隔字符。   设为 `/` 表示开启目录结构，将只会返回指定 Prefix 目录下的文件，不会返回子目录的文件，子目录列表将在结果中用 `CommonPrefixes` 列出；   设为空字符串表示不开启目录结构，路径中所有 / 将被当成普通字符串处理 |
| Marker | String | 下一次获取的起始点，用于循环获取所有文件。首次获取设置为空字符串，接下来每次获取设置为前一次获取返回的 `NextMarker` 值 |
| MaxKeys | Int | 设置每次获取的文件数量，最大 1000 |

返回的 `data` 为一个对象，举例（已 JSON 化便于展示）：

```json
{ // 这里面的属性可以直接用例如 data.IsTruncated、data.Contents 的形式访问。
    "IsTruncated": false, 
    // 为 true 表示还没获取完，可以继续循环获取接下来的内容，false 表示已经没有文件了。
    // isTruncated 为 true 时，NextMarker 属性即为下次获取的起点，下次获取作为 Marker 传入
    "Marker": "",
    "Contents": [ // 文件列表
        {
            "Key": "4.6.jpg",
            "LastModified": "2020-04-22T16:32:46+00:00",
            "ETag": "\"37b2eb8cec314701d527f417c480e827-1\"",
            "Size": "32627",
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "1234567890",
                "ID": "1234567890"
            }
        },
        {
            "Key": "4k_out_qsv.mp4",
            "LastModified": "2020-03-11T23:27:20+00:00",
            "ETag": "\"0fae26ca2c83c8db68bd970d6b1d7dda-14\"",
            "Size": "14055859",
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "1234567890",
                "ID": "1234567890"
            }
        },
        {
            "Key": "_dogeError_.html",
            "LastModified": "2020-04-07T13:50:56+00:00",
            "ETag": "\"c2be8ef987326e33bbb7edc1c735b84a-1\"",
            "Size": "548",
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "1234567890",
                "ID": "1234567890"
            }
        }
    ],
    "Name": "s-cd-1-mybucket-1234567890",
    "Prefix": "",
    "Delimiter": "/",
    "MaxKeys": 1000,
    "CommonPrefixes": [ // 如果设置了 Delimiter 为 /，文件夹将被列在 CommonPrefixes 里面
        {
            "Prefix": "_dogeWatermark_/"
        },
        {
            "Prefix": "abc/"
        },
        {
            "Prefix": "wp-content/"
        },
        {
            "Prefix": "文件夹/"
        }
    ],
    "EncodingType": "url"
}
```

### 简单上传

如果你需要上传的文件基本都在 16 MB 以内，可以使用简单上传。

简单上传一个字符串到指定路径：

```javascript
var params = {
    Bucket: s3Bucket, // 空间的 s3Bucket 值，如果初始化 S3 时传递了 params.Bucket，则这里可以省略此参数
    Body: "这里也可以是字符串", 
    Key: "a.txt"
};
s3.putObject(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
});
```

### 分片上传

如果你不确定需要上传的文件的大小，可能会有不太适合简单上传的大文件，可以进行分片上传。（不确定文件大小时，可以不管大小都直接使用分片上传）

- **方法** ： `upload(params, [options])`
- **功能** ：初始化上传一个文件（默认大于 `5 MB` 的文件自动使用分片上传，小于 `5 MB` 的文件采用简单上传），返回一个用于控制上传开始、取消的 `S3Upload` 对象。
- **参数** ：
	- `{Object} params` 上传基本参数，字段见下表。仅列出部分，完整列表请看 [S3 官方文档](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) 。
		| 参数名 | 类型 | 说明 |
		| --- | --- | --- |
		| Bucket | String | `s3Bucket` 信息，如果你按照上面的建议在初始化 `AWS.S3` 时已经在 `params` 里提供了 `s3Bucket` 信息，这里就不用管了 |
		| Key `*` | String | 必需参数，本次上传的文件路径 Key 信息 |
		| Body `*` | File | 必需参数，上传的文件本体，除了 `File` 以外，还可以是 `Buffer`, `Typed Array`, `Blob`, `String`, `ReadableStream` 等类型 |
		| ContentType | String | 上传后文件的 Content-Type 头，即 MIME 类型 |
	- `{Object} options` 上传技术参数，字段见下表。
		| 参数名 | 类型 | 说明 |
		| --- | --- | --- |
		| queueSize | Int | 分片上传允许同时上传的分片数，你可以理解为上传线程数。默认是 `4` |
		| partSize | Int | 分片上传每个分片的文件大小，单位字节。默认 `5 MB` 即 `5 * 1024 * 1024` |
		| leavePartsOnError | Boolean | 取消上传后，是否保留已经上传完的分片。默认 `false` 即删除 |
- **返回值** ： `{S3Upload}` 一个 `S3Upload` 对象，该对象有 `S3Upload.send(callback)` 和 `S3Upload.abort()` 两个方法，还支持一个 `httpUploadProgress` 事件。
	- `S3Upload.send` ：用于开始上传，支持一个参数：上传结束时的回调函数 `callback` ，该回调函数有两参数，第一个参数 `err` ，如果不为空，表示上传出错，第二参数 `data` 表示上传成功的信息；
	- `S3Upload.abort` ：用于取消本次上传；
	- `S3Upload.on('httpUploadProgress', function(progress){})` ：用于上传进度回调的事件

调用举例：

```javascript
s3.upload({
    Bucket: s3Bucket, // 空间的 s3Bucket 值，如果初始化 S3 时传递了 params.Bucket，则这里可以省略此参数
    Key: 'key',
    Body: stream
}, {
    partSize: 10 * 1024 * 1024,
    queueSize: 2
}, function(err, data) { // 如果 s3.upload 传递了第三个参数，表示直接 send
  console.log(err, data);
});
```

### 复制文件

将 `sourceS3Bucket` （不是存储空间名，是空间对应的 s3Bucket 值） 的 `abc/123.jpg` ，  
复制到 `targetS3Bucket` （不是存储空间名，是空间对应的 s3Bucket 值） 的 `abc/123_copy.jpg` ：

```javascript
s3.copyObject({
    Bucket: "targetS3Bucket", // 这里替换为目标空间的 s3Bucket 值
    CopySource: "/sourceS3Bucket/abc/123.jpg", // sourceS3Bucket 替换为源空间的 s3Bucket 值
    Key: "abc/123_copy.jpg"  // 目标路径
}, function(err, data) {
    if (err) console.log(err, err.stack); // 出错
    else console.log(data); // 成功
});
```

### 删除文件

```javascript
// 删除一个文件
s3.deleteObject({
    Bucket: s3Bucket, // 空间的 s3Bucket 值，如果初始化 S3 时传递了 params.Bucket，则这里不需要此参数
    Key: 'abc/123.jpg'
}, function(err, data) {
    console.log(err || data);
});
```

## 为客户端上传文件获取临时密钥

如果你需要在客户端上传文件，则需要服务端为客户端提供临时密钥：

```javascript
var _bucket = 'mybucket'; // 替换为你要上传到的存储空间名称
var _key = 'abc/123.jpg'; // 本次允许客户端上传的文件名，请根据当前网站用户登录状态、权限进行合理的最小化授权
// var _key = 'abc/*'; // 也可以这样设置为 abc/* ，表示允许客户端上传到 abc 文件夹下的任意文件名
// var _key = '*'; // 或者设为 * 表示允许客户端上传到该存储空间内的任意文件（有安全风险，不推荐这样做）

dogecloudApi('/auth/tmp_token.json', {
    channel: 'OSS_UPLOAD',
    scopes: [_bucket + ':' + _key]
}, true, function(err, data) {
    if (err) { console.log('Request Error', err); return } // 错误
    var ret = {
        credentials: data.Credentials,
        s3Bucket: data.Buckets[0].s3Bucket,
        s3Endpoint: data.Buckets[0].s3Endpoint,
        keyPrefix: _key // 顺便告诉客户端本次它允许上传到哪个文件或文件前缀
    };
    console.log(JSON.stringify(ret)); // 成功，请将 ret 作为 JSON 输出给客户端
});
```

拖拽到此处完成下载

图片将完成下载

AIX智能下载器

聊天

A-Circle Jackie 有疑问吗？联系我们！ 上次活动 2 小时前

发送文件

插入表情符号 发送文件 录制音频信息

[We run on Crisp](https://crisp.chat/en/livechat/?ref=chatbox&domain=docs.dogecloud.com&name=%E5%A4%9A%E5%90%89%E4%BA%91)
