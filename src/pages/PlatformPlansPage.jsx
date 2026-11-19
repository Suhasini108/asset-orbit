import React, { useState } from 'react';
import {
  Check,
  CreditCard,
  Sparkles,
  Zap,
  Building,
  CheckCircle2,
  X,
  Shield,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PLATFORM_PRICING_PLANS } from '../data/collegeSampleData';
import confetti from 'canvas-confetti';

export default function PlatformPlansPage() {
  const { platformSubscription, upgradePlatformPlan } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [billingCycle, setBillingCycle] = useState(platformSubscription.billingCycle || 'yearly');
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleOpenCheckout = (plan) => {
    if (isAuditor) {
      alert('Auditor account has read-only access. Switch role to Super Admin to modify platform plan.');
      return;
    }
    setCheckoutPlan(plan);
    setCheckoutSuccess(false);
  };

  const handleConfirmPayment = () => {
    if (!checkoutPlan) return;
    upgradePlatformPlan(checkoutPlan.id, billingCycle, currentUser.name);
    setCheckoutSuccess(true);
    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}
    setTimeout(() => {
      setCheckoutPlan(null);
      setCheckoutSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Institutional &amp; Enterprise Tiers</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AssetOrbit Platform Subscription Plans
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scale your IT asset inventory, college lab floorplans, live SLA monitoring, and shadow IT defense with transparent institutional pricing.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center space-x-3">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 rounded-full bg-brand-500 p-1 transition-colors relative"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center space-x-1.5 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            <span>Yearly</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLATFORM_PRICING_PLANS.map((plan) => {
          const isCurrent = platformSubscription.planId === plan.id;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 transition-all flex flex-col justify-between relative bg-white dark:bg-slate-900 border ${
                plan.popular
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-2xl dark:shadow-brand-500/10'
                  : 'border-slate-200 dark:border-slate-800 shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-[#315F50] text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                  Most Popular for Colleges
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      Current Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-6">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Billed annually (includes 20% institutional discount)
                    </p>
                  )}
                </div>

                {/* Benefits List */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  disabled={isCurrent}
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default shadow-none'
                      : plan.popular
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name.split('/')[0]}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Comprehensive Capability Comparison
          </h3>
          <p className="text-xs text-slate-500">
            Compare limits, SLA guarantees, data retention, and security modules across tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Feature &amp; Metric</th>
                <th className="py-3 px-4">College Lab / Starter</th>
                <th className="py-3 px-4 text-brand-600 dark:text-brand-400">Department / Pro</th>
                <th className="py-3 px-4">University / Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Asset Tracking Limit</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">Up to 150 Assets</td>
                <td className="py-3.5 px-4 font-bold text-brand-600 dark:text-brand-400">Up to 1,500 Assets</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Unlimited Assets</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">RBAC User Accounts</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">5 Users</td>
                <td className="py-3.5 px-4 font-bold text-brand-600 dark:text-brand-400">25 Users</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Unlimited Users</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">College Lab Bench Visualizer</td>
                <td className="py-3.5 px-4 text-slate-400">Basic Grid</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">Full Interactive Matrix</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">Multi-Campus Floorplans</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Live SLA Timers &amp; Escalation</td>
                <td className="py-3.5 px-4 text-slate-400">❌</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">✔ (Live Countdowns)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">✔ (Multi-tier SLA)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Shadow IT Detection Sentinel</td>
                <td className="py-3.5 px-4 text-slate-400">❌</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">✔ (Log &amp; Feed Analysis)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">✔ (Real-Time API Agent)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">E-Waste &amp; NIST 800-88 Data Wiping</td>
                <td className="py-3.5 px-4 text-slate-400">Basic Log</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Checklist Tracking</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">✔ (Certified PDF Exports)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Automated Data Backups</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">Manual JSON Export</td>
                <td className="py-3.5 px-4 font-bold text-brand-600">Weekly Scheduled</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Daily Auto + On-Demand</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Checkout Modal with Invoice Generation */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Institutional Plan Checkout
                </h3>
              </div>
              <button onClick={() => setCheckoutPlan(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {checkoutSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Subscription Upgraded Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your institution is now on the {checkoutPlan.name} tier with full entitlements active. Invoice #INV-AO-{Date.now().toString().slice(-6)} generated.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {checkoutPlan.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Billed {billingCycle} • Automatic renewal
                      </p>
                    </div>
                    <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                      ${billingCycle === 'yearly' ? checkoutPlan.priceYearly : checkoutPlan.priceMonthly}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Authorized Billing Officer:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Payment Method:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">College Purchase Order (P.O. Net 30) / Stripe</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleConfirmPayment}
                      className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm &amp; Activate Plan</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
