using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace PcCheck
{
    public class SupabaseClient
    {
        // Supabase設定
        private const string SUPABASE_URL = "https://pqmuleyagoivpjuhbdbi.supabase.co";
        private const string SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbXVsZXlhZ29pdnBqdWhiZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUzMTAsImV4cCI6MjA4MjIwMTMxMH0.K6pJwvLwp7M8MP08aVYyOPPRCMDb1OSTOeFbI6KvbuI";

        private readonly HttpClient _httpClient;
        private readonly JsonSerializerSettings _jsonSettings;

        public SupabaseClient()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("apikey", SUPABASE_ANON_KEY);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {SUPABASE_ANON_KEY}");

            _jsonSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                DateFormatString = "yyyy-MM-ddTHH:mm:ssZ"
            };
        }

        public async Task SendPcInfo(PcInfo pcInfo)
        {
            string json = JsonConvert.SerializeObject(pcInfo, _jsonSettings);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // UPSERT用のリクエストを作成（pc_name + branch_nameの重複時は更新）
            // レスポンスでIDを取得するためにreturn=representationを追加
            var request = new HttpRequestMessage(HttpMethod.Post, $"{SUPABASE_URL}/rest/v1/pc_inventory?on_conflict=pc_name,branch_name&select=id")
            {
                Content = content
            };
            request.Headers.Add("Prefer", "resolution=merge-duplicates,return=representation");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                string errorBody = await response.Content.ReadAsStringAsync();
                throw new Exception($"送信失敗: {response.StatusCode} - {errorBody}");
            }

            // レスポンスからIDを取得して履歴に保存
            string responseBody = await response.Content.ReadAsStringAsync();
            var resultArray = JArray.Parse(responseBody);
            if (resultArray.Count > 0)
            {
                string pcInventoryId = resultArray[0]["id"]?.ToString();
                await SaveHistory(pcInfo, pcInventoryId);
            }
        }

        private async Task SaveHistory(PcInfo pcInfo, string pcInventoryId)
        {
            try
            {
                // 履歴データを作成
                var historyData = new
                {
                    pc_inventory_id = pcInventoryId,
                    pc_name = pcInfo.PcName,
                    branch_name = pcInfo.BranchName,
                    collected_at = pcInfo.CollectedAt,
                    snapshot = pcInfo  // PC情報全体をJSON保存
                };

                string json = JsonConvert.SerializeObject(historyData, _jsonSettings);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{SUPABASE_URL}/rest/v1/pc_inventory_history", content);

                // 履歴保存の失敗はログのみ（メイン処理には影響させない）
                if (!response.IsSuccessStatusCode)
                {
                    string errorBody = await response.Content.ReadAsStringAsync();
                    System.Diagnostics.Debug.WriteLine($"履歴保存失敗: {response.StatusCode} - {errorBody}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"履歴保存エラー: {ex.Message}");
            }
        }
    }
}
