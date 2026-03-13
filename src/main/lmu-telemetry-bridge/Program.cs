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
    if (args.Length > 0 && int.TryParse(args[0], out var parsed) && parsed >= 50)
    {
        return parsed;
    }

    return 200;
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
                NormalizeCompound(CleanBuffer(telemetryVehicle.FrontTyreCompoundName)),
                NormalizeCompound(CleanBuffer(telemetryVehicle.RearTyreCompoundName))
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
    string FrontTyreCompound,
    string RearTyreCompound
);
