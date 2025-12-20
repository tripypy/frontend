export interface UploadImageResponse {
  url: string
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  // const formData = new FormData()
  // formData.append('file', file)

  // const response = await apiClient.post<UploadImageResponse>('/images', formData)
  // return response.data
  // TODO: 백엔드 API 나오면 실제 구현

  return {
    url: URL.createObjectURL(file) //임시 처리
  }
}
