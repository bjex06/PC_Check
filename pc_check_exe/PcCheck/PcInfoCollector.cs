using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using Microsoft.Win32;

namespace PcCheck
{
    public class PcInfoCollector
    {
        public void CollectHardwareInfo(PcInfo pcInfo)
        {
            // 基本情報
            pcInfo.PcName = Environment.MachineName;
            pcInfo.UserName = Environment.UserName;
            pcInfo.DomainName = Environment.UserDomainName;

            // CPU情報
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        pcInfo.CpuName = obj["Name"]?.ToString()?.Trim();
                        pcInfo.CpuCores = Convert.ToInt32(obj["NumberOfCores"] ?? 0);
                        pcInfo.CpuThreads = Convert.ToInt32(obj["NumberOfLogicalProcessors"] ?? 0);
                        pcInfo.CpuMaxClock = $"{obj["MaxClockSpeed"]} MHz";
                        break;
                    }
                }
            }
            catch { }

            // メモリ情報
            try
            {
                long totalMemory = 0;
                string memoryType = "";
                int slotCount = 0;
                int usedSlots = 0;

                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        totalMemory += Convert.ToInt64(obj["Capacity"] ?? 0);
                        usedSlots++;

                        int typeCode = Convert.ToInt32(obj["SMBIOSMemoryType"] ?? 0);
                        memoryType = typeCode switch
                        {
                            20 => "DDR",
                            21 => "DDR2",
                            24 => "DDR3",
                            26 => "DDR4",
                            34 => "DDR5",
                            _ => "Unknown"
                        };
                    }
                }

                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemoryArray"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        slotCount = Convert.ToInt32(obj["MemoryDevices"] ?? 0);
                        break;
                    }
                }

                pcInfo.MemoryTotalGb = Math.Round((decimal)totalMemory / (1024 * 1024 * 1024), 2);
                pcInfo.MemoryType = memoryType;
                pcInfo.MemorySlots = $"{usedSlots}/{slotCount}";
            }
            catch { }

            // GPU情報
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController"))
                {
                    var gpuNames = new List<string>();
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string name = obj["Name"]?.ToString();
                        if (!string.IsNullOrEmpty(name))
                        {
                            gpuNames.Add(name);
                        }
                    }
                    pcInfo.GpuName = string.Join(", ", gpuNames);
                }
            }
            catch { }

            // マザーボード情報
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BaseBoard"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        pcInfo.Motherboard = $"{obj["Manufacturer"]} {obj["Product"]}";
                        break;
                    }
                }
            }
            catch { }

            // BIOS情報
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BIOS"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        pcInfo.BiosVersion = obj["SMBIOSBIOSVersion"]?.ToString();
                        pcInfo.SerialNumber = obj["SerialNumber"]?.ToString();
                        break;
                    }
                }
            }
            catch { }

            // メーカー・モデル情報
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        pcInfo.Manufacturer = obj["Manufacturer"]?.ToString();
                        pcInfo.Model = obj["Model"]?.ToString();
                        break;
                    }
                }
            }
            catch { }

            // ストレージ情報
            try
            {
                // ドライブレター情報
                foreach (DriveInfo drive in DriveInfo.GetDrives())
                {
                    if (drive.IsReady && drive.DriveType == DriveType.Fixed)
                    {
                        pcInfo.StorageInfo.Add(new StorageInfo
                        {
                            Drive = drive.Name.TrimEnd('\\'),
                            TotalGb = Math.Round((decimal)drive.TotalSize / (1024 * 1024 * 1024), 2),
                            FreeGb = Math.Round((decimal)drive.TotalFreeSpace / (1024 * 1024 * 1024), 2),
                            Type = "Unknown"
                        });
                    }
                }

                // 物理ディスク情報（SSD/HDD判定）
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive"))
                {
                    int index = 0;
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string mediaType = obj["MediaType"]?.ToString() ?? "";
                        string model = obj["Model"]?.ToString() ?? "";

                        // SSD判定（モデル名やMediaTypeから推測）
                        bool isSsd = model.ToUpper().Contains("SSD") ||
                                     model.ToUpper().Contains("NVME") ||
                                     model.ToUpper().Contains("SOLID");

                        if (index < pcInfo.StorageInfo.Count)
                        {
                            pcInfo.StorageInfo[index].Type = isSsd ? "SSD" : "HDD";
                            pcInfo.StorageInfo[index].Model = model;
                        }
                        index++;
                    }
                }
            }
            catch { }
        }

        public void CollectOsInfo(PcInfo pcInfo)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        pcInfo.OsName = obj["Caption"]?.ToString();
                        pcInfo.OsVersion = obj["Version"]?.ToString();
                        pcInfo.OsBuild = obj["BuildNumber"]?.ToString();

                        // インストール日
                        string installDate = obj["InstallDate"]?.ToString();
                        if (!string.IsNullOrEmpty(installDate))
                        {
                            pcInfo.OsInstallDate = ManagementDateTimeConverter.ToDateTime(installDate);
                        }

                        // 最終起動日時
                        string lastBoot = obj["LastBootUpTime"]?.ToString();
                        if (!string.IsNullOrEmpty(lastBoot))
                        {
                            pcInfo.LastBootTime = ManagementDateTimeConverter.ToDateTime(lastBoot);
                        }

                        break;
                    }
                }
            }
            catch { }

            // Windowsエディション
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion"))
                {
                    pcInfo.OsEdition = key?.GetValue("EditionID")?.ToString();
                }
            }
            catch { }

            // ライセンス状態
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM SoftwareLicensingProduct WHERE ApplicationId='55c92734-d682-4d71-983e-d6ec3f16059f' AND LicenseStatus=1"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        int status = Convert.ToInt32(obj["LicenseStatus"] ?? 0);
                        pcInfo.OsLicenseStatus = status == 1 ? "ライセンス認証済み" : "未認証";
                        break;
                    }
                }

                if (string.IsNullOrEmpty(pcInfo.OsLicenseStatus))
                {
                    pcInfo.OsLicenseStatus = "確認不可";
                }
            }
            catch
            {
                pcInfo.OsLicenseStatus = "確認不可";
            }
        }

        public void CollectSecurityInfo(PcInfo pcInfo)
        {
            // セキュリティソフト検出
            try
            {
                // Windows Security Center経由
                using (var searcher = new ManagementObjectSearcher(@"root\SecurityCenter2", "SELECT * FROM AntiVirusProduct"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string displayName = obj["displayName"]?.ToString();
                        if (!string.IsNullOrEmpty(displayName))
                        {
                            pcInfo.SecuritySoftware = displayName;

                            // 状態解析
                            uint state = Convert.ToUInt32(obj["productState"] ?? 0);
                            bool enabled = ((state >> 12) & 0x1) == 1;
                            bool upToDate = ((state >> 4) & 0x1) == 0;

                            pcInfo.SecurityStatus = enabled ? (upToDate ? "有効・最新" : "有効・更新必要") : "無効";
                            break;
                        }
                    }
                }
            }
            catch { }

            // SecurityCenter2で検出できない場合、サービスとレジストリから検出
            if (string.IsNullOrEmpty(pcInfo.SecuritySoftware))
            {
                try
                {
                    // Trend Micro検出（Apex One, ウイルスバスター Corp等）
                    var trendMicroServices = new[]
                    {
                        ("Trend Micro Apex One", "ntrtscan"),
                        ("Trend Micro Security Agent", "TmListen"),
                        ("Trend Micro Deep Security Agent", "ds_agent"),
                        ("ウイルスバスター Corp.", "TmProxy"),
                        ("Trend Micro Worry-Free", "TMBMSRV")
                    };

                    foreach (var (name, serviceName) in trendMicroServices)
                    {
                        using (var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_Service WHERE Name='{serviceName}'"))
                        {
                            foreach (ManagementObject obj in searcher.Get())
                            {
                                string state = obj["State"]?.ToString();
                                pcInfo.SecuritySoftware = name;
                                pcInfo.SecurityStatus = state == "Running" ? "有効" : "無効";
                                break;
                            }
                        }
                        if (!string.IsNullOrEmpty(pcInfo.SecuritySoftware)) break;
                    }

                    // 他のエンタープライズセキュリティソフト
                    if (string.IsNullOrEmpty(pcInfo.SecuritySoftware))
                    {
                        var otherSecurityServices = new[]
                        {
                            ("CrowdStrike Falcon", "CSFalconService"),
                            ("Carbon Black", "CbDefense"),
                            ("Cylance", "CylanceSvc"),
                            ("SentinelOne", "SentinelAgent"),
                            ("Sophos Endpoint", "Sophos Endpoint Defense Service"),
                            ("ESET Endpoint Security", "ekrn"),
                            ("Symantec Endpoint Protection", "SepMasterService"),
                            ("McAfee Endpoint Security", "mfemms")
                        };

                        foreach (var (name, serviceName) in otherSecurityServices)
                        {
                            using (var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_Service WHERE Name='{serviceName}'"))
                            {
                                foreach (ManagementObject obj in searcher.Get())
                                {
                                    string state = obj["State"]?.ToString();
                                    pcInfo.SecuritySoftware = name;
                                    pcInfo.SecurityStatus = state == "Running" ? "有効" : "無効";
                                    break;
                                }
                            }
                            if (!string.IsNullOrEmpty(pcInfo.SecuritySoftware)) break;
                        }
                    }
                }
                catch { }
            }

            // Windows Defender状態
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows Defender"))
                {
                    if (key != null)
                    {
                        using (var realTimeKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows Defender\Real-Time Protection"))
                        {
                            if (realTimeKey != null)
                            {
                                int disabled = Convert.ToInt32(realTimeKey.GetValue("DisableRealtimeMonitoring") ?? 0);
                                pcInfo.WindowsDefenderStatus = disabled == 0 ? "有効" : "無効";
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(pcInfo.WindowsDefenderStatus))
                {
                    pcInfo.WindowsDefenderStatus = "確認不可";
                }
            }
            catch
            {
                pcInfo.WindowsDefenderStatus = "確認不可";
            }

            // ファイアウォール状態
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\StandardProfile"))
                {
                    if (key != null)
                    {
                        int enabled = Convert.ToInt32(key.GetValue("EnableFirewall") ?? 0);
                        pcInfo.FirewallEnabled = enabled == 1;
                    }
                }
            }
            catch
            {
                pcInfo.FirewallEnabled = null;
            }

            // BitLocker状態
            try
            {
                using (var searcher = new ManagementObjectSearcher(@"root\CIMV2\Security\MicrosoftVolumeEncryption", "SELECT * FROM Win32_EncryptableVolume WHERE DriveLetter='C:'"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        int status = Convert.ToInt32(obj["ProtectionStatus"] ?? 0);
                        pcInfo.BitlockerEnabled = status == 1;
                        break;
                    }
                }
            }
            catch
            {
                pcInfo.BitlockerEnabled = null;
            }

            // 最終Windows Update日
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_QuickFixEngineering"))
                {
                    DateTime? latestUpdate = null;
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string installedOn = obj["InstalledOn"]?.ToString();
                        if (DateTime.TryParse(installedOn, out DateTime date))
                        {
                            if (!latestUpdate.HasValue || date > latestUpdate.Value)
                            {
                                latestUpdate = date;
                            }
                        }
                    }
                    pcInfo.LastWindowsUpdate = latestUpdate;
                }
            }
            catch { }
        }

        public void CollectNetworkInfo(PcInfo pcInfo)
        {
            // ローカルIP・MACアドレス
            try
            {
                foreach (NetworkInterface ni in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (ni.OperationalStatus == OperationalStatus.Up &&
                        ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                    {
                        var ipProps = ni.GetIPProperties();

                        foreach (var addr in ipProps.UnicastAddresses)
                        {
                            if (addr.Address.AddressFamily == AddressFamily.InterNetwork)
                            {
                                pcInfo.IpAddressLocal = addr.Address.ToString();
                                pcInfo.MacAddress = string.Join(":", ni.GetPhysicalAddress().GetAddressBytes().Select(b => b.ToString("X2")));
                                pcInfo.NetworkAdapter = ni.Description;
                                pcInfo.ConnectionType = ni.NetworkInterfaceType.ToString();

                                // DNSサーバー
                                var dnsAddresses = ipProps.DnsAddresses.Where(d => d.AddressFamily == AddressFamily.InterNetwork);
                                pcInfo.DnsServers = string.Join(", ", dnsAddresses);

                                break;
                            }
                        }

                        if (!string.IsNullOrEmpty(pcInfo.IpAddressLocal))
                            break;
                    }
                }
            }
            catch { }

            // グローバルIP
            try
            {
                using (var client = new WebClient())
                {
                    client.Headers.Add("User-Agent", "PcCheck/1.0");
                    pcInfo.IpAddressGlobal = client.DownloadString("https://api.ipify.org").Trim();
                }
            }
            catch
            {
                pcInfo.IpAddressGlobal = "取得失敗";
            }
        }

        public void CollectSoftwareInfo(PcInfo pcInfo)
        {
            // Office情報
            try
            {
                string[] officeKeys = new[]
                {
                    @"SOFTWARE\Microsoft\Office\ClickToRun\Configuration",
                    @"SOFTWARE\Microsoft\Office\16.0\Common\InstallRoot",
                    @"SOFTWARE\Microsoft\Office\15.0\Common\InstallRoot"
                };

                foreach (string keyPath in officeKeys)
                {
                    using (var key = Registry.LocalMachine.OpenSubKey(keyPath))
                    {
                        if (key != null)
                        {
                            pcInfo.OfficeProduct = key.GetValue("ProductReleaseIds")?.ToString();
                            pcInfo.OfficeVersion = key.GetValue("VersionToReport")?.ToString();
                            break;
                        }
                    }
                }
            }
            catch { }

            // インストール済みソフトウェア
            try
            {
                string[] registryKeys = new[]
                {
                    @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                    @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
                };

                var softwareList = new HashSet<string>();

                foreach (string registryKey in registryKeys)
                {
                    using (var key = Registry.LocalMachine.OpenSubKey(registryKey))
                    {
                        if (key == null) continue;

                        foreach (string subKeyName in key.GetSubKeyNames())
                        {
                            using (var subKey = key.OpenSubKey(subKeyName))
                            {
                                string name = subKey?.GetValue("DisplayName")?.ToString();
                                if (string.IsNullOrEmpty(name)) continue;
                                if (softwareList.Contains(name)) continue;

                                softwareList.Add(name);
                                pcInfo.InstalledSoftware.Add(new SoftwareInfo
                                {
                                    Name = name,
                                    Version = subKey.GetValue("DisplayVersion")?.ToString(),
                                    Publisher = subKey.GetValue("Publisher")?.ToString(),
                                    InstallDate = subKey.GetValue("InstallDate")?.ToString()
                                });
                            }
                        }
                    }
                }

                // 名前順にソート
                pcInfo.InstalledSoftware = pcInfo.InstalledSoftware.OrderBy(s => s.Name).ToList();
            }
            catch { }

            // ブラウザ情報
            try
            {
                // Chrome - 複数のインストールパスをチェック
                string[] chromePaths = new[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
                };
                foreach (string chromePath in chromePaths)
                {
                    if (File.Exists(chromePath))
                    {
                        var version = System.Diagnostics.FileVersionInfo.GetVersionInfo(chromePath);
                        pcInfo.Browsers.Add(new BrowserInfo { Name = "Google Chrome", Version = version.FileVersion });
                        break;
                    }
                }

                // Edge - 複数のインストールパスをチェック
                string[] edgePaths = new[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe")
                };
                foreach (string edgePath in edgePaths)
                {
                    if (File.Exists(edgePath))
                    {
                        var version = System.Diagnostics.FileVersionInfo.GetVersionInfo(edgePath);
                        pcInfo.Browsers.Add(new BrowserInfo { Name = "Microsoft Edge", Version = version.FileVersion });
                        break;
                    }
                }

                // Firefox - 複数のインストールパスをチェック
                string[] firefoxPaths = new[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Mozilla Firefox\firefox.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Mozilla Firefox\firefox.exe")
                };
                foreach (string firefoxPath in firefoxPaths)
                {
                    if (File.Exists(firefoxPath))
                    {
                        var version = System.Diagnostics.FileVersionInfo.GetVersionInfo(firefoxPath);
                        pcInfo.Browsers.Add(new BrowserInfo { Name = "Mozilla Firefox", Version = version.FileVersion });
                        break;
                    }
                }

                // Brave
                string bravePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    @"BraveSoftware\Brave-Browser\Application\brave.exe");
                if (File.Exists(bravePath))
                {
                    var version = System.Diagnostics.FileVersionInfo.GetVersionInfo(bravePath);
                    pcInfo.Browsers.Add(new BrowserInfo { Name = "Brave", Version = version.FileVersion });
                }

                // デフォルトブラウザ判定
                try
                {
                    using (var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice"))
                    {
                        string progId = key?.GetValue("ProgId")?.ToString() ?? "";
                        foreach (var browser in pcInfo.Browsers)
                        {
                            if (progId.Contains("Chrome") && !progId.Contains("Edge")) browser.IsDefault = browser.Name.Contains("Chrome");
                            else if (progId.Contains("Edge") || progId.Contains("MSEdge")) browser.IsDefault = browser.Name.Contains("Edge");
                            else if (progId.Contains("Firefox")) browser.IsDefault = browser.Name.Contains("Firefox");
                            else if (progId.Contains("Brave")) browser.IsDefault = browser.Name.Contains("Brave");
                        }
                    }
                }
                catch { }
            }
            catch { }
        }
    }
}
