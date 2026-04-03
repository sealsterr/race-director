using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using rF2SharedMemoryNet;
using rF2SharedMemoryNet.RF2Data.Structs;

var intervalMs = ParseInterval(args);
using var reader = new RF2MemoryReader(enableDMA: true);
var jsonOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
};

while (true)
{
    Console.WriteLine(JsonSerializer.Serialize(ReadSnapshot(reader), jsonOptions));
    await Task.Delay(intervalMs);
}

static int ParseInterval(string[] args)
{
    if (args.Length > 0 && int.TryParse(args[0], out var parsed) && parsed >= 16)
    {
        return parsed;
    }

    return 33;
}

static TelemetrySnapshot ReadSnapshot(RF2MemoryReader reader)
{
    try
    {
        var scoring = reader.GetScoring();
        var telemetry = reader.GetTelemetry();

        if (scoring is null || telemetry is null)
        {
            return TelemetrySnapshot.Empty;
        }

        var scoringValue = scoring.Value;
        var telemetryValue = telemetry.Value;
        var electronics = reader.GetLMUElectronics();
        var telemetryById = telemetryValue.Vehicles
            .Take(telemetryValue.NumVehicles)
            .ToDictionary(vehicle => vehicle.ID);

        var cars = new List<TelemetryCarSnapshot>();

        foreach (var scoredVehicle in scoringValue.Vehicles.Take(scoringValue.ScoringInfo.NumVehicles))
        {
            if (!telemetryById.TryGetValue(scoredVehicle.ID, out var telemetryVehicle))
            {
                continue;
            }

            cars.Add(new TelemetryCarSnapshot(
                scoredVehicle.ID,
                CleanBuffer(scoredVehicle.DriverName),
                CleanBuffer(scoredVehicle.VehicleName),
                ExtractCarNumber(CleanBuffer(scoredVehicle.VehicleName)),
                ToFuelPercentage(telemetryVehicle),
                ToBatteryPercentage(telemetryVehicle),
                ToGear(telemetryVehicle),
                ToSpeedKph(telemetryVehicle),
                telemetryVehicle.EngineRPM,
                ToControlPercentage(telemetryVehicle.FilteredThrottle),
                ToControlPercentage(telemetryVehicle.FilteredBrake),
                NormalizeCompound(CleanBuffer(telemetryVehicle.FrontTyreCompoundName)),
                NormalizeCompound(CleanBuffer(telemetryVehicle.RearTyreCompoundName)),
                electronics?.EngineMap
            ));
        }

        return new TelemetrySnapshot(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), cars, null);
    }
    catch (Exception ex)
    {
        return new TelemetrySnapshot(
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Array.Empty<TelemetryCarSnapshot>(),
            ex.Message
        );
    }
}

static string CleanBuffer(byte[] value)
{
    if (value.Length == 0)
    {
        return string.Empty;
    }

    return Encoding.UTF8.GetString(value).Replace("\0", string.Empty).Trim();
}

static string ExtractCarNumber(string vehicleName)
{
    var match = Regex.Match(vehicleName, "#(?<car>[A-Za-z0-9]+)");
    return match.Success ? match.Groups["car"].Value : string.Empty;
}

static double? ToFuelPercentage(VehicleTelemetry vehicle)
{
    if (vehicle.FuelCapacity <= 0)
    {
        return null;
    }

    var percentage = (vehicle.Fuel / vehicle.FuelCapacity) * 100d;
    return Math.Clamp(percentage, 0d, 100d);
}

static double? ToBatteryPercentage(VehicleTelemetry vehicle)
{
    if (vehicle.BatteryChargeFraction < 0)
    {
        return null;
    }

    return Math.Clamp(vehicle.BatteryChargeFraction * 100d, 0d, 100d);
}

static int? ToGear(VehicleTelemetry vehicle)
{
    var type = vehicle.GetType();

    foreach (var name in new[] { "Gear", "CurrentGear" })
    {
        var field = type.GetField(name);
        if (field?.GetValue(vehicle) is IConvertible fieldValue)
        {
            return Convert.ToInt32(fieldValue);
        }

        var property = type.GetProperty(name);
        if (property?.GetValue(vehicle) is IConvertible propertyValue)
        {
            return Convert.ToInt32(propertyValue);
        }
    }

    return null;
}

static double ToSpeedKph(VehicleTelemetry vehicle)
{
    var velocity = vehicle.LocalVelocity;
    var speedMps = Math.Sqrt(
        velocity.X * velocity.X +
        velocity.Y * velocity.Y +
        velocity.Z * velocity.Z
    );
    return Math.Max(0d, speedMps * 3.6d);
}

static double ToControlPercentage(double raw)
{
    return Math.Clamp(raw * 100d, 0d, 100d);
}

static string NormalizeCompound(string raw)
{
    var value = raw.ToUpperInvariant();

    if (value.Contains("SOFT"))
    {
        return "SOFT";
    }

    if (value.Contains("MED"))
    {
        return "MEDIUM";
    }

    if (value.Contains("HARD"))
    {
        return "HARD";
    }

    if (value.Contains("WET") || value.Contains("INTER"))
    {
        return "WET";
    }

    return "UNKNOWN";
}

internal sealed record TelemetrySnapshot(
    long Timestamp,
    IReadOnlyList<TelemetryCarSnapshot> Cars,
    string? Error
)
{
    public static TelemetrySnapshot Empty =>
        new(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), Array.Empty<TelemetryCarSnapshot>(), null);
}

internal sealed record TelemetryCarSnapshot(
    int Id,
    string DriverName,
    string VehicleName,
    string CarNumber,
    double? FuelPercentage,
    double? BatteryChargePercentage,
    int? Gear,
    double SpeedKph,
    double Rpm,
    double Throttle,
    double Brake,
    string FrontTyreCompound,
    string RearTyreCompound,
    int? EngineMap
);
