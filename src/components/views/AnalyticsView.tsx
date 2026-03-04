import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { materials, categories, type MaterialCategory } from "@/lib/market-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function AnalyticsView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Raw Materials");

  const categoryMaterials = useMemo(
    () => materials.filter(m => m.category === selectedCategory),
    [selectedCategory]
  );

  const priceHistoryData = useMemo(() => {
    const mat = categoryMaterials[0];
    if (!mat) return [];
    return mat.priceHistory.slice(-14).map(p => ({ date: p.date.slice(5), price: p.price }));
  }, [categoryMaterials]);

  const comparisonData = useMemo(
    () => categoryMaterials.slice(0, 8).map(m => ({ name: m.name.split(" ").slice(0, 2).join(" "), price: m.currentPrice, change: m.priceChange })),
    [categoryMaterials]
  );

  const pieData = useMemo(
    () => categoryMaterials.slice(0, 6).map(m => ({ name: m.name.split(" ")[0], value: m.currentPrice })),
    [categoryMaterials]
  );

  const trendData = useMemo(() => {
    if (!categoryMaterials[0]) return [];
    return categoryMaterials[0].priceHistory.slice(-14).map(p => ({ date: p.date.slice(5), value: p.price }));
  }, [categoryMaterials]);

  const chartConfig = {
    price: { label: "Price (₹)", color: "hsl(var(--primary))" },
    value: { label: "Value (₹)", color: "hsl(var(--accent))" },
    change: { label: "Change %", color: "#10b981" },
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Market price trends & insights</p>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price History Line Chart */}
      <Card variant="glass" className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Price History — {categoryMaterials[0]?.name || ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={priceHistoryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Material Comparison Bar Chart */}
      <Card variant="glass" className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Material Price Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} className="fill-muted-foreground" angle={-20} />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="price" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Trend Area Chart */}
      <Card variant="glass" className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown Pie */}
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Price Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-[220px] w-[280px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
