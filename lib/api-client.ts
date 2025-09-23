import axios, { isAxiosError } from "axios";

const API_URL =
  "https://ramen-ai-backend-service-943228427206.asia-northeast1.run.app/api/v1";

const BASE_URL =
  "https://ramen-ai-backend-service-943228427206.asia-northeast1.run.app";

// 画像URLを絶対URLに変換するヘルパー関数
const convertImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;

  // 既にhttp/httpsで始まる場合
  if (imageUrl.startsWith("http")) {
    // Google Cloud Storageの署名付きURLの場合、エンコーディングを確認
    if (imageUrl.includes("storage.googleapis.com")) {
      console.log("Google Cloud Storage URL detected:", imageUrl);
      // URLをそのまま返す（エンコーディングは既に正しい）
      return imageUrl;
    }
    return imageUrl;
  }

  // 相対パスの場合
  return `${BASE_URL}${imageUrl}`;
};

export const secureApiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    adapter: "http",
    maxRedirects: 3,
    decompress: true,
  },
});

export const apiService = {
  getRandomMenus: async () => {
    try {
      const response = await secureApiClient.get("/random_menus");

      // 画像URLを絶対URLに変換
      if (response.data.menus) {
        response.data.menus = response.data.menus.map((menu: any) => ({
          ...menu,
          image_url: convertImageUrl(menu.image_url),
        }));
      }

      console.log("Converted menu data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching menus:", error);
      return {
        menus: [
          {
            id: 999,
            name: "サンプルラーメン",
            genre_name: "ラーメン",
            noodle_name: "中太麺",
            soup_name: "醤油",
            image_url:
              "https://t4.ftcdn.net/jpg/02/13/73/65/360_F_213736517_nOggg1YoxSijwAjhtFXvERQs4eFeRTS4.jpg",
          },
        ],
      };
    }
  },
  getMenuDetail: async (id: string | string[]) => {
    try {
      const response = await secureApiClient.get(`/menu_with_shops/${id}`);

      // 画像URLを絶対URLに変換
      if (response.data.image_url) {
        response.data.image_url = convertImageUrl(response.data.image_url);
      }

      console.log("Menu detail data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching menu detail:", error);
      throw error;
    }
  },
  sendRecommendedMenus: async (
    selectMenuIds: number[],
    notSelectedMenuIds: number[] = [],
  ) => {
    try {
      console.log("Sending menu IDs:", selectMenuIds);
      console.log("Sending not selected menu IDs:", notSelectedMenuIds);

      const response = await secureApiClient.post(
        "/recommended_menus",
        {
          select_menu_ids: selectMenuIds,
          not_selected_menu_ids: notSelectedMenuIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API Response:", response.data);

      // 新しい構造に対応した画像URL変換
      if (response.data.recommended_menu?.image_url) {
        response.data.recommended_menu.image_url = convertImageUrl(
          response.data.recommended_menu.image_url,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error sending recommended menus:", error);

      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },
};
