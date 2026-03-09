/**
 * 多吉云 (DogeCloud) 存储模块
 * 参考 custom-image-gateway 的 Go 实现和官方 Node.js SDK 文档
 */

import { requestUrl as obsidianRequest } from "obsidian"

export interface DogeConfig {
  accessKeyId: string
  accessKeySecret: string
  bucketName: string      // 存储空间名称（用于获取对应的 s3Bucket）
  customPath: string      // 自定义路径前缀
  accessUrlPrefix: string // 访问URL前缀
}

interface TmpCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}

interface BucketInfo {
  name: string
  s3Bucket: string
  s3Endpoint: string
}

interface TmpTokenResponse {
  code: number
  msg: string
  data?: {
    Credentials: TmpCredentials
    Buckets: BucketInfo[]
    ExpiredAt: number
  }
}

// 缓存临时凭证和 bucket 信息
let cachedCredentials: TmpCredentials | null = null
let cachedBucketInfo: BucketInfo | null = null
let credentialsExpireAt: number = 0

/**
 * HMAC-SHA1 签名
 */
async function hmacSha1(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * 获取多吉云临时凭证（包含 Bucket 信息）
 */
async function getCredentialsAndBucket(accessKey: string, secretKey: string, bucketName: string): Promise<{ credentials: TmpCredentials, bucket: BucketInfo }> {
  // 检查缓存是否有效（提前 5 分钟刷新）
  const now = Math.floor(Date.now() / 1000)
  if (cachedCredentials && cachedBucketInfo && credentialsExpireAt > now + 300) {
    return { credentials: cachedCredentials, bucket: cachedBucketInfo }
  }

  const apiPath = "/auth/tmp_token.json"
  const reqBody = JSON.stringify({
    channel: "OSS_FULL",
    scopes: ["*"]
  })

  const signStr = apiPath + "\n" + reqBody
  const sign = await hmacSha1(secretKey, signStr)
  const authorization = "TOKEN " + accessKey + ":" + sign

  console.log("[DogeCloud] Fetching credentials...")

  const response = await obsidianRequest({
    url: "https://api.dogecloud.com" + apiPath,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization
    },
    body: reqBody
  })

  const result: TmpTokenResponse = response.json

  console.log("[DogeCloud] API response code:", result.code)

  if (result.code !== 200 || !result.data) {
    throw new Error("多吉云 API 错误: " + result.msg)
  }

  // 找到匹配的 bucket
  const bucket = result.data.Buckets.find(b => b.name === bucketName)
  if (!bucket) {
    console.log("[DogeCloud] Available buckets:", result.data.Buckets.map(b => b.name))
    throw new Error(`未找到存储空间: ${bucketName}，请检查存储空间名称是否正确`)
  }

  console.log("[DogeCloud] Found bucket:", bucket.name)
  console.log("[DogeCloud] s3Endpoint:", bucket.s3Endpoint)
  console.log("[DogeCloud] s3Bucket:", bucket.s3Bucket)

  cachedCredentials = result.data.Credentials
  cachedBucketInfo = bucket
  credentialsExpireAt = result.data.ExpiredAt

  return { credentials: cachedCredentials, bucket: cachedBucketInfo }
}

/**
 * AWS Signature V4 签名
 */
async function sha256(message: string | ArrayBuffer): Promise<ArrayBuffer> {
  const data = typeof message === "string" ? new TextEncoder().encode(message) : message
  return await crypto.subtle.digest("SHA-256", data)
}

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message))
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + secretKey).buffer as ArrayBuffer, dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, "aws4_request")
  return kSigning
}

/**
 * 上传文件到多吉云
 */
export async function uploadToDoge(
  config: DogeConfig,
  fileKey: string,
  fileContent: ArrayBuffer,
  contentType: string
): Promise<string> {
  // 获取临时凭证和 bucket 信息
  const { credentials: creds, bucket } = await getCredentialsAndBucket(
    config.accessKeyId,
    config.accessKeySecret,
    config.bucketName
  )

  // 构造完整的文件路径
  const fullPath = config.customPath
    ? config.customPath.replace(/\/$/, "") + "/" + fileKey
    : fileKey

  // 使用 API 返回的 s3Endpoint
  const endpointUrl = new URL(bucket.s3Endpoint)
  const host = endpointUrl.host
  const protocol = endpointUrl.protocol

  // 对路径中的每个部分单独编码
  const encodedPath = fullPath.split("/").map(p => encodeURIComponent(p)).join("/")

  // 使用 path style（多吉云 S3 兼容接口）
  const canonicalUri = "/" + bucket.s3Bucket + "/" + encodedPath
  const uploadUrl = `${protocol}//${host}${canonicalUri}`

  // 时间戳
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  const dateStamp = amzDate.substring(0, 8)

  // 计算 payload hash
  const payloadHash = toHex(await sha256(fileContent))

  // 构造 canonical request
  const method = "PUT"
  const canonicalQueryString = ""

  const headers: Record<string, string> = {
    "content-type": contentType,
    "host": host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "x-amz-security-token": creds.sessionToken
  }

  const signedHeaders = Object.keys(headers).sort().join(";")
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(k => k.toLowerCase() + ":" + headers[k].trim() + "\n")
    .join("")

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n")

  // 构造 string to sign - 使用 automatic region
  const algorithm = "AWS4-HMAC-SHA256"
  const region = "automatic"
  const service = "s3"
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    toHex(await sha256(canonicalRequest))
  ].join("\n")

  // 计算签名
  const signingKey = await getSignatureKey(creds.secretAccessKey, dateStamp, region, service)
  const signature = toHex(await hmacSha256(signingKey, stringToSign))

  // 构造 Authorization header
  const authorization = `${algorithm} Credential=${creds.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  console.log("[DogeCloud] Upload URL:", uploadUrl)
  console.log("[DogeCloud] Content-Type:", contentType)
  console.log("[DogeCloud] File size:", fileContent.byteLength)

  try {
    const response = await obsidianRequest({
      url: uploadUrl,
      method: "PUT",
      contentType: contentType,
      headers: {
        "Authorization": authorization,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "x-amz-security-token": creds.sessionToken
      },
      body: fileContent
    })

    console.log("[DogeCloud] Response status:", response.status)

    if (response.status !== 200 && response.status !== 204) {
      console.error("[DogeCloud] Response:", response.text)
      throw new Error(`上传失败: ${response.status}`)
    }
  } catch (e) {
    console.error("[DogeCloud] Request error:", e)
    throw e
  }

  // 返回访问 URL
  const accessUrl = config.accessUrlPrefix
    ? config.accessUrlPrefix.replace(/\/$/, "") + "/" + fullPath
    : uploadUrl

  return accessUrl
}

/**
 * 清除凭证缓存
 */
export function clearCredentialsCache(): void {
  cachedCredentials = null
  credentialsExpireAt = 0
}
