import { useState } from 'react'
import './App.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

function App() {
  const [amountPaid, setAmountPaid] = useState<number>(10000)
  const [isFirstPurchaseOfMonth, setIsFirstPurchaseOfMonth] = useState<boolean>(true)
  const [result, setResult] = useState<any>(null)

  const calculateUnits = () => {
    const vatPercentage = 0.18
    const vatAmount = amountPaid * vatPercentage
    const amountAfterVat = amountPaid - vatAmount
    const monthlyServiceFee = isFirstPurchaseOfMonth ? 3360 : 0  // Adjust service fee based on first purchase of the month
    const amountAfterServiceFee = amountAfterVat - monthlyServiceFee
  
    const lifelineUnitPrice = 250
    const tier2Price = 796.4 // 16-80 units
    const tier3Price = 412.0 // 81-150 units
    const tier4Price = 796.4 // Above 150 units
  
    // Lifeline Units
    let remainingAmount = amountAfterServiceFee
    const lifelineUnits = isFirstPurchaseOfMonth
      ? Math.min(15, Math.floor(remainingAmount / lifelineUnitPrice))
      : 0
    remainingAmount -= lifelineUnits * lifelineUnitPrice
  
    // Tier 2 Units (16-80)
    const tier2Units = Math.min(65, Number((remainingAmount / tier2Price).toFixed(2)))
    remainingAmount -= tier2Units * tier2Price
  
    // Tier 3 Units (81-150)
    const tier3Units = remainingAmount > 0
      ? Math.min(70, Number((remainingAmount / tier3Price).toFixed(2)))
      : 0
    remainingAmount -= tier3Units * tier3Price
  
    // Tier 4 Units (Above 150)
    const tier4Units = remainingAmount > 0
      ? Number((remainingAmount / tier4Price).toFixed(2))
      : 0
  
    const totalUnits = lifelineUnits + tier2Units + tier3Units + tier4Units
  
    setResult({
      vatAmount,
      amountAfterVat,
      amountAfterServiceFee,
      lifelineUnits,
      tier2Units,
      tier3Units,
      tier4Units,
      totalUnits
    })
  }
  

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#f5f7eb] text-[#20210a]">
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
        
            {result && (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#20210a]">Results:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-[#20210a] text-left">18% VAT Amount:</div>
          <div className="font-medium text-[#57612f] text-right">{result.vatAmount} UGX</div>

          <div className="text-[#20210a] text-left">Amount After VAT:</div>
          <div className="font-medium text-[#57612f] text-right">{result.amountAfterVat} UGX</div>

          <div className="text-[#20210a] text-left">Amount After Service Fee of 3,360 UGX:</div>
          <div className="font-medium text-[#57612f] text-right">{result.amountAfterServiceFee} UGX</div>

          <div className="text-[#20210a] text-left">Lifeline Units at 250 UGX per unit:</div>
          <div className="font-medium text-[#57612f] text-right">{result.lifelineUnits}</div>

          <div className="text-[#20210a] text-left">Tier 2 Units (16-80):</div>
          <div className="font-medium text-[#57612f] text-right">{result.tier2Units}</div>

          <div className="text-[#20210a] text-left">Tier 3 Units (81-150):</div>
          <div className="font-medium text-[#57612f] text-right">{result.tier3Units}</div>

          <div className="text-[#20210a] text-left">Tier 4 Units (Above 150):</div>
          <div className="font-medium text-[#57612f] text-right">{result.tier4Units}</div>

          <div className="text-lg font-bold text-[#20210a] text-left">Total Units:</div>
          <div className="text-lg font-bold text-[#57612f] text-right">{result.totalUnits.toFixed(2)}</div>
        </div>
      </div>
    )}

      </CardContent>
    </Card>
  )
}

export default App
