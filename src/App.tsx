import { useState, useEffect } from 'react';
import './App.css';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import tariffData from './tariffData.ts';
import { Table, TableBody, TableCell, TableRow, } from "@/components/ui/table";

const chartConfigStack = {
  lifelineUnits: {
  label: "lifeline Units",
  color: "hsl(var(--chart-1))",
},
tier2Units: {
  label: "tier2 Units",
  color: "hsl(var(--chart-2))",
},
tier3Units: {
  label: "tier3 Units",
  color: "hsl(var(--chart-3))",
},
tier4Units: {
  label: "tier4 Units",
  color: "hsl(var(--chart-4))",
},
} satisfies ChartConfig
  
function App() {
  const [amountPaid, setAmountPaid] = useState<number>(10000);
  const [isFirstPurchaseOfMonth, setIsFirstPurchaseOfMonth] = useState<boolean>(true);
  const [result, setResult] = useState<any>(null);
  const [infoMessage, setInfoMessage] = useState<string>(""); // To hold the informational message

  const calculateUnitsForAmount = (
    amount: number,
    lifelineTariff: number,
    tier2Tariff: number,
    tier3Tariff: number,
    tier4Tariff: number,
    isFirstPurchaseOfMonth: boolean = false
  ) => {
    // Define the maximum units for each tier
    const lifelineMaxUnits = 15;
    const tier2MaxUnits = 80;
    const tier3MaxUnits = 150;
  
    // Initialize variables to store the number of units for each tier
    let lifelineUnits = 0;
    let tier2Units = 0;
    let tier3Units = 0;
    let tier4Units = 0;
    let totalUnits = 0;
  
    //Deduct vat and service fee
    const vatPercentage = 0.18
    const vatAmount = amount * vatPercentage
    const formattedVatAmount = Number(vatAmount.toFixed(2)).toLocaleString();

    const amountAfterVat = amountPaid - vatAmount
    const formattedAmountAfterVat = Number(amountAfterVat.toFixed(2)).toLocaleString(); // Format Amount after VAT

    const monthlyServiceFee = isFirstPurchaseOfMonth ? 3360 : 0  // Adjust service fee based on first purchase of the month
    const amountAfterServiceFee =  amountAfterVat - monthlyServiceFee
    const formattedAmountAfterServiceFee = Number(amountAfterServiceFee.toFixed(2)).toLocaleString(); // Format Amount after Service Fee

    // Calculate the number of units and amount for each tier
    let remainingAmount = amountAfterServiceFee > 0 ? amountAfterServiceFee : 0;

    if (isFirstPurchaseOfMonth) {
      // First-time purchase, use the Lifeline tariff for the first 15 units
      lifelineUnits = Math.min(lifelineMaxUnits, remainingAmount / lifelineTariff);
      remainingAmount -= lifelineUnits * lifelineTariff;
    } else {
      // For non-first purchases, treat the first 15 units as Normal tariff
      const normalUnitsForFirst15 = Math.min(lifelineMaxUnits, remainingAmount / tier2Tariff);
      lifelineUnits = normalUnitsForFirst15;  // Charge first 15 units at Normal tariff
      remainingAmount -= normalUnitsForFirst15 * tier2Tariff;
    }
  
    // Calculate the remaining amount for the second tier (16 - 80)
    if (remainingAmount > 0) {
      tier2Units = Math.min(tier2MaxUnits - lifelineMaxUnits, remainingAmount / tier2Tariff);
      remainingAmount -= tier2Units * tier2Tariff;
    }
  
    // Calculate the remaining amount for the third tier (81 - 150)
    if (remainingAmount > 0) {
      tier3Units = Math.min(tier3MaxUnits - tier2MaxUnits, remainingAmount / tier3Tariff);
      remainingAmount -= tier3Units * tier3Tariff;
    }
  
    // The remaining amount is charged at tier 4 tariff (above 150 units)
    if (remainingAmount > 0) {
      tier4Units = remainingAmount / tier4Tariff;
      remainingAmount -= tier4Units * tier4Tariff;
    }
  
    // Calculate total units
    totalUnits = lifelineUnits + tier2Units + tier3Units + tier4Units;
  
    // Return the results
    return {
      vatAmount:formattedVatAmount,
      amountAfterVat: formattedAmountAfterVat,
      amountAfterServiceFee: formattedAmountAfterServiceFee,
      rawAmountAfterServiceFee: amountAfterServiceFee,
      lifelineUnits: lifelineUnits.toFixed(2),  // Two decimal places for lifeline units
      tier2Units: Number(tier2Units).toFixed(2),  // Two decimal places for tier2 units
      tier3Units: Number(tier3Units).toFixed(2),  // Two decimal places for tier3 units
      tier4Units: Number(tier4Units).toFixed(2),  // Two decimal places for tier4 units
      totalUnits: Number(totalUnits).toFixed(2)
    };
  };
    
    
  const calculateUnits = () => {
    const lastTariffEntry = tariffData[tariffData.length - 1];
    const { lifeline, tier2, tier3, tier4 } = lastTariffEntry;

    const result = calculateUnitsForAmount(amountPaid, lifeline, tier2, tier3, tier4, isFirstPurchaseOfMonth);
    
    setResult(result);

    const rawAmountAfterServiceFee = result.rawAmountAfterServiceFee;
    const infoMessage = rawAmountAfterServiceFee < 0
      ? "Insufficient funds for service fee. Adjust amount."
      : "";

    setInfoMessage(infoMessage);
  };

  const dataWithUnits = tariffData.map((entry) => {
    const { lifeline, tier2, tier3, tier4 } = entry;
    const result = calculateUnitsForAmount(amountPaid, lifeline, tier2, tier3, tier4, isFirstPurchaseOfMonth);
  
    return {
      ...entry,
      lifelineUnits: result.lifelineUnits,
      tier2Units: result.tier2Units,
      tier3Units: result.tier3Units,
      tier4Units: result.tier4Units,
      totalUnits: result.totalUnits,
    };
  });
  

  useEffect(() => {
    calculateUnits();
  }, [amountPaid, isFirstPurchaseOfMonth]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
      {/* Main Section */}
      <Card className="w-full max-w-lg bg-[#FDFDFD] text-[#20210a]">
        <CardHeader className="bg-[#57612f] text-[#fdfdfd] rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">YAKA Units Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="amountPaid" className="text-[#20210a]">Amount Paid (UGX)</Label>
            <Input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              placeholder="Enter amount paid"
              className="bg-[#fdfdfd] border-[#a7b033] text-[#20210a]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFirstPurchaseOfMonth"
              checked={isFirstPurchaseOfMonth}
              onCheckedChange={setIsFirstPurchaseOfMonth}
              className={`${
                isFirstPurchaseOfMonth ? 'bg-[#57612f]' : 'bg-[#a7b033]'
              }`}
            />
            <Label htmlFor="isFirstPurchaseOfMonth" className="text-[#20210a]">First Purchase of the Month</Label>
          </div>
          <Button onClick={calculateUnits} className="w-full bg-[#57612f] text-[#fdfdfd] hover:bg-[#a7b033]">Calculate Units</Button>
      </CardContent>
      </Card>
      <Card className="w-full max-w-lg bg-[#FDFDFD] text-[#20210a]">
      <CardHeader className="bg-[#57612f] text-[#fdfdfd] rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Info Message */}
          {infoMessage && (
                <div className="mt-4 text-yellow-600 font-semibold">
                  {infoMessage}
                </div>
              )}
   
          {result && (<>
            <div className="mt-6 space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-left">18% VAT:</TableCell>
                    <TableCell className="text-right">{result.vatAmount} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">After VAT:</TableCell>
                    <TableCell className="text-right">{result.amountAfterVat} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">After 3,360 UGX Service Fee:</TableCell>
                    <TableCell className="text-right">{result.amountAfterServiceFee} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                  {isFirstPurchaseOfMonth ? (
                      <TableCell className="text-left">Units 0-15 @ 250 UGX:</TableCell>
                    ) : (
                      <TableCell className="text-left">Units 0-15 @ 796.4 UGX:</TableCell>
                    )}
                    <TableCell className="text-right">{result.lifelineUnits}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units 16-80 @ 796.4 UGX each:</TableCell>
                    <TableCell className="text-right">{result.tier2Units}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units 81-150 @ 412.0 UGX each:</TableCell>
                    <TableCell className="text-right">{result.tier3Units}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units 150+ @ 796.4 UGX each:</TableCell>
                    <TableCell className="text-right">{result.tier4Units}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-left">Total Units:</TableCell>
                    <TableCell className="font-bold text-right">{result.totalUnits}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Chart Section */}
      {result && (
        <Card className="w-full max-w-lg bg-[#FDFDFD] text-[#20210a]">
        <CardHeader className="bg-[#57612f] text-[#fdfdfd]  rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">YAKA units trend</CardTitle>
          </CardHeader>
          
        <CardContent className="p-6">
        <CardDescription>The number of units worth {amountPaid.toLocaleString()} UGX tracked  over time</CardDescription>
       
          <ChartContainer config={chartConfigStack}>
            <AreaChart 
            accessibilityLayer
            data={dataWithUnits}
            margin={{
              left: 12,
              right: 12,
            }}
          >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
              dataKey="quarter"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              />
             <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfigStack[name as keyof typeof chartConfigStack]?.label || name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                      </div>
                      {/* Add total after the last item */}
                      {index === 3 && (
                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                          Total
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {item.payload.totalUnits}
                            <span className="font-normal text-muted-foreground">units</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                />
              }
              cursor={false}
            />

              <Area
                type="natural"
                dataKey="lifelineUnits"
                stroke="var(--color-lifelineUnits"
                fill="var(--color-lifelineUnits"
                fillOpacity={0.4}
                stackId="a"
              />
              <Area
                type="natural"
                dataKey="tier2Units"
                stroke="var(--color-tier2Units)"
                fill="var(--color-tier2Units)"
                fillOpacity={0.4}
                stackId="a"
              />
              <Area
                type="natural"
                dataKey="tier3Units"
                stroke="var(--color-tier3Units)"
                fill="var(--color-tier3Units)"
                fillOpacity={0.4}
                stackId="a"
              />
              <Area
                type="natural"
                dataKey="tier4Units"
                stroke="var(--color-tier4Units)"
                fill="var(--color-tier4Units)"
                fillOpacity={0.4}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

export default App;

