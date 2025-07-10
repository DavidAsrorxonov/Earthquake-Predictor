import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  AlertTriangle,
  Globe,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";

const EarthquakePredictorApp = () => {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchEarthquakeData();
  }, [selectedRegion, timeRange]);

  const fetchEarthquakeData = async () => {
    setLoading(true);
    try {
      const simulatedData = generateSimulatedData();
      setEarthquakeData(simulatedData);

      const predictionsData = generatePredictions(simulatedData);
      setPredictions(predictionsData);

      const risk = calculateRiskAnalysis(simulatedData);
      setRiskAnalysis(risk);
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
    }
    setLoading(false);
  };

  const generateSimulatedData = () => {
    const data = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const numQuakes = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < numQuakes; j++) {
        data.push({
          id: `eq-${i}-${j}`,
          date: date.toISOString().split("T")[0],
          magnitude: (Math.random() * 6 + 2).toFixed(1),
          depth: Math.floor(Math.random() * 100 + 5),
          location: getRandomLocation(),
          latitude: (Math.random() * 180 - 90).toFixed(3),
          longitude: (Math.random() * 360 - 180).toFixed(3),
          timestamp: date.getTime(),
        });
      }
    }

    return data.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getRandomLocation = () => {
    const locations = [
      "Southern California",
      "Japan",
      "Chile",
      "Alaska",
      "Turkey",
      "Indonesia",
      "Mexico",
      "Greece",
      "New Zealand",
      "Philippines",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const generatePredictions = (historicalData) => {
    const predictions = [];
    const regions = {};

    historicalData.forEach((eq) => {
      if (!regions[eq.location]) {
        regions[eq.location] = [];
      }
      regions[eq.location].push(parseFloat(eq.magnitude));
    });

    Object.entries(regions).forEach(([location, magnitudes]) => {
      const avgMagnitude =
        magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
      const frequency = magnitudes.length;

      let riskLevel = "Low";
      let probability = Math.min(frequency * 5 + avgMagnitude * 10, 85);

      if (probability > 60) riskLevel = "High";
      else if (probability > 30) riskLevel = "Medium";

      predictions.push({
        location,
        predictedMagnitude: avgMagnitude.toFixed(1),
        probability: probability.toFixed(1),
        riskLevel,
        timeframe: "7-30 days",
        confidence: Math.min(frequency * 15, 95),
      });
    });

    return predictions.sort((a, b) => b.probability - a.probability);
  };

  const calculateRiskAnalysis = (data) => {
    const totalQuakes = data.length;
    const highMagnitude = data.filter(
      (eq) => parseFloat(eq.magnitude) >= 5.0
    ).length;
    const recentQuakes = data.filter((eq) => {
      const daysDiff = (Date.now() - eq.timestamp) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      totalEarthquakes: totalQuakes,
      highMagnitudeCount: highMagnitude,
      recentActivity: recentQuakes,
      overallRisk:
        highMagnitude > 5 ? "High" : recentQuakes > 10 ? "Medium" : "Low",
      trend: recentQuakes > totalQuakes * 0.3 ? "Increasing" : "Stable",
    };
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const chartData = earthquakeData
    .reduce((acc, eq) => {
      const date = eq.date;
      const existing = acc.find((item) => item.date === date);

      if (existing) {
        existing.count += 1;
        existing.avgMagnitude =
          (existing.avgMagnitude * (existing.count - 1) +
            parseFloat(eq.magnitude)) /
          existing.count;
      } else {
        acc.push({
          date,
          count: 1,
          avgMagnitude: parseFloat(eq.magnitude),
        });
      }

      return acc;
    }, [])
    .slice(-14);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Earthquake Predictor
              </h1>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="global">Global</option>
                <option value="pacific">Pacific Ring of Fire</option>
                <option value="california">California</option>
                <option value="japan">Japan</option>
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {riskAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Earthquakes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {riskAnalysis.totalEarthquakes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    High Magnitude (5.0+)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {riskAnalysis.highMagnitudeCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Recent Activity
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {riskAnalysis.recentActivity}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Overall Risk
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      getRiskColor(riskAnalysis.overallRisk).split(" ")[0]
                    }`}
                  >
                    {riskAnalysis.overallRisk}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Earthquake Frequency Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Magnitude vs Depth Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={earthquakeData.slice(0, 50)}>
                <CartesianGrid />
                <XAxis dataKey="magnitude" name="Magnitude" />
                <YAxis dataKey="depth" name="Depth (km)" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter dataKey="depth" fill="#EF4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              AI-Powered Predictions
            </h3>
            <p className="text-sm text-gray-600">
              Based on historical patterns and seismic activity analysis
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.slice(0, 6).map((pred, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                        pred.riskLevel
                      )}`}
                    >
                      {pred.riskLevel} Risk
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {pred.location}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Predicted Magnitude:{" "}
                      <span className="font-medium">
                        {pred.predictedMagnitude}
                      </span>
                    </p>
                    <p>
                      Probability:{" "}
                      <span className="font-medium">{pred.probability}%</span>
                    </p>
                    <p>
                      Timeframe:{" "}
                      <span className="font-medium">{pred.timeframe}</span>
                    </p>
                    <p>
                      Confidence:{" "}
                      <span className="font-medium">{pred.confidence}%</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Earthquakes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Magnitude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earthquakeData.slice(0, 10).map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eq.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eq.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parseFloat(eq.magnitude) >= 5.0
                            ? "bg-red-100 text-red-800"
                            : parseFloat(eq.magnitude) >= 3.0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {eq.magnitude}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eq.depth} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eq.latitude}, {eq.longitude}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Important Disclaimer
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                This earthquake prediction system is for educational and
                research purposes only. Earthquake prediction is an extremely
                complex scientific challenge, and no system can guarantee
                accurate predictions. Always rely on official geological surveys
                and emergency services for authoritative earthquake information
                and safety guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakePredictorApp;
