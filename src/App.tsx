import { useState, useEffect } from 'react';
import './App.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import tariffData from './tariffData.ts';
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, } from "@/components/ui/table";
import { Captions } from 'lucide-react';

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
    const vatAmount = amountPaid * vatPercentage
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

  const calculateHistoryUnits = (amount: number, tariffs: any) => {
    const { lifeline, tier2, tier3, tier4 } = tariffs;
    return calculateUnitsForAmount(amount, lifeline, tier2, tier3, tier4).totalUnits;
  };

  const dataWithUnits = tariffData.map((entry) => ({
    ...entry,
    totalUnits: calculateHistoryUnits(amountPaid, entry),
  }));

  useEffect(() => {
    calculateUnits();
  }, [amountPaid, isFirstPurchaseOfMonth]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
      {/* Main Section */}
      <Card className="w-full max-w-lg bg-[#FDFDFD] text-[#20210a]">
        <CardHeader className="bg-[#57612f] text-[#fdfdfd]">
          <CardTitle className="text-2xl font-bold text-center">YAKA Electrical Units Calculator</CardTitle>
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
              className="bg-[#a7b033]"
            />
            <Label htmlFor="isFirstPurchaseOfMonth" className="text-[#20210a]">First Purchase of the Month</Label>
          </div>
          <Button onClick={calculateUnits} className="w-full bg-[#57612f] text-[#fdfdfd] hover:bg-[#a7b033]">Calculate Units</Button>
   
          {/* Info Message */}
          {infoMessage && (
                <div className="mt-4 text-yellow-600 font-semibold">
                  {infoMessage}
                </div>
              )}
   
          {result && (<>
            <div className="mt-6 space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell colSpan={2} className="text-lg font-semibold text-[#20210a]">Results:</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-left">18% VAT:</TableCell>
                    <TableCell className="text-right">{result.vatAmount} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Amount after VAT:</TableCell>
                    <TableCell className="text-right">{result.amountAfterVat} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Amount after 3,360 UGX Service Fee:</TableCell>
                    <TableCell className="text-right">{result.amountAfterServiceFee} UGX</TableCell>
                  </TableRow>
                  <TableRow>
                  {isFirstPurchaseOfMonth ? (
                      <TableCell className="text-left">Units between 0-15 at 250 UGX:</TableCell>
                    ) : (
                      <TableCell className="text-left">Units between 0-15 at 796.4 UGX:</TableCell>
                    )}
                    <TableCell className="text-right">{result.lifelineUnits}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units between 16-80 at 796.4 UGX each:</TableCell>
                    <TableCell className="text-right">{result.tier2Units}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units between 81-150 at 412.0 UGX each:</TableCell>
                    <TableCell className="text-right">{result.tier3Units}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left">Units above 150 at 796.4 UGX each:</TableCell>
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
        <Card className="w-full max-w-lg bg-[#FDFDFD] text-[#20210a] mt-8">
        <CardHeader className="bg-[#57612f] text-[#fdfdfd]">
          <CardTitle className="text-2xl font-bold text-center">Value of {amountPaid.toLocaleString()} UGX in Units Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dataWithUnits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-md text-sm">
                        <p className="font-bold">{data.quarter}</p>
                        <p>Total Units: {data.totalUnits.toFixed(2)}</p>
                        <p>Lifeline Tariff: {data.lifeline} UGX</p>
                        <p>Tier 2 Tariff: {data.tier2} UGX</p>
                        <p>Tier 3 Tariff: {data.tier3} UGX</p>
                        <p>Tier 4 Tariff: {data.tier4} UGX</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="totalUnits"
                stroke="#57612f"
                fill="#a7b033"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

export default App;
