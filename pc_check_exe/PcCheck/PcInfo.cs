using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace PcCheck
{
    public class PcInfo
    {
        // 基本情報
        [JsonProperty("pc_name")]
        public string PcName { get; set; }

        [JsonProperty("user_name")]
        public string UserName { get; set; }

        [JsonProperty("domain_name")]
        public string DomainName { get; set; }

        [JsonProperty("branch_name")]
        public string BranchName { get; set; }

        // OS情報
        [JsonProperty("os_name")]
        public string OsName { get; set; }

        [JsonProperty("os_version")]
        public string OsVersion { get; set; }

        [JsonProperty("os_edition")]
        public string OsEdition { get; set; }

        [JsonProperty("os_build")]
        public string OsBuild { get; set; }

        [JsonProperty("os_install_date")]
        public DateTime? OsInstallDate { get; set; }

        [JsonProperty("os_license_status")]
        public string OsLicenseStatus { get; set; }

        [JsonProperty("last_boot_time")]
        public DateTime? LastBootTime { get; set; }

        // ハードウェア情報
        [JsonProperty("cpu_name")]
        public string CpuName { get; set; }

        [JsonProperty("cpu_cores")]
        public int? CpuCores { get; set; }

        [JsonProperty("cpu_threads")]
        public int? CpuThreads { get; set; }

        [JsonProperty("cpu_max_clock")]
        public string CpuMaxClock { get; set; }

        [JsonProperty("memory_total_gb")]
        public decimal? MemoryTotalGb { get; set; }

        [JsonProperty("memory_type")]
        public string MemoryType { get; set; }

        [JsonProperty("memory_slots")]
        public string MemorySlots { get; set; }

        [JsonProperty("gpu_name")]
        public string GpuName { get; set; }

        [JsonProperty("motherboard")]
        public string Motherboard { get; set; }

        [JsonProperty("bios_version")]
        public string BiosVersion { get; set; }

        [JsonProperty("serial_number")]
        public string SerialNumber { get; set; }

        [JsonProperty("manufacturer")]
        public string Manufacturer { get; set; }

        [JsonProperty("model")]
        public string Model { get; set; }

        // ストレージ情報
        [JsonProperty("storage_info")]
        public List<StorageInfo> StorageInfo { get; set; } = new List<StorageInfo>();

        // ネットワーク情報
        [JsonProperty("ip_address_local")]
        public string IpAddressLocal { get; set; }

        [JsonProperty("ip_address_global")]
        public string IpAddressGlobal { get; set; }

        [JsonProperty("mac_address")]
        public string MacAddress { get; set; }

        [JsonProperty("network_adapter")]
        public string NetworkAdapter { get; set; }

        [JsonProperty("dns_servers")]
        public string DnsServers { get; set; }

        [JsonProperty("connection_type")]
        public string ConnectionType { get; set; }

        // Office情報
        [JsonProperty("office_version")]
        public string OfficeVersion { get; set; }

        [JsonProperty("office_product")]
        public string OfficeProduct { get; set; }

        [JsonProperty("office_license")]
        public string OfficeLicense { get; set; }

        // セキュリティ情報
        [JsonProperty("security_software")]
        public string SecuritySoftware { get; set; }

        [JsonProperty("security_version")]
        public string SecurityVersion { get; set; }

        [JsonProperty("security_status")]
        public string SecurityStatus { get; set; }

        [JsonProperty("security_definition_date")]
        public DateTime? SecurityDefinitionDate { get; set; }

        [JsonProperty("security_license_expiry")]
        public DateTime? SecurityLicenseExpiry { get; set; }

        [JsonProperty("windows_defender_status")]
        public string WindowsDefenderStatus { get; set; }

        [JsonProperty("firewall_enabled")]
        public bool? FirewallEnabled { get; set; }

        [JsonProperty("bitlocker_enabled")]
        public bool? BitlockerEnabled { get; set; }

        // Windows Update
        [JsonProperty("last_windows_update")]
        public DateTime? LastWindowsUpdate { get; set; }

        // インストール済みソフトウェア
        [JsonProperty("installed_software")]
        public List<SoftwareInfo> InstalledSoftware { get; set; } = new List<SoftwareInfo>();

        // ブラウザ情報
        [JsonProperty("browsers")]
        public List<BrowserInfo> Browsers { get; set; } = new List<BrowserInfo>();

        // 収集日時
        [JsonProperty("collected_at")]
        public DateTime CollectedAt { get; set; } = DateTime.UtcNow;
    }

    public class StorageInfo
    {
        [JsonProperty("drive")]
        public string Drive { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("total_gb")]
        public decimal TotalGb { get; set; }

        [JsonProperty("free_gb")]
        public decimal FreeGb { get; set; }

        [JsonProperty("model")]
        public string Model { get; set; }
    }

    public class SoftwareInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("publisher")]
        public string Publisher { get; set; }

        [JsonProperty("install_date")]
        public string InstallDate { get; set; }
    }

    public class BrowserInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("is_default")]
        public bool IsDefault { get; set; }
    }
}
