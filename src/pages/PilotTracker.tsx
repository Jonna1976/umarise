import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Download, 
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  Target,
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getActiveDeviceId } from "@/lib/deviceId";

interface RetrievalTest {
  id: string;
  team: string;
  originId: string;
  prompt: string;
  timeSeconds: number;
  success: boolean | null;
  doubt: boolean;
  matchType: "cue" | "text" | "entity" | "semantic" | null;
  originalFirst: boolean;
  timestamp: string;
}

const TEAMS = ["Team A", "Team B", "Team C"];
const MATCH_TYPES = ["cue", "text", "entity", "semantic"] as const;

// Search telemetry data from database
interface SearchTelemetryRow {
  id: string;
  query: string;
  result_count: number;
  selected_page_id: string | null;
  selected_rank: number | null;
  time_to_select_ms: number | null;
  found_it_confirmed: boolean;
  created_at: string;
  time_filter_used: string | null;
}

export default function PilotTracker() {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'manual' | 'telemetry'>('telemetry');
  
  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Form state
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [originId, setOriginId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [matchType, setMatchType] = useState<string>("");
  const [doubt, setDoubt] = useState(false);
  const [originalFirst, setOriginalFirst] = useState(true);
  
  // Tests state (manual tests)
  const [tests, setTests] = useState<RetrievalTest[]>(() => {
    const saved = localStorage.getItem("pilot-tracker-tests");
    return saved ? JSON.parse(saved) : [];
  });

  // Search telemetry state (from database)
  const [telemetry, setTelemetry] = useState<SearchTelemetryRow[]>([]);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  // Load telemetry data from database
  useEffect(() => {
    const loadTelemetry = async () => {
      const deviceUserId = getActiveDeviceId();
      if (!deviceUserId) return;

      setIsLoadingTelemetry(true);
      try {
        const { data, error } = await supabase
          .from('search_telemetry')
          .select('*')
          .eq('device_user_id', deviceUserId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          setTelemetry(data as SearchTelemetryRow[]);
        }
      } catch (err) {
        console.error('Failed to load telemetry:', err);
      } finally {
        setIsLoadingTelemetry(false);
      }
    };

    loadTelemetry();
  }, []);

  // Stopwatch logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
  };

  const saveTest = (success: boolean) => {
    if (!selectedTeam || !originId || !prompt) {
      return;
    }

    const newTest: RetrievalTest = {
      id: crypto.randomUUID(),
      team: selectedTeam,
      originId,
      prompt,
      timeSeconds: Math.round(elapsedTime / 100) / 10,
      success,
      doubt,
      matchType: success ? (matchType as RetrievalTest["matchType"]) : null,
      originalFirst: success ? originalFirst : false,
      timestamp: new Date().toISOString(),
    };

    setTests((prev) => [...prev, newTest]);
    
    // Reset form
    setOriginId("");
    setPrompt("");
    setMatchType("");
    setDoubt(false);
    setOriginalFirst(true);
    resetStopwatch();
  };

  const deleteTest = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  const exportToCSV = () => {
    const headers = [
      "Team",
      "Origin ID",
      "Prompt",
      "Time (sec)",
      "Success",
      "Doubt",
      "Match Type",
      "Original First",
      "Timestamp"
    ];

    const rows = tests.map((t) => [
      t.team,
      t.originId,
      t.prompt,
      t.timeSeconds,
      t.success ? "Yes" : "No",
      t.doubt ? "Yes" : "No",
      t.matchType || "-",
      t.originalFirst ? "Yes" : "No",
      t.timestamp
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilot-tracker-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save to localStorage for manual tests
  useEffect(() => {
    localStorage.setItem("pilot-tracker-tests", JSON.stringify(tests));
  }, [tests]);

  // Calculate metrics for manual tests
  const totalTests = tests.length;
  const successfulTests = tests.filter((t) => t.success).length;
  const testsWithin60s = tests.filter((t) => t.success && t.timeSeconds <= 60).length;
  const successRate = totalTests > 0 ? Math.round((testsWithin60s / totalTests) * 100) : 0;
  const passThreshold = 80;
  const isOnTrack = successRate >= passThreshold;

  const teamStats = TEAMS.map((team) => {
    const teamTests = tests.filter((t) => t.team === team);
    const teamSuccess = teamTests.filter((t) => t.success && t.timeSeconds <= 60).length;
    return {
      team,
      total: teamTests.length,
      success: teamSuccess,
      target: 10,
    };
  });

  // Calculate telemetry metrics (from actual search usage)
  const telemetryMetrics = {
    totalSearches: telemetry.length,
    searchesWithSelection: telemetry.filter(t => t.selected_page_id).length,
    searchesNoResults: telemetry.filter(t => t.result_count === 0).length,
    avgTimeToSelect: Math.round(
      telemetry
        .filter(t => t.time_to_select_ms)
        .reduce((sum, t) => sum + (t.time_to_select_ms || 0), 0) / 
      (telemetry.filter(t => t.time_to_select_ms).length || 1)
    ),
    top5Selections: telemetry.filter(t => t.selected_rank && t.selected_rank <= 5).length,
  };

  const telemetrySuccessRate = telemetryMetrics.totalSearches > 0
    ? Math.round((telemetryMetrics.searchesWithSelection / telemetryMetrics.totalSearches) * 100)
    : 0;

  const top5Rate = telemetryMetrics.searchesWithSelection > 0
    ? Math.round((telemetryMetrics.top5Selections / telemetryMetrics.searchesWithSelection) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pilot Tracker</h1>
              <p className="text-sm text-muted-foreground">
                21-Day MKB Proof Test — {totalTests}/30 tests
              </p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Tabs for Telemetry vs Manual */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'telemetry')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="telemetry" className="gap-2">
              <Search className="h-4 w-4" />
              Search Telemetry
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Clock className="h-4 w-4" />
              Manual Tests
            </TabsTrigger>
          </TabsList>

          {/* TELEMETRY TAB */}
          <TabsContent value="telemetry" className="space-y-6 mt-6">
            {/* Telemetry Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs">Selection Rate</span>
                  </div>
                  <div className={`text-2xl font-bold ${telemetrySuccessRate >= 80 ? "text-green-600" : telemetrySuccessRate >= 50 ? "text-amber-600" : "text-destructive"}`}>
                    {telemetrySuccessRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {telemetryMetrics.searchesWithSelection}/{telemetryMetrics.totalSearches} searches
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Top 5 Accuracy</span>
                  </div>
                  <div className={`text-2xl font-bold ${top5Rate >= 95 ? "text-green-600" : top5Rate >= 80 ? "text-amber-600" : "text-destructive"}`}>
                    {top5Rate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 95%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Avg Time to Select</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {(telemetryMetrics.avgTimeToSelect / 1000).toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Target: &lt;10s</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <X className="h-4 w-4" />
                    <span className="text-xs">No Results</span>
                  </div>
                  <div className={`text-2xl font-bold ${telemetryMetrics.searchesNoResults === 0 ? "text-green-600" : "text-amber-600"}`}>
                    {telemetryMetrics.searchesNoResults}
                  </div>
                  <p className="text-xs text-muted-foreground">Searches without matches</p>
                </CardContent>
              </Card>
            </div>

            {/* Hypothesis Status Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  80% Retrieval Hypothesis
                </CardTitle>
                <CardDescription>
                  Can users retrieve origins using only their assigned cues (without OCR text)?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${telemetrySuccessRate >= 80 ? "bg-green-600" : telemetrySuccessRate >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                        style={{ width: `${telemetrySuccessRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-primary font-medium">Target: 80%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <Badge 
                    variant={telemetrySuccessRate >= 80 ? "default" : "destructive"} 
                    className="text-lg px-4 py-2"
                  >
                    {telemetrySuccessRate >= 80 ? (
                      <><TrendingUp className="h-4 w-4 mr-2" /> PASS</>
                    ) : (
                      <><TrendingDown className="h-4 w-4 mr-2" /> NEEDS WORK</>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Search History Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Searches ({telemetry.length})</CardTitle>
                <CardDescription>
                  Actual user searches tracked automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTelemetry ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading telemetry...</p>
                  </div>
                ) : telemetry.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No searches recorded yet. Start searching origins to collect data.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Query</th>
                          <th className="text-left py-2 px-2">Results</th>
                          <th className="text-left py-2 px-2">Selected</th>
                          <th className="text-left py-2 px-2">Rank</th>
                          <th className="text-left py-2 px-2">Time</th>
                          <th className="text-left py-2 px-2">When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {telemetry.slice(0, 20).map((row) => (
                          <tr key={row.id} className="border-b last:border-0">
                            <td className="py-2 px-2 font-medium max-w-[150px] truncate">
                              "{row.query}"
                            </td>
                            <td className="py-2 px-2">
                              <Badge variant={row.result_count > 0 ? "outline" : "destructive"}>
                                {row.result_count}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {row.selected_page_id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {row.selected_rank ? (
                                <Badge variant={row.selected_rank <= 5 ? "default" : "secondary"}>
                                  #{row.selected_rank}
                                </Badge>
                              ) : "-"}
                            </td>
                            <td className="py-2 px-2">
                              {row.time_to_select_ms ? (
                                <span className={row.time_to_select_ms > 10000 ? "text-amber-600" : ""}>
                                  {(row.time_to_select_ms / 1000).toFixed(1)}s
                                </span>
                              ) : "-"}
                            </td>
                            <td className="py-2 px-2 text-muted-foreground text-xs">
                              {new Date(row.created_at).toLocaleDateString('nl-NL', { 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANUAL TESTS TAB */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            {/* Manual Test Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs">Success Rate</span>
                  </div>
                  <div className={`text-2xl font-bold ${isOnTrack ? "text-green-600" : "text-destructive"}`}>
                    {successRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Target: ≥80%</p>
                </CardContent>
              </Card>
          
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Within 60s</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {testsWithin60s}/{totalTests}
                  </div>
                  <p className="text-xs text-muted-foreground">≤60 sec retrievals</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Tests Done</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {totalTests}/30
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 30 total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Status</span>
                  </div>
                  <Badge variant={isOnTrack ? "default" : "destructive"} className="text-sm">
                    {isOnTrack ? "On Track" : "Below Target"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {successRate >= 80 ? "PASS criteria met" : `Need ${80 - successRate}% more`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Team Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {teamStats.map((stat) => (
                    <div key={stat.team} className="text-center">
                      <div className="text-lg font-semibold text-foreground">{stat.team}</div>
                      <div className="text-2xl font-bold text-primary">
                        {stat.success}/{stat.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Target: {stat.target} tests
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((stat.total / stat.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Test Form */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">New Retrieval Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stopwatch */}
                <div className="flex flex-col items-center py-4">
                  <motion.div 
                    className={`text-5xl font-mono font-bold ${
                      elapsedTime > 60000 ? "text-destructive" : "text-foreground"
                    }`}
                    animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                    transition={{ repeat: isRunning ? Infinity : 0, duration: 1 }}
                  >
                    {formatTime(elapsedTime)}
                  </motion.div>
                  {elapsedTime > 60000 && (
                    <Badge variant="destructive" className="mt-2">
                      Over 60 second limit!
                    </Badge>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="lg"
                      onClick={toggleStopwatch}
                      className="gap-2 min-w-[120px]"
                    >
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isRunning ? "Pause" : "Start"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={resetStopwatch}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Team</label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAMS.map((team) => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Origin ID</label>
                    <Input
                      placeholder="e.g., 1, 2, 3..."
                      value={originId}
                      onChange={(e) => setOriginId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Search Prompt</label>
                    <Input
                      placeholder='e.g., "klant voorstel"'
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Match Type</label>
                    <Select value={matchType} onValueChange={setMatchType}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did it match?" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-4">
                    <Button
                      variant={doubt ? "destructive" : "outline"}
                      onClick={() => setDoubt(!doubt)}
                      className="flex-1"
                    >
                      {doubt ? "Doubt: Yes" : "Doubt: No"}
                    </Button>
                    <Button
                      variant={originalFirst ? "default" : "outline"}
                      onClick={() => setOriginalFirst(!originalFirst)}
                      className="flex-1"
                    >
                      {originalFirst ? "Original First: Yes" : "Original First: No"}
                    </Button>
                  </div>
                </div>

                {/* Pass/Fail Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => saveTest(true)}
                    disabled={!selectedTeam || !originId || !prompt}
                  >
                    <Check className="h-5 w-5" />
                    PASS (Found within time)
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => saveTest(false)}
                    disabled={!selectedTeam || !originId || !prompt}
                  >
                    <X className="h-5 w-5" />
                    FAIL (Not found / Too slow)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test History ({tests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tests recorded yet. Start a retrieval test above.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Team</th>
                          <th className="text-left py-2 px-2">Origin</th>
                          <th className="text-left py-2 px-2">Prompt</th>
                          <th className="text-left py-2 px-2">Time</th>
                          <th className="text-left py-2 px-2">Result</th>
                          <th className="text-left py-2 px-2">Match</th>
                          <th className="text-left py-2 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.slice().reverse().map((test) => (
                          <tr key={test.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{test.team}</td>
                            <td className="py-2 px-2">{test.originId}</td>
                            <td className="py-2 px-2 max-w-[150px] truncate">{test.prompt}</td>
                            <td className="py-2 px-2">
                              <span className={test.timeSeconds > 60 ? "text-destructive" : ""}>
                                {test.timeSeconds}s
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <Badge variant={test.success ? "default" : "destructive"}>
                                {test.success ? "PASS" : "FAIL"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {test.matchType ? (
                                <Badge variant="outline">{test.matchType}</Badge>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTest(test.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
