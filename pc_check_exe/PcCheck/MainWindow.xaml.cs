using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace PcCheck
{
    public partial class MainWindow : Window
    {
        private readonly PcInfoCollector _collector;
        private readonly SupabaseClient _supabaseClient;

        public MainWindow()
        {
            InitializeComponent();
            _collector = new PcInfoCollector();
            _supabaseClient = new SupabaseClient();
            BranchComboBox.SelectedIndex = 0;
        }

        private async void SendButton_Click(object sender, RoutedEventArgs e)
        {
            if (BranchComboBox.SelectedItem == null)
            {
                MessageBox.Show("営業所を選択してください", "エラー", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string branchName = ((ComboBoxItem)BranchComboBox.SelectedItem).Content.ToString();

            // 処理中画面に切り替え
            InitialPanel.Visibility = Visibility.Collapsed;
            ProcessingPanel.Visibility = Visibility.Visible;

            try
            {
                // PC情報を収集
                var pcInfo = await CollectPcInfoWithProgress(branchName);

                // サーバーに送信
                UpdateStep(Step6, "→ サーバーに送信...");
                UpdateProgress(90);

                await _supabaseClient.SendPcInfo(pcInfo);

                UpdateStep(Step6, "✓ サーバーに送信");
                UpdateProgress(100);

                // 完了画面に切り替え
                await Task.Delay(500);
                ProcessingPanel.Visibility = Visibility.Collapsed;
                CompletedPanel.Visibility = Visibility.Visible;

                ResultPcName.Text = $"PC名: {pcInfo.PcName}";
                ResultDateTime.Text = $"送信日時: {DateTime.Now:yyyy/MM/dd HH:mm}";
            }
            catch (Exception ex)
            {
                ProcessingPanel.Visibility = Visibility.Collapsed;
                ErrorPanel.Visibility = Visibility.Visible;
                ErrorMessage.Text = $"エラー: {ex.Message}\n\nネットワーク接続を確認して再試行してください。";
            }
        }

        private async Task<PcInfo> CollectPcInfoWithProgress(string branchName)
        {
            var pcInfo = new PcInfo { BranchName = branchName };

            // Step 1: ハードウェア情報
            UpdateStep(Step1, "→ ハードウェア情報...");
            UpdateProgress(10);
            await Task.Run(() => _collector.CollectHardwareInfo(pcInfo));
            UpdateStep(Step1, "✓ ハードウェア情報");
            UpdateProgress(25);

            // Step 2: OS情報
            UpdateStep(Step2, "→ OS情報...");
            await Task.Run(() => _collector.CollectOsInfo(pcInfo));
            UpdateStep(Step2, "✓ OS情報");
            UpdateProgress(40);

            // Step 3: セキュリティソフト
            UpdateStep(Step3, "→ セキュリティソフト...");
            await Task.Run(() => _collector.CollectSecurityInfo(pcInfo));
            UpdateStep(Step3, "✓ セキュリティソフト");
            UpdateProgress(55);

            // Step 4: ネットワーク情報
            UpdateStep(Step4, "→ ネットワーク情報...");
            await Task.Run(() => _collector.CollectNetworkInfo(pcInfo));
            UpdateStep(Step4, "✓ ネットワーク情報");
            UpdateProgress(70);

            // Step 5: ソフトウェア情報
            UpdateStep(Step5, "→ ソフトウェア情報...");
            await Task.Run(() => _collector.CollectSoftwareInfo(pcInfo));
            UpdateStep(Step5, "✓ ソフトウェア情報");
            UpdateProgress(85);

            return pcInfo;
        }

        private void UpdateProgress(int value)
        {
            Dispatcher.Invoke(() =>
            {
                ProgressBar.Value = value;
                ProgressText.Text = $"{value}%";
            });
        }

        private void UpdateStep(TextBlock step, string text)
        {
            Dispatcher.Invoke(() =>
            {
                step.Text = text;
                if (text.StartsWith("✓"))
                {
                    step.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#10B981"));
                }
                else if (text.StartsWith("→"))
                {
                    step.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2563EB"));
                }
            });
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void RetryButton_Click(object sender, RoutedEventArgs e)
        {
            // 初期画面に戻る
            ErrorPanel.Visibility = Visibility.Collapsed;
            InitialPanel.Visibility = Visibility.Visible;

            // 進捗をリセット
            ResetProgress();
        }

        private void ResetProgress()
        {
            ProgressBar.Value = 0;
            ProgressText.Text = "0%";
            Step1.Text = "○ ハードウェア情報";
            Step2.Text = "○ OS情報";
            Step3.Text = "○ セキュリティソフト";
            Step4.Text = "○ ネットワーク情報";
            Step5.Text = "○ ソフトウェア情報";
            Step6.Text = "○ サーバーに送信";

            var subTextBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#64748B"));
            Step1.Foreground = subTextBrush;
            Step2.Foreground = subTextBrush;
            Step3.Foreground = subTextBrush;
            Step4.Foreground = subTextBrush;
            Step5.Foreground = subTextBrush;
            Step6.Foreground = subTextBrush;
        }
    }
}
