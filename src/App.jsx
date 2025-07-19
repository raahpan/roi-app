import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function InvestmentPage({ onContinue }) {
  const [cifValue, setCifValue] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [kitCost, setKitCost] = useState(0);

  const investment = cifValue * 1000000 * exchangeRate;
  const duties = kitCost * 0.274;
  const landedCost = kitCost + duties;
  const consumableINR = landedCost * exchangeRate;

  const handleContinue = () => {
    if (typeof onContinue === 'function') {
      onContinue({ investment, consumableINR });
    } else {
      console.error("onContinue is not a function");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white text-black dark:bg-gray-900 dark:text-white">
      <div>
        <Label className="text-lg font-bold">System Investment Details</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CIF Value (in Million USD)</Label>
          <Input
            type="number"
            value={cifValue}
            onChange={(e) => setCifValue(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Exchange Rate (INR)</Label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Investment in INR</Label>
          <Input type="text" value={investment ? investment.toLocaleString("en-IN") : 0} readOnly />
        </div>
        <div>
          <Label>Kit Cost (in USD)</Label>
          <Input
            type="number"
            value={kitCost}
            onChange={(e) => setKitCost(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Duties & Taxes (27.4%) in USD</Label>
          <Input type="text" value={duties.toFixed(2)} readOnly />
        </div>
        <div>
          <Label>Landed Kit Cost in USD</Label>
          <Input type="text" value={landedCost.toFixed(2)} readOnly />
        </div>
        <div>
          <Label>Consumables Cost per Procedure (INR)</Label>
          <Input type="text" value={consumableINR ? consumableINR.toLocaleString("en-IN") : 0} readOnly />
        </div>
      </div>
      <div className="pt-6 text-center">
        <button
          className="bg-[#1d3a72] text-white font-semibold px-6 py-2 rounded hover:bg-[#163063]"
          onClick={handleContinue}
        >
          START
        </button>
      </div>
    </div>
  );
}

function RoiResults({ investment, consumableINR }) {
  const [monthlyProcedures, setMonthlyProcedures] = useState(0);
  const [billingPerProcedure, setBillingPerProcedure] = useState(0);

  const procedureData = [];
  const annualCashFlows = [];
  let totalRevenue = 0;
  let totalConsumables = 0;
  let totalProfit = 0;
  let breakEvenMonth = null;

  for (let year = 1; year <= 5; year++) {
    const annualProcedures = monthlyProcedures * 12 * year;
    const revenue = annualProcedures * billingPerProcedure;
    const consumables = annualProcedures * consumableINR;
    const cmc = year >= 2 ? 11800000 : 0;
    const profit = revenue - consumables - cmc;

    totalRevenue += revenue;
    totalConsumables += consumables;
    totalProfit += profit;

    procedureData.push({
      year,
      procedures: annualProcedures,
      revenue,
      consumables,
      cmc,
      profit,
    });

    const cashFlow = year === 1 ? -investment + profit : profit;
    annualCashFlows.push(cashFlow);
  }

  const computeIRR = (cashflows) => {
    const maxIteration = 1000;
    const precision = 1e-6;
    let rate = 0.1;

    for (let i = 0; i < maxIteration; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cashflows.length; t++) {
        npv += cashflows[t] / Math.pow(1 + rate, t);
        dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
      }
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < precision) return newRate;
      rate = newRate;
    }
    return rate;
  };

  const irrValue = computeIRR(annualCashFlows) * 100;
  const totalOutflow = investment + (11800000 * 4);

  return (
    <div className="p-6 space-y-6 relative bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Monthly Procedures (Year 1)</Label>
          <Input
            type="number"
            value={monthlyProcedures}
            onChange={(e) => setMonthlyProcedures(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Billing per Procedure (INR)</Label>
          <Input
            type="number"
            value={billingPerProcedure}
            onChange={(e) => setBillingPerProcedure(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="pt-6">
        <table className="w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-[#1d3a72] text-white dark:bg-[#2b4a91]">
            <tr>
              <th className="p-2">Year</th>
              <th>Procedures</th>
              <th>Total Revenue (INR)</th>
              <th>Total Consumables (INR)</th>
              <th>CMC (INR)</th>
              <th>Net Profit (INR)</th>
            </tr>
          </thead>
          <tbody>
            {procedureData.map((row) => (
              <tr key={row.year} className="text-center border-t border-gray-300 dark:border-gray-600">
                <td className="p-2 font-semibold">{row.year}</td>
                <td>{row.procedures}</td>
                <td>{row.revenue.toLocaleString("en-IN")}</td>
                <td>{row.consumables.toLocaleString("en-IN")}</td>
                <td>{row.cmc.toLocaleString("en-IN")}</td>
                <td>{row.profit.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr className="font-bold border-t bg-gray-100 dark:bg-gray-800 text-center">
              <td className="p-2">TOTAL</td>
              <td>{procedureData.reduce((sum, row) => sum + row.procedures, 0)}</td>
              <td>{totalRevenue.toLocaleString("en-IN")}</td>
              <td>{totalConsumables.toLocaleString("en-IN")}</td>
              <td>{(11800000 * 4).toLocaleString("en-IN")}</td>
              <td>{totalProfit.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pt-4 text-center text-md">
        <div><strong>INFLOW in 5 Years:</strong> ₹ {totalRevenue.toLocaleString("en-IN")}</div>
        <div className="mt-2"><strong>OUTFLOW in 5 Years:</strong> ₹ {totalOutflow.toLocaleString("en-IN")} (Includes CIF + CMC)</div>
      </div>

      <div className="pt-4 text-center text-md">
        <div><strong>IRR:</strong> {irrValue.toFixed(2)}%</div>
        <div className="pt-2"><strong>Net Profit in 5 Years:</strong> ₹ {totalProfit.toLocaleString("en-IN")}</div>
      </div>

      <div className="absolute bottom-2 right-4 text-xs text-gray-500">
        Powered by Vattikuti Technologies
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [investmentData, setInvestmentData] = useState(null);

  useEffect(() => {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
}, []);

  return (
  <div className="max-w-4xl mx-auto p-6 bg-white text-black dark:bg-gray-900 dark:text-white">
      {step === 1 && (
        <InvestmentPage onContinue={(data) => {
          setInvestmentData(data);
          setStep(2);
        }} />
      )}
      {step === 2 && investmentData && (
        <RoiResults
          investment={investmentData.investment}
          consumableINR={investmentData.consumableINR}
        />
      )}
    </div>
  );
}
