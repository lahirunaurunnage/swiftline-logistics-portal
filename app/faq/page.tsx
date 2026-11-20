
'use client';

import { useState } from 'react';
import PublicShell from '../components/PublicShell';

const FAQS = [
  {
    q: 'How does the $99 QC inspection work?',
    a: 'You simply book through our dashboard, pay securely via Stripe, and our certified inspector on the factory floor conducts a thorough audit within 48 hours.',
  },
  {
    q: 'Do I need to talk to an agent to route my parcels?',
    a: 'No! Our platform is built entirely for self-service. You configure, pay, and track your shipments directly from your personal portal.',
  },
  {
    q: 'How secure are my online payments?',
    a: 'All transactions are processed through Stripe with enterprise-grade PCI-DSS Level 1 security encryption.',
  },
  {
    q: 'Where are your physical warehouse hubs located?',
    a: 'We operate primary operational hubs in Guangzhou (China), Dubai (UAE), and Colombo (Sri Lanka).',
  },
];

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <PublicShell>
      <section className="py-24 bg-white min-h-[75vh]">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Common Questions</h2>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900">Everything you need to know</h1>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full p-6 text-left font-bold text-slate-900 flex justify-between items-center cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-indigo-600 text-xl font-mono">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-4 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}